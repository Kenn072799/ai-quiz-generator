using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services;

public class GroqService(
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache)
{
    private const string GroqBaseUrl = "https://api.groq.com/openai/v1/chat/completions";

    private string ApiKey => configuration["Groq:ApiKey"]!;
    private string Model => configuration["Groq:Model"] ?? "llama3-8b-8192";

    // ── Topic Extraction ───────────────────────────────────────────────────────
    public async Task<List<string>> ExtractTopicsAsync(List<string> chunks)
    {
        // Combine up to first 2 chunks to stay within token limits
        var combinedText = string.Join("\n\n", chunks.Take(2));

        var systemPrompt = """
            You are an expert document analyzer.
            Your task is to extract the main study topics from the provided document content.
            Rules:
            - Return ONLY a JSON array of topic name strings
            - Extract 3 to 8 major topics
            - Topics must be concise (2-6 words each)
            - Topics must be directly based on the document content
            - Do NOT add topics that are not in the document
            - Do NOT include explanations, only the JSON array
            Example output: ["Supervised Learning", "Neural Networks", "Gradient Descent"]
            """;

        var userPrompt = $"Extract the main study topics from this document content:\n\n{combinedText}";

        var response = await CallGroqAsync(systemPrompt, userPrompt);

        // Parse JSON array from response
        try
        {
            var json = ExtractJsonArray(response);
            var topics = JsonSerializer.Deserialize<List<string>>(json) ?? [];
            return topics.Where(t => !string.IsNullOrWhiteSpace(t)).Take(8).ToList();
        }
        catch
        {
            // Fallback: split by newlines if JSON parse fails
            return response.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim().Trim('"', '-', '*', ' '))
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Take(8)
                .ToList();
        }
    }

    // ── Quiz Generation ────────────────────────────────────────────────────────
    public async Task<string> GenerateQuizJsonAsync(
        string topicName,
        string contextText,
        string difficulty,
        string language)
    {
        var systemPrompt =
            $"You are an expert educational AI tutor and quiz generator.\n" +
            $"Generate exactly 10 multiple-choice questions based ONLY on the provided content.\n" +
            $"Education level: {difficulty} — adjust vocabulary and complexity accordingly.\n" +
            $"Language: {language} — write ALL content in {language}.\n" +
            "Rules:\n" +
            "- Each question must have exactly 4 options: A, B, C, D\n" +
            "- Only one option must be correct\n" +
            "- Provide a clear explanation for the correct answer\n" +
            "- Do NOT invent information outside the provided content\n" +
            "- Return STRICTLY valid JSON in this exact format:\n" +
            "{\"questions\":[{\"question\":\"...\",\"optionA\":\"...\",\"optionB\":\"...\",\"optionC\":\"...\",\"optionD\":\"...\",\"correctAnswer\":\"A\",\"explanation\":\"...\"}]}";

        var userPrompt = $"Topic: {topicName}\n\nDocument content:\n{contextText}";

        return await CallGroqAsync(systemPrompt, userPrompt);
    }

    // ── Study Summary ──────────────────────────────────────────────────────────
    public async Task<string> GenerateSummaryAsync(
        string topicName,
        string contextText,
        string difficulty,
        string language)
    {
        var systemPrompt =
            $"You are an expert educational AI tutor.\n" +
            $"Generate a concise study summary for the given topic.\n" +
            $"Education level: {difficulty}\n" +
            $"Language: {language}\n" +
            "Rules:\n" +
            "- Write 3 to 5 bullet points\n" +
            "- Keep each bullet point short and clear\n" +
            "- Focus on the most important concepts\n" +
            $"- Use vocabulary appropriate for {difficulty} level\n" +
            $"- Write everything in {language}\n" +
            "- Return plain text bullet points only (no JSON, no markdown headers)";

        var userPrompt = $"Topic: {topicName}\n\nContent:\n{contextText}";

        return await CallGroqAsync(systemPrompt, userPrompt);
    }

    // ── Flashcard Generation ───────────────────────────────────────────────────
    public async Task<string> GenerateFlashcardsJsonAsync(
        string topicName,
        string contextText,
        string language)
    {
        var systemPrompt =
            $"You are an expert educational AI tutor.\n" +
            $"Generate flashcards for the given topic based on the document content.\n" +
            $"Language: {language}\n" +
            "Rules:\n" +
            "- Generate 5 to 10 flashcards\n" +
            "- Each flashcard has a short question and a concise answer\n" +
            "- Base all content ONLY on the provided document\n" +
            $"- Write everything in {language}\n" +
            "- Return STRICTLY valid JSON in this exact format:\n" +
            "{\"flashcards\":[{\"question\":\"...\",\"answer\":\"...\"}]}";

        var userPrompt = $"Topic: {topicName}\n\nContent:\n{contextText}";

        return await CallGroqAsync(systemPrompt, userPrompt);
    }

    // ── Core HTTP call ─────────────────────────────────────────────────────────
    private async Task<string> CallGroqAsync(string systemPrompt, string userPrompt)
    {
        // Build a stable cache key from the exact prompts + model
        var cacheKey = "groq:" + Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(Model + systemPrompt + userPrompt)));

        if (cache.TryGetValue(cacheKey, out string? cached))
            return cached!;

        var client = httpClientFactory.CreateClient("Groq");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ApiKey);

        var requestBody = new
        {
            model = Model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            temperature = 0.3,
            max_tokens = 2048,
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(GroqBaseUrl, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException($"Groq API error {response.StatusCode}: {responseBody}");

        using var doc = JsonDocument.Parse(responseBody);
        var result = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;

        // Cache for 24 hours — same document+topic+settings always produces equivalent content
        cache.Set(cacheKey, result, TimeSpan.FromHours(24));

        return result;
    }

    // ── Helper: pull first JSON array or object out of a string ───────────────
    private static string ExtractJsonArray(string text)
    {
        var start = text.IndexOf('[');
        var end = text.LastIndexOf(']');
        if (start >= 0 && end > start)
            return text[start..(end + 1)];
        return text;
    }
}

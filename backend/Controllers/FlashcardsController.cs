using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/flashcards")]
[Authorize]
public class FlashcardsController(
    AppDbContext db,
    DocumentService documentService,
    GroqService groqService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

    private string UserLanguage =>
        User.FindFirstValue("language") ?? "English";

    // POST /api/flashcards/generate/:topicId
    // Generates flashcards using Groq AI and saves them
    [HttpPost("generate/{topicId:int}")]
    public async Task<IActionResult> GenerateFlashcards(int topicId)
    {
        var topic = await db.Topics
            .Include(t => t.Document)
            .FirstOrDefaultAsync(t =>
                t.Id == topicId && t.Document.UserId == CurrentUserId);

        if (topic is null)
            return NotFound(new { message = "Topic not found." });

        // If flashcards already exist, return them
        var existing = await db.Flashcards
            .Where(f => f.TopicId == topicId)
            .ToListAsync();

        if (existing.Count > 0)
        {
            return Ok(MapResponse(topic, existing));
        }

        // Extract text
        string rawText;
        try { rawText = documentService.ExtractText(topic.Document); }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to read document: {ex.Message}" });
        }

        if (string.IsNullOrWhiteSpace(rawText))
            return BadRequest(new { message = "Document appears to be empty." });

        var chunks = documentService.ChunkText(rawText);
        var contextText = string.Join("\n\n", chunks.Take(2));

        // Call Groq AI
        string aiJson;
        try
        {
            aiJson = await groqService.GenerateFlashcardsJsonAsync(
                topic.TopicName, contextText, UserLanguage);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { message = $"AI service error: {ex.Message}" });
        }

        // Parse JSON
        List<Flashcard> flashcards;
        try
        {
            flashcards = ParseFlashcardsJson(aiJson, topicId);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { message = $"Failed to parse AI response: {ex.Message}" });
        }

        if (flashcards.Count == 0)
            return StatusCode(502, new { message = "AI returned no flashcards. Please try again." });

        db.Flashcards.AddRange(flashcards);
        await db.SaveChangesAsync();

        return Ok(MapResponse(topic, flashcards));
    }

    // GET /api/flashcards/topic/:topicId
    // Returns existing flashcards for a topic
    [HttpGet("topic/{topicId:int}")]
    public async Task<IActionResult> GetFlashcards(int topicId)
    {
        var topic = await db.Topics
            .Include(t => t.Document)
            .Include(t => t.Flashcards)
            .FirstOrDefaultAsync(t =>
                t.Id == topicId && t.Document.UserId == CurrentUserId);

        if (topic is null)
            return NotFound(new { message = "Topic not found." });

        return Ok(MapResponse(topic, topic.Flashcards.ToList()));
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    private static FlashcardsResponseDto MapResponse(Topic topic, List<Flashcard> cards) =>
        new()
        {
            TopicId = topic.Id,
            TopicName = topic.TopicName,
            DocumentName = topic.Document.FileName,
            Flashcards = cards.Select(f => new FlashcardDto
            {
                Id = f.Id,
                Question = f.Question,
                Answer = f.Answer,
            }).ToList(),
        };

    private static List<Flashcard> ParseFlashcardsJson(string json, int topicId)
    {
        // Strip markdown code fences
        json = json.Trim();
        if (json.StartsWith("```"))
        {
            var firstNewline = json.IndexOf('\n');
            var lastFence = json.LastIndexOf("```");
            if (firstNewline >= 0 && lastFence > firstNewline)
                json = json[(firstNewline + 1)..lastFence].Trim();
        }

        var objStart = json.IndexOf('{');
        var objEnd = json.LastIndexOf('}');
        if (objStart >= 0 && objEnd > objStart)
            json = json[objStart..(objEnd + 1)];

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        JsonElement cardsEl;
        if (!root.TryGetProperty("flashcards", out cardsEl))
            cardsEl = root;

        return cardsEl.EnumerateArray()
            .Select(item => new Flashcard
            {
                TopicId = topicId,
                Question = item.TryGetProperty("question", out var q) ? q.GetString() ?? "" : "",
                Answer = item.TryGetProperty("answer", out var a) ? a.GetString() ?? "" : "",
            })
            .Where(f => !string.IsNullOrWhiteSpace(f.Question))
            .Take(10)
            .ToList();
    }
}

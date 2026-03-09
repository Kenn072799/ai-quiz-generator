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
[Route("api/quiz")]
[Authorize]
public class QuizController(
    AppDbContext db,
    DocumentService documentService,
    GroqService groqService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

    private string UserLanguage =>
        User.FindFirstValue("language") ?? "English";

    private string UserEducationLevel =>
        User.FindFirstValue("educationLevel") ?? "College";

    // POST /api/quiz/generate/:topicId
    // Generates a new quiz using Groq AI, saves questions, returns quiz id
    [HttpPost("generate/{topicId:int}")]
    public async Task<IActionResult> GenerateQuiz(int topicId)
    {
        // Verify topic exists and belongs to the current user's document
        var topic = await db.Topics
            .Include(t => t.Document)
            .FirstOrDefaultAsync(t =>
                t.Id == topicId && t.Document.UserId == CurrentUserId);

        if (topic is null)
            return NotFound(new { message = "Topic not found." });

        // ── DB-level cache: reuse an existing quiz for same topic+difficulty+language ──
        var existingQuiz = await db.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q =>
                q.TopicId == topicId &&
                q.Difficulty == UserEducationLevel &&
                q.Language == UserLanguage);

        if (existingQuiz is not null && existingQuiz.Questions.Count > 0)
        {
            return Ok(new GenerateQuizResponseDto
            {
                QuizId = existingQuiz.Id,
                TopicName = topic.TopicName,
                Difficulty = existingQuiz.Difficulty,
                Language = existingQuiz.Language,
                QuestionCount = existingQuiz.Questions.Count,
            });
        }

        // Extract and chunk text from the source document
        string rawText;
        try
        {
            rawText = documentService.ExtractText(topic.Document);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to read document: {ex.Message}" });
        }

        if (string.IsNullOrWhiteSpace(rawText))
            return BadRequest(new { message = "Document appears to be empty or unreadable." });

        // Use first 2 chunks for context to stay within token limits
        var chunks = documentService.ChunkText(rawText);
        var contextText = string.Join("\n\n", chunks.Take(2));

        // Call Groq AI to generate quiz JSON
        string aiJson;
        try
        {
            aiJson = await groqService.GenerateQuizJsonAsync(
                topic.TopicName, contextText, UserEducationLevel, UserLanguage);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { message = $"AI service error: {ex.Message}" });
        }

        // Parse and validate AI response
        List<QuizQuestionRaw> questionRaws;
        try
        {
            questionRaws = ParseQuizJson(aiJson);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { message = $"Failed to parse AI response: {ex.Message}" });
        }

        if (questionRaws.Count == 0)
            return StatusCode(502, new { message = "AI returned no questions. Please try again." });

        // Persist quiz and questions
        var quiz = new Quiz
        {
            TopicId = topicId,
            Difficulty = UserEducationLevel,
            Language = UserLanguage,
            CreatedAt = DateTime.UtcNow,
        };

        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync(); // get quiz.Id

        var questions = questionRaws
            .Take(10)
            .Select((q, i) => new Question
            {
                QuizId = quiz.Id,
                QuestionText = q.Question,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectAnswer = q.CorrectAnswer.ToUpperInvariant(),
                Explanation = q.Explanation,
                OrderIndex = i,
            })
            .ToList();

        db.Questions.AddRange(questions);
        await db.SaveChangesAsync();

        return Ok(new GenerateQuizResponseDto
        {
            QuizId = quiz.Id,
            TopicName = topic.TopicName,
            Difficulty = quiz.Difficulty,
            Language = quiz.Language,
            QuestionCount = questions.Count,
        });
    }

    // GET /api/quiz/:quizId
    // Returns quiz with questions — correct answers are NOT exposed
    [HttpGet("{quizId:int}")]
    public async Task<IActionResult> GetQuiz(int quizId)
    {
        var quiz = await db.Quizzes
            .Include(q => q.Topic)
                .ThenInclude(t => t.Document)
            .Include(q => q.Questions)
            .Include(q => q.QuizAttempts.Where(a => a.UserId == CurrentUserId))
            .FirstOrDefaultAsync(q => q.Id == quizId
                && q.Topic.Document.UserId == CurrentUserId);

        if (quiz is null)
            return NotFound(new { message = "Quiz not found." });

        var attemptNumber = quiz.QuizAttempts.Count + 1;

        return Ok(new ActiveQuizDto
        {
            Id = quiz.Id,
            TopicName = quiz.Topic.TopicName,
            DocumentName = quiz.Topic.Document.FileName,
            Difficulty = quiz.Difficulty,
            Language = quiz.Language,
            AttemptNumber = attemptNumber,
            Questions = quiz.Questions
                .OrderBy(q => q.OrderIndex)
                .Select(q => new QuestionDto
                {
                    Id = q.Id,
                    OrderIndex = q.OrderIndex,
                    QuestionText = q.QuestionText,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                })
                .ToList(),
        });
    }

    // POST /api/quiz/:quizId/submit
    // Submits answers, saves the attempt, and returns full results with explanations
    [HttpPost("{quizId:int}/submit")]
    public async Task<IActionResult> SubmitQuiz(int quizId, [FromBody] SubmitQuizDto dto)
    {
        var quiz = await db.Quizzes
            .Include(q => q.Topic)
                .ThenInclude(t => t.Document)
            .Include(q => q.Questions)
            .Include(q => q.QuizAttempts.Where(a => a.UserId == CurrentUserId))
            .FirstOrDefaultAsync(q => q.Id == quizId
                && q.Topic.Document.UserId == CurrentUserId);

        if (quiz is null)
            return NotFound(new { message = "Quiz not found." });

        // Map submitted answers by questionId for O(1) lookup
        var answerMap = dto.Answers
            .GroupBy(a => a.QuestionId)
            .ToDictionary(g => g.Key, g => g.First().SelectedAnswer.ToUpperInvariant());

        var results = quiz.Questions
            .OrderBy(q => q.OrderIndex)
            .Select(q =>
            {
                var selected = answerMap.GetValueOrDefault(q.Id, "");
                return new QuestionResultDto
                {
                    QuestionId = q.Id,
                    QuestionText = q.QuestionText,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    SelectedAnswer = selected,
                    CorrectAnswer = q.CorrectAnswer,
                    IsCorrect = selected == q.CorrectAnswer,
                    Explanation = q.Explanation,
                };
            })
            .ToList();

        var score = results.Count(r => r.IsCorrect);
        var attemptNumber = quiz.QuizAttempts.Count + 1;

        var attempt = new QuizAttempt
        {
            QuizId = quizId,
            UserId = CurrentUserId,
            Score = score,
            TotalQuestions = quiz.Questions.Count,
            AttemptNumber = attemptNumber,
            CompletedAt = DateTime.UtcNow,
        };

        db.QuizAttempts.Add(attempt);
        await db.SaveChangesAsync();

        return Ok(new QuizResultDto
        {
            QuizId = quizId,
            AttemptId = attempt.Id,
            TopicId = quiz.TopicId,
            TopicName = quiz.Topic.TopicName,
            Score = score,
            TotalQuestions = quiz.Questions.Count,
            AttemptNumber = attemptNumber,
            Results = results,
        });
    }

    // GET /api/quiz/history
    // Returns all quiz attempts for the current user
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var attempts = await db.QuizAttempts
            .Include(a => a.Quiz)
                .ThenInclude(q => q.Topic)
                    .ThenInclude(t => t.Document)
            .Where(a => a.UserId == CurrentUserId)
            .OrderByDescending(a => a.CompletedAt)
            .Take(50)
            .Select(a => new QuizHistoryDto
            {
                QuizId = a.QuizId,
                AttemptId = a.Id,
                TopicName = a.Quiz.Topic.TopicName,
                DocumentName = a.Quiz.Topic.Document.FileName,
                Score = a.Score,
                TotalQuestions = a.TotalQuestions,
                AttemptNumber = a.AttemptNumber,
                CompletedAt = a.CompletedAt,
            })
            .ToListAsync();

        return Ok(attempts);
    }

    // GET /api/quiz/progress
    // Returns per-topic progress for the current user
    [HttpGet("progress")]
    public async Task<IActionResult> GetProgress()
    {
        var attempts = await db.QuizAttempts
            .Include(a => a.Quiz)
                .ThenInclude(q => q.Topic)
                    .ThenInclude(t => t.Document)
            .Where(a => a.UserId == CurrentUserId && a.TotalQuestions > 0)
            .ToListAsync();

        var progress = attempts
            .GroupBy(a => a.Quiz.TopicId)
            .Select(g =>
            {
                var best = g.MaxBy(a => a.Score)!;
                return new TopicProgressDto
                {
                    TopicId = g.Key,
                    TopicName = best.Quiz.Topic.TopicName,
                    DocumentName = best.Quiz.Topic.Document.FileName,
                    BestScore = best.Score,
                    TotalQuestions = best.TotalQuestions,
                    AttemptCount = g.Count(),
                };
            })
            .OrderBy(p => p.BestPercentage)
            .ToList();

        return Ok(progress);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    private static List<QuizQuestionRaw> ParseQuizJson(string json)
    {
        // Strip markdown code fences if present
        json = json.Trim();
        if (json.StartsWith("```"))
        {
            var firstNewline = json.IndexOf('\n');
            var lastFence = json.LastIndexOf("```");
            if (firstNewline >= 0 && lastFence > firstNewline)
                json = json[(firstNewline + 1)..lastFence].Trim();
        }

        // Find the JSON object
        var objStart = json.IndexOf('{');
        var objEnd = json.LastIndexOf('}');
        if (objStart >= 0 && objEnd > objStart)
            json = json[objStart..(objEnd + 1)];

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // Support both { "questions": [...] } and direct array [...]
        JsonElement questionsEl;
        if (root.TryGetProperty("questions", out questionsEl))
        { /* already set */ }
        else
        {
            questionsEl = root;
        }

        var results = new List<QuizQuestionRaw>();
        foreach (var item in questionsEl.EnumerateArray())
        {
            var q = new QuizQuestionRaw
            {
                Question = GetString(item, "question"),
                OptionA = GetString(item, "optionA"),
                OptionB = GetString(item, "optionB"),
                OptionC = GetString(item, "optionC"),
                OptionD = GetString(item, "optionD"),
                CorrectAnswer = GetString(item, "correctAnswer"),
                Explanation = GetString(item, "explanation"),
            };

            if (!string.IsNullOrWhiteSpace(q.Question) &&
                !string.IsNullOrWhiteSpace(q.CorrectAnswer))
            {
                results.Add(q);
            }
        }

        return results;
    }

    private static string GetString(JsonElement el, string property) =>
        el.TryGetProperty(property, out var val) ? val.GetString() ?? "" : "";

    private record QuizQuestionRaw(
        string Question = "",
        string OptionA = "",
        string OptionB = "",
        string OptionC = "",
        string OptionD = "",
        string CorrectAnswer = "",
        string Explanation = "");
}

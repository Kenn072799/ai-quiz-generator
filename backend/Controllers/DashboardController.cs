using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(AppDbContext db) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

    // GET /api/dashboard
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = CurrentUserId;

        var attempts = await db.QuizAttempts
            .Include(a => a.Quiz)
                .ThenInclude(q => q.Topic)
                    .ThenInclude(t => t.Document)
            .Where(a => a.UserId == userId && a.TotalQuestions > 0)
            .ToListAsync();

        var documentsCount = await db.Documents
            .CountAsync(d => d.UserId == userId);

        var topicsStudied = attempts.Select(a => a.Quiz.TopicId).Distinct().Count();

        var averageScore = attempts.Count > 0
            ? Math.Round(attempts.Average(a => (double)a.Score / a.TotalQuestions * 100), 1)
            : 0;

        // Weak topics: best attempt < 70% and at least 1 attempt
        var weakTopics = attempts
            .GroupBy(a => a.Quiz.TopicId)
            .Select(g =>
            {
                var best = g.MaxBy(a => (double)a.Score / a.TotalQuestions);
                var pct = best!.TotalQuestions > 0
                    ? Math.Round((double)best.Score / best.TotalQuestions * 100, 1)
                    : 0;
                return new WeakTopicDto
                {
                    TopicId = g.Key,
                    TopicName = best.Quiz.Topic.TopicName,
                    DocumentName = best.Quiz.Topic.Document.FileName,
                    BestPercentage = pct,
                };
            })
            .Where(t => t.BestPercentage < 70)
            .OrderBy(t => t.BestPercentage)
            .Take(5)
            .ToList();

        var recent = attempts
            .OrderByDescending(a => a.CompletedAt)
            .Take(5)
            .Select(a => new RecentAttemptDto
            {
                QuizId = a.QuizId,
                AttemptId = a.Id,
                TopicName = a.Quiz.Topic.TopicName,
                Score = a.Score,
                TotalQuestions = a.TotalQuestions,
                CompletedAt = a.CompletedAt,
            })
            .ToList();

        return Ok(new DashboardDto
        {
            QuizzesCompleted = attempts.Count,
            AverageScore = averageScore,
            DocumentsUploaded = documentsCount,
            TopicsStudied = topicsStudied,
            WeakTopics = weakTopics,
            RecentAttempts = recent,
        });
    }
}

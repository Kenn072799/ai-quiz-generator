using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/topics")]
[Authorize]
public class TopicsController(
    AppDbContext db,
    DocumentService documentService,
    GroqService groqService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

    // POST /api/topics/extract/{documentId}
    // Extracts topics from the document using AI and stores them
    [HttpPost("extract/{documentId:int}")]
    public async Task<IActionResult> ExtractTopics(int documentId)
    {
        // Verify document belongs to this user
        var document = await db.Documents
            .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == CurrentUserId);

        if (document is null)
            return NotFound(new { message = "Document not found." });

        // If topics already exist, return them without re-extracting
        var existingTopics = await db.Topics
            .Where(t => t.DocumentId == documentId)
            .ToListAsync();

        if (existingTopics.Count > 0)
        {
            return Ok(new ExtractTopicsResponseDto
            {
                DocumentId = document.Id,
                DocumentName = document.FileName,
                Topics = existingTopics.Select(t => new TopicDto
                {
                    Id = t.Id,
                    TopicName = t.TopicName,
                    DocumentId = t.DocumentId,
                    DocumentName = document.FileName,
                    CreatedAt = t.CreatedAt,
                }).ToList(),
            });
        }

        // Extract text and chunk it
        string rawText;
        try
        {
            rawText = documentService.ExtractText(document);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to read document: {ex.Message}" });
        }

        if (string.IsNullOrWhiteSpace(rawText))
            return BadRequest(new { message = "Document appears to be empty or unreadable." });

        var chunks = documentService.ChunkText(rawText);

        // Call Groq AI
        List<string> topicNames;
        try
        {
            topicNames = await groqService.ExtractTopicsAsync(chunks);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { message = $"AI service error: {ex.Message}" });
        }

        if (topicNames.Count == 0)
            return BadRequest(new { message = "AI could not extract topics from this document." });

        // Save topics to DB
        var topics = topicNames.Select(name => new Topic
        {
            DocumentId = documentId,
            TopicName = name,
        }).ToList();

        db.Topics.AddRange(topics);

        document.IsProcessed = true;
        await db.SaveChangesAsync();

        return Ok(new ExtractTopicsResponseDto
        {
            DocumentId = document.Id,
            DocumentName = document.FileName,
            Topics = topics.Select(t => new TopicDto
            {
                Id = t.Id,
                TopicName = t.TopicName,
                DocumentId = t.DocumentId,
                DocumentName = document.FileName,
                CreatedAt = t.CreatedAt,
            }).ToList(),
        });
    }

    // GET /api/topics/document/{documentId}
    // Returns existing topics for a document
    [HttpGet("document/{documentId:int}")]
    public async Task<IActionResult> GetTopics(int documentId)
    {
        var document = await db.Documents
            .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == CurrentUserId);

        if (document is null)
            return NotFound(new { message = "Document not found." });

        var topics = await db.Topics
            .Where(t => t.DocumentId == documentId)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();

        return Ok(new ExtractTopicsResponseDto
        {
            DocumentId = document.Id,
            DocumentName = document.FileName,
            Topics = topics.Select(t => new TopicDto
            {
                Id = t.Id,
                TopicName = t.TopicName,
                DocumentId = t.DocumentId,
                DocumentName = document.FileName,
                CreatedAt = t.CreatedAt,
            }).ToList(),
        });
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController(DocumentService documentService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

    // GET /api/documents
    [HttpGet]
    public async Task<IActionResult> GetDocuments()
    {
        var docs = await documentService.GetUserDocumentsAsync(CurrentUserId);
        var result = docs.Select(d => new DocumentResponseDto
        {
            Id = d.Id,
            FileName = d.FileName,
            FileType = d.FileType,
            FileSizeBytes = d.FileSizeBytes,
            IsProcessed = d.IsProcessed,
            TopicCount = d.Topics.Count,
            UploadedAt = d.UploadedAt,
        });
        return Ok(result);
    }

    // POST /api/documents/upload
    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        try
        {
            var document = await documentService.SaveDocumentAsync(file, CurrentUserId);
            return Ok(new DocumentUploadResponseDto
            {
                Id = document.Id,
                FileName = document.FileName,
                FileType = document.FileType,
                FileSizeBytes = document.FileSizeBytes,
                Message = "Document uploaded successfully.",
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE /api/documents/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await documentService.DeleteDocumentAsync(id, CurrentUserId);
        if (!deleted)
            return NotFound(new { message = "Document not found." });

        return Ok(new { message = "Document deleted successfully." });
    }

    // PUT /api/documents/{id}  (replace)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Replace(int id, [FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        try
        {
            var document = await documentService.ReplaceDocumentAsync(id, CurrentUserId, file);
            if (document is null)
                return NotFound(new { message = "Document not found." });

            return Ok(new DocumentUploadResponseDto
            {
                Id = document.Id,
                FileName = document.FileName,
                FileType = document.FileType,
                FileSizeBytes = document.FileSizeBytes,
                Message = "Document replaced successfully.",
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

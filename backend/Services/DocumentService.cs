using System.Text;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class DocumentService(AppDbContext db, IWebHostEnvironment env)
{
    private static readonly HashSet<string> AllowedTypes = [".pdf", ".docx", ".txt"];
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB
    private const int ChunkSize = 800; // words per chunk

    // ── Upload & save ──────────────────────────────────────────────────────────
    public async Task<Document> SaveDocumentAsync(IFormFile file, int userId)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!AllowedTypes.Contains(extension))
            throw new InvalidOperationException("Only PDF, DOCX, and TXT files are allowed.");

        if (file.Length > MaxFileSizeBytes)
            throw new InvalidOperationException("File size must not exceed 10 MB.");

        // Sanitize filename — keep only safe characters
        var safeName = Regex.Replace(Path.GetFileNameWithoutExtension(file.FileName), @"[^a-zA-Z0-9_\-]", "_");
        var uniqueName = $"{userId}_{Guid.NewGuid():N}_{safeName}{extension}";

        var uploadsDir = Path.Combine(env.ContentRootPath, "Uploads");
        Directory.CreateDirectory(uploadsDir);
        var filePath = Path.Combine(uploadsDir, uniqueName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
            await file.CopyToAsync(stream);

        var document = new Document
        {
            UserId = userId,
            FileName = Path.GetFileName(file.FileName),
            FilePath = filePath,
            FileType = extension.TrimStart('.'),
            FileSizeBytes = file.Length,
            IsProcessed = false,
        };

        db.Documents.Add(document);
        await db.SaveChangesAsync();
        return document;
    }

    // ── Text extraction ────────────────────────────────────────────────────────
    public string ExtractText(Document document)
    {
        return document.FileType switch
        {
            "pdf" => ExtractFromPdf(document.FilePath),
            "docx" => ExtractFromDocx(document.FilePath),
            "txt" => File.ReadAllText(document.FilePath, Encoding.UTF8),
            _ => throw new InvalidOperationException("Unsupported file type.")
        };
    }

    private static string ExtractFromPdf(string path)
    {
        using var pdf = PdfDocument.Open(path);
        var sb = new StringBuilder();
        foreach (Page page in pdf.GetPages())
            sb.AppendLine(page.Text);
        return sb.ToString();
    }

    private static string ExtractFromDocx(string path)
    {
        using var doc = WordprocessingDocument.Open(path, false);
        var body = doc.MainDocumentPart?.Document?.Body;
        return body?.InnerText ?? string.Empty;
    }

    // ── Chunking ───────────────────────────────────────────────────────────────
    public List<string> ChunkText(string text, int wordsPerChunk = ChunkSize)
    {
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var chunks = new List<string>();

        for (int i = 0; i < words.Length; i += wordsPerChunk)
        {
            var chunk = string.Join(' ', words.Skip(i).Take(wordsPerChunk));
            if (!string.IsNullOrWhiteSpace(chunk))
                chunks.Add(chunk);
        }

        return chunks;
    }

    // ── Get documents for user ─────────────────────────────────────────────────
    public async Task<List<Document>> GetUserDocumentsAsync(int userId)
    {
        return await db.Documents
            .Where(d => d.UserId == userId)
            .Include(d => d.Topics)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    // ── Delete document ────────────────────────────────────────────────────────
    public async Task<bool> DeleteDocumentAsync(int documentId, int userId)
    {
        var document = await db.Documents
            .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == userId);

        if (document is null) return false;

        // Delete physical file
        if (File.Exists(document.FilePath))
            File.Delete(document.FilePath);

        db.Documents.Remove(document);
        await db.SaveChangesAsync();
        return true;
    }

    // ── Replace document (delete old, save new) ────────────────────────────────
    public async Task<Document?> ReplaceDocumentAsync(int documentId, int userId, IFormFile newFile)
    {
        var existing = await db.Documents
            .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == userId);

        if (existing is null) return null;

        // Validate new file
        var extension = Path.GetExtension(newFile.FileName).ToLowerInvariant();
        if (!AllowedTypes.Contains(extension))
            throw new InvalidOperationException("Only PDF, DOCX, and TXT files are allowed.");
        if (newFile.Length > MaxFileSizeBytes)
            throw new InvalidOperationException("File size must not exceed 10 MB.");

        // Delete old physical file
        if (File.Exists(existing.FilePath))
            File.Delete(existing.FilePath);

        // Remove old topics (cascade deletes quizzes, questions, flashcards)
        var topics = db.Topics.Where(t => t.DocumentId == existing.Id);
        db.Topics.RemoveRange(topics);

        // Save new file
        var safeName = Regex.Replace(Path.GetFileNameWithoutExtension(newFile.FileName), @"[^a-zA-Z0-9_\-]", "_");
        var uniqueName = $"{userId}_{Guid.NewGuid():N}_{safeName}{extension}";
        var uploadsDir = Path.Combine(env.ContentRootPath, "Uploads");
        Directory.CreateDirectory(uploadsDir);
        var filePath = Path.Combine(uploadsDir, uniqueName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
            await newFile.CopyToAsync(stream);

        existing.FileName = Path.GetFileName(newFile.FileName);
        existing.FilePath = filePath;
        existing.FileType = extension.TrimStart('.');
        existing.FileSizeBytes = newFile.Length;
        existing.IsProcessed = false;
        existing.UploadedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return existing;
    }
}

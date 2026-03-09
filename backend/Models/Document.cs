using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Document
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required, MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(10)]
    public string FileType { get; set; } = string.Empty; // "pdf", "docx", "txt"

    public long FileSizeBytes { get; set; }

    public bool IsProcessed { get; set; } = false;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Topic> Topics { get; set; } = [];
}

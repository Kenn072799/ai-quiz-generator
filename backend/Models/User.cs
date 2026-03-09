using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Role { get; set; } = "student"; // "student" or "admin"

    [MaxLength(20)]
    public string PreferredLanguage { get; set; } = "English"; // "English" or "Tagalog"

    [MaxLength(20)]
    public string EducationLevel { get; set; } = "College"; // "Elementary", "High School", "College"

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Document> Documents { get; set; } = [];
    public ICollection<QuizAttempt> QuizAttempts { get; set; } = [];
    public ICollection<StudySession> StudySessions { get; set; } = [];
}

using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Quiz
{
    public int Id { get; set; }

    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;

    [Required, MaxLength(20)]
    public string Difficulty { get; set; } = "College"; // mirrors EducationLevel

    [MaxLength(20)]
    public string Language { get; set; } = "English";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<QuizAttempt> QuizAttempts { get; set; } = [];
}

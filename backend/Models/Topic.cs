using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Topic
{
    public int Id { get; set; }

    public int DocumentId { get; set; }
    public Document Document { get; set; } = null!;

    [Required, MaxLength(255)]
    public string TopicName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Quiz> Quizzes { get; set; } = [];
    public ICollection<Flashcard> Flashcards { get; set; } = [];
    public ICollection<StudySession> StudySessions { get; set; } = [];
}

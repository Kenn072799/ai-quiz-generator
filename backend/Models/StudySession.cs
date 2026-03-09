namespace backend.Models;

public class StudySession
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;

    public int DurationMinutes { get; set; }

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}

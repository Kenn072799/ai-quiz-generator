namespace backend.Models;

public class QuizAttempt
{
    public int Id { get; set; }

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int Score { get; set; }         // number of correct answers
    public int TotalQuestions { get; set; }
    public int AttemptNumber { get; set; } // 1st, 2nd, 3rd attempt

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}

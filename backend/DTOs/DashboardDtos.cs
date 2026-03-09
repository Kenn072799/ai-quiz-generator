namespace backend.DTOs;

public class DashboardDto
{
    public int QuizzesCompleted { get; set; }
    public double AverageScore { get; set; }
    public int DocumentsUploaded { get; set; }
    public int TopicsStudied { get; set; }
    public List<WeakTopicDto> WeakTopics { get; set; } = [];
    public List<RecentAttemptDto> RecentAttempts { get; set; } = [];
}

public class WeakTopicDto
{
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public double BestPercentage { get; set; }
}

public class RecentAttemptDto
{
    public int QuizId { get; set; }
    public int AttemptId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public DateTime CompletedAt { get; set; }
}

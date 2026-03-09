namespace backend.DTOs;

// ── Generate Quiz Response ─────────────────────────────────────────────────
public class GenerateQuizResponseDto
{
    public int QuizId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
}

// ── Quiz Question (served to student — no correct answer exposed) ──────────
public class QuestionDto
{
    public int Id { get; set; }
    public int OrderIndex { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
}

// ── Active Quiz DTO ────────────────────────────────────────────────────────
public class ActiveQuizDto
{
    public int Id { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public int AttemptNumber { get; set; }
    public List<QuestionDto> Questions { get; set; } = [];
}

// ── Submit Quiz ────────────────────────────────────────────────────────────
public class QuizAnswerDto
{
    public int QuestionId { get; set; }
    public string SelectedAnswer { get; set; } = string.Empty; // "A", "B", "C", "D"
}

public class SubmitQuizDto
{
    public List<QuizAnswerDto> Answers { get; set; } = [];
}

// ── Quiz Result (returned after submission) ───────────────────────────────
public class QuestionResultDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string SelectedAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string Explanation { get; set; } = string.Empty;
}

public class QuizResultDto
{
    public int QuizId { get; set; }
    public int AttemptId { get; set; }
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int AttemptNumber { get; set; }
    public List<QuestionResultDto> Results { get; set; } = [];
}

// ── Quiz History ───────────────────────────────────────────────────────────
public class QuizHistoryDto
{
    public int QuizId { get; set; }
    public int AttemptId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int AttemptNumber { get; set; }
    public DateTime CompletedAt { get; set; }
}

// ── Topic Progress (for progress page) ────────────────────────────────────
public class TopicProgressDto
{
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public int BestScore { get; set; }
    public int TotalQuestions { get; set; }
    public int AttemptCount { get; set; }
    public double BestPercentage => TotalQuestions > 0
        ? Math.Round((double)BestScore / TotalQuestions * 100, 1)
        : 0;
}

using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Question
{
    public int Id { get; set; }

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    [Required]
    public string QuestionText { get; set; } = string.Empty;

    [Required]
    public string OptionA { get; set; } = string.Empty;

    [Required]
    public string OptionB { get; set; } = string.Empty;

    [Required]
    public string OptionC { get; set; } = string.Empty;

    [Required]
    public string OptionD { get; set; } = string.Empty;

    [Required, MaxLength(1)]
    public string CorrectAnswer { get; set; } = string.Empty; // "A", "B", "C", or "D"

    [Required]
    public string Explanation { get; set; } = string.Empty;

    public int OrderIndex { get; set; }
}

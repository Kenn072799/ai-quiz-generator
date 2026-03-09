namespace backend.DTOs;

public class FlashcardDto
{
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}

public class FlashcardsResponseDto
{
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public List<FlashcardDto> Flashcards { get; set; } = [];
}

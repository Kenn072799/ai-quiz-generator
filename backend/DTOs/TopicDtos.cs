namespace backend.DTOs;

public class TopicDto
{
    public int Id { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public int DocumentId { get; set; }
    public string DocumentName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ExtractTopicsResponseDto
{
    public int DocumentId { get; set; }
    public string DocumentName { get; set; } = string.Empty;
    public List<TopicDto> Topics { get; set; } = [];
}

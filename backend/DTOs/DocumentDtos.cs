namespace backend.DTOs;

public class DocumentResponseDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public bool IsProcessed { get; set; }
    public int TopicCount { get; set; }
    public DateTime UploadedAt { get; set; }
}

public class DocumentUploadResponseDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string Message { get; set; } = string.Empty;
}

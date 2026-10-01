namespace Talechemy.Api.Models.World;

public sealed class Note
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

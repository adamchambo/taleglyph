namespace Talechemy.Api.Models.World;

public sealed class LoreEntry
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string CanonStatus { get; set; } = "";
}

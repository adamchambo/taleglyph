namespace Talechemy.Api.Models.Stories;

public sealed class Story
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Title { get; set; } = "";
    public string Synopsis { get; set; } = "";
}

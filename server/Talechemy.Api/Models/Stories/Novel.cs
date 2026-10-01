namespace Talechemy.Api.Models.Stories;

public sealed class Novel
{
    public Guid Id { get; set; }
    public Guid StoryId { get; set; }
    public string Title { get; set; } = "";
}

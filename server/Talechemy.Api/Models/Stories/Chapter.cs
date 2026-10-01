namespace Talechemy.Api.Models.Stories;

public sealed class Chapter
{
    public Guid Id { get; set; }
    public Guid StoryId { get; set; }
    public string Title { get; set; } = "";
    public int Order { get; set; }
}

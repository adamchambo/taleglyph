namespace Talechemy.Api.Models.Comics;

public sealed class Comic
{
    public Guid Id { get; set; }
    public Guid StoryId { get; set; }
    public string Title { get; set; } = "";
}

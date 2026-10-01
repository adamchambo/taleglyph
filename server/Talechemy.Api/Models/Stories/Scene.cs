namespace Talechemy.Api.Models.Stories;

public sealed class Scene
{
    public Guid Id { get; set; }
    public Guid ChapterId { get; set; }
    public string Title { get; set; } = "";
    public string Prose { get; set; } = "";
    public int Order { get; set; }
    public int Revision { get; set; } = 1;
}

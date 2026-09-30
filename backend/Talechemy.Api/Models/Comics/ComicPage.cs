namespace Talechemy.Api.Models.Comics;

public sealed class ComicPage
{
    public Guid Id { get; set; }
    public Guid ComicId { get; set; }
    public int Number { get; set; }
    public string Layout { get; set; } = "";
    public int Revision { get; set; } = 1;
}

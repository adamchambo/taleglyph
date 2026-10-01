namespace Talechemy.Api.Models.Comics;

public sealed class Panel
{
    public Guid Id { get; set; }
    public Guid PageId { get; set; }
    public string Title { get; set; } = "";
    public int Order { get; set; }
}

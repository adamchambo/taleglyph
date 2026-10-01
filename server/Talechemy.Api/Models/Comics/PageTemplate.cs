namespace Talechemy.Api.Models.Comics;

public sealed class PageTemplate
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Name { get; set; } = "";
    public string ContentJson { get; set; } = "";
}

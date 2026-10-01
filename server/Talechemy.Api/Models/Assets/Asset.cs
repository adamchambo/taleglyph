namespace Talechemy.Api.Models.Assets;

public sealed class Asset
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Name { get; set; } = "";
    public string Kind { get; set; } = "";
    public string Description { get; set; } = "";
    public string? ImageFileName { get; set; }
}

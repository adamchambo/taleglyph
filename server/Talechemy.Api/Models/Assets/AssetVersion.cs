namespace Talechemy.Api.Models.Assets;

public sealed class AssetVersion
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public int Version { get; set; }
    public string Source { get; set; } = "";
    public string? Prompt { get; set; }
}

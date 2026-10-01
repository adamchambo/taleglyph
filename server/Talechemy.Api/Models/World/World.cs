namespace Talechemy.Api.Models.World;

public sealed class World
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Theme { get; set; } = "";
    public Guid? CoverAssetId { get; set; }
}

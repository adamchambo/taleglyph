namespace Talechemy.Api.Models.World;

public sealed class Relationship
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public Guid FromCharacterId { get; set; }
    public Guid ToCharacterId { get; set; }
    public string Kind { get; set; } = "";
    public string Description { get; set; } = "";
}

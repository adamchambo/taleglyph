namespace Talechemy.Api.Models.World;

public sealed class Location
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
}

namespace Talechemy.Api.Models.World;

public sealed class Character
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Name { get; set; } = "";
    public string Role { get; set; } = "";
    public string Description { get; set; } = "";
    public string Motivation { get; set; } = "";
    public string CanonStatus { get; set; } = "";
}

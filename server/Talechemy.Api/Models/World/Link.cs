namespace Talechemy.Api.Models.World;

public sealed class Link
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string FromKind { get; set; } = "";
    public Guid FromId { get; set; }
    public string ToKind { get; set; } = "";
    public Guid ToId { get; set; }
}

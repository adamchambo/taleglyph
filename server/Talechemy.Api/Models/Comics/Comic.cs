namespace Talechemy.Api.Models.Comics;

public sealed class Comic
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Title { get; set; } = "";
    public Guid? CoverAssetId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

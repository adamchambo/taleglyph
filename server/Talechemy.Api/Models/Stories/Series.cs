namespace Talechemy.Api.Models.Stories;
public sealed class Series
{
    public Guid Id { get; set; }
    public Guid WorldId { get; set; }
    public string Name { get; set; } = "";
}

namespace Talechemy.Api.Models.Comics;

public sealed class Layer
{
    public Guid Id { get; set; }
    public Guid PanelId { get; set; }
    public string Name { get; set; } = "";
    public string Kind { get; set; } = "";
    public double X { get; set; }
    public double Y { get; set; }
    public bool Visible { get; set; }
    public bool Locked { get; set; }
    public Guid? AssetId { get; set; }
    public string? Text { get; set; }
    public double Width { get; set; } = 70;
    public int Order { get; set; }
}

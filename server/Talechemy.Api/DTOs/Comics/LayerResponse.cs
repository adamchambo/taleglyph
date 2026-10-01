namespace Talechemy.Api.DTOs.Comics;

public sealed record LayerResponse(Guid Id, Guid PanelId, string Name, string Kind, double X, double Y, bool Visible, bool Locked, Guid? AssetId, string? Text);

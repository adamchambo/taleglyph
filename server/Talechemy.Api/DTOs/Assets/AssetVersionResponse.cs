namespace Talechemy.Api.DTOs.Assets;

public sealed record AssetVersionResponse(Guid Id, Guid AssetId, int Version, string Source, string? Prompt);

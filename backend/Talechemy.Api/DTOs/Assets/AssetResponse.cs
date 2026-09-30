namespace Talechemy.Api.DTOs.Assets;

public sealed record AssetResponse(Guid Id, Guid WorldId, string Name, string Kind, string Description, string? ImageUrl);

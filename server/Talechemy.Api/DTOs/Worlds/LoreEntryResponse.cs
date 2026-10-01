namespace Talechemy.Api.DTOs.Worlds;

public sealed record LoreEntryResponse(Guid Id, Guid WorldId, string Title, string Content, string CanonStatus);

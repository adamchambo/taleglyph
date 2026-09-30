namespace Talechemy.Api.DTOs.Worlds;

public sealed record NoteResponse(Guid Id, Guid WorldId, string Title, string Content);

namespace Talechemy.Api.DTOs.Stories;

public sealed record StoryResponse(Guid Id, Guid WorldId, string Title, string Synopsis);

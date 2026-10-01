namespace Talechemy.Api.DTOs.Stories;

public sealed record ChapterResponse(Guid Id, Guid NovelId, string Title, int Order);

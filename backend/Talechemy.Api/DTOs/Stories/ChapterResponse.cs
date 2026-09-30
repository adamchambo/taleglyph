namespace Talechemy.Api.DTOs.Stories;

public sealed record ChapterResponse(Guid Id, Guid StoryId, string Title, int Order);

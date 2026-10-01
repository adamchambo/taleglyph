namespace Talechemy.Api.DTOs.Stories;

public sealed record NovelResponse(Guid Id, Guid StoryId, string Title, int ChapterCount);
public sealed record NovelWorkspace(NovelResponse Novel, IReadOnlyList<ChapterResponse> Chapters);

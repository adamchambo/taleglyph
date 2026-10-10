namespace Talechemy.Api.DTOs.Stories;

public sealed record NovelResponse(Guid Id, Guid SpaceId, string Title, Guid? CoverAssetId, int ChapterCount);
public sealed record NovelWorkspace(NovelResponse Novel, IReadOnlyList<ChapterResponse> Chapters, string? ManuscriptJson, IReadOnlyList<SceneResponse> LegacyScenes);

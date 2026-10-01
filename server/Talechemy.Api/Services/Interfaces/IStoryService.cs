using Talechemy.Api.DTOs.Stories;
namespace Talechemy.Api.Services.Interfaces;

public interface IStoryService
{
    Task<IReadOnlyList<StoryResponse>> GetStoriesAsync(Guid worldId, CancellationToken ct = default);
    Task<StoryResponse?> GetStoryAsync(Guid id, CancellationToken ct = default);
    Task<ChapterResponse?> GetChapterAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<SceneResponse>> GetScenesAsync(Guid chapterId, CancellationToken ct = default);
    Task<SceneResponse?> GetSceneAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AdaptationLinkResponse>> GetAdaptationsAsync(Guid sceneId, CancellationToken ct = default);
}

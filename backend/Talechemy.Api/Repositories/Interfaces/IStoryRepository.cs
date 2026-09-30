using Talechemy.Api.Models.Stories;
namespace Talechemy.Api.Repositories.Interfaces;

public interface IStoryRepository
{
    Task<IReadOnlyList<Story>> GetStoriesAsync(Guid worldId, CancellationToken ct = default);
    Task<Story?> GetStoryAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Chapter>> GetChaptersAsync(Guid storyId, CancellationToken ct = default);
    Task<Chapter?> GetChapterAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Scene>> GetScenesAsync(Guid chapterId, CancellationToken ct = default);
    Task<Scene?> GetSceneAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AdaptationLink>> GetAdaptationsAsync(Guid sceneId, CancellationToken ct = default);
}

using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.Mapping;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Services;

public sealed class StoryService(IStoryRepository repository) : IStoryService
{
    public async Task<IReadOnlyList<StoryResponse>> GetStoriesAsync(Guid worldId, CancellationToken ct = default) => (await repository.GetStoriesAsync(worldId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<StoryResponse?> GetStoryAsync(Guid id, CancellationToken ct = default) => (await repository.GetStoryAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<ChapterResponse>> GetChaptersAsync(Guid storyId, CancellationToken ct = default) => (await repository.GetChaptersAsync(storyId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<ChapterResponse?> GetChapterAsync(Guid id, CancellationToken ct = default) => (await repository.GetChapterAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<SceneResponse>> GetScenesAsync(Guid chapterId, CancellationToken ct = default) => (await repository.GetScenesAsync(chapterId, ct)).Select(x => x.ToResponse()).ToArray();
    public async Task<SceneResponse?> GetSceneAsync(Guid id, CancellationToken ct = default) => (await repository.GetSceneAsync(id, ct))?.ToResponse();
    public async Task<IReadOnlyList<AdaptationLinkResponse>> GetAdaptationsAsync(Guid sceneId, CancellationToken ct = default) => (await repository.GetAdaptationsAsync(sceneId, ct)).Select(x => x.ToResponse()).ToArray();
}

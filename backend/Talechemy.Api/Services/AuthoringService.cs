using Talechemy.Api.DTOs.Authoring;
using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Mapping;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Services;

public sealed class AuthoringService(IWorkspaceRepository repo)
{
    public async Task<StoryResponse> CreateStory(CreateStoryRequest request, CancellationToken ct)
    {
        if (!await repo.WorldExists(request.WorldId, ct)) throw new WorkflowException(404, "World not found.");
        var story = new Story { Id = Guid.NewGuid(), WorldId = request.WorldId, Title = request.Title.Trim(), Synopsis = request.Synopsis.Trim() };
        repo.Add(story); await repo.Save(ct); return story.ToResponse();
    }
    public async Task<ChapterResponse> CreateChapter(Guid storyId, TitleRequest request, CancellationToken ct)
    {
        _ = await repo.Story(storyId, ct) ?? throw new WorkflowException(404, "Story not found.");
        var chapter = new Chapter { Id = Guid.NewGuid(), StoryId = storyId, Title = request.Title.Trim(), Order = await repo.NextChapterOrder(storyId, ct) };
        repo.Add(chapter); await repo.Save(ct); return chapter.ToResponse();
    }
    public async Task<ChapterWorkspace> GetChapter(Guid id, CancellationToken ct)
    {
        var chapter = await repo.Chapter(id, ct) ?? throw new WorkflowException(404, "Chapter not found.");
        var story = (await repo.Story(chapter.StoryId, ct))!;
        return new(chapter.ToResponse(), story.ToResponse(), (await repo.Scenes(id, ct)).Select(x => x.ToResponse()).ToArray());
    }
    public async Task<SceneResponse> CreateScene(Guid chapterId, SceneDraft request, CancellationToken ct)
    {
        _ = await repo.Chapter(chapterId, ct) ?? throw new WorkflowException(404, "Chapter not found.");
        var scenes = await repo.Scenes(chapterId, ct);
        var scene = new Scene { Id = Guid.NewGuid(), ChapterId = chapterId, Title = request.Title.Trim(), Prose = request.Prose, Order = scenes.Select(x => x.Order).DefaultIfEmpty().Max() + 1 };
        repo.Add(scene); await repo.Save(ct); return scene.ToResponse();
    }
    public async Task<SceneResponse> UpdateScene(Guid id, SceneDraft request, CancellationToken ct)
    {
        var scene = await repo.Scene(id, ct) ?? throw new WorkflowException(404, "Scene not found.");
        if (scene.Revision != request.Revision) throw new WorkflowException(409, "This scene changed elsewhere. Copy your draft before reloading.");
        if (scene.Title != request.Title.Trim() || scene.Prose != request.Prose)
        {
            scene.Title = request.Title.Trim(); scene.Prose = request.Prose; scene.Revision++;
            await repo.Save(ct);
        }
        return scene.ToResponse();
    }
}

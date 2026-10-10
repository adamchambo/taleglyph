using Talechemy.Api.DTOs.Authoring;
using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Mapping;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Services;

public sealed class AuthoringService(IWorkspaceRepository repo)
{
    public async Task<ChapterResponse> CreateChapter(Guid novelId, TitleRequest request, CancellationToken ct)
    {
        var novel = await repo.Novel(novelId, ct) ?? throw new WorkflowException(404, "Novel not found.");
        var chapter = new Chapter { Id = Guid.NewGuid(), NovelId = novel.Id, Title = request.Title.Trim(), Order = await repo.NextChapterOrder(novel.Id, ct) };
        repo.Add(chapter); await repo.Save(ct); return chapter.ToResponse();
    }
    public async Task<NovelWorkspace> GetNovel(Guid id, CancellationToken ct)
    {
        var novel = await repo.Novel(id, ct) ?? throw new WorkflowException(404, "Novel not found.");
        var chapters = await repo.Chapters(id, ct);
        var scenes = new List<SceneResponse>();
        if (novel.ManuscriptJson is null)
            foreach (var chapter in chapters)
                scenes.AddRange((await repo.Scenes(chapter.Id, ct)).Select(x => x.ToResponse()));
        return new(Map(novel, chapters.Length), chapters.Select(x => x.ToResponse()).ToArray(), novel.ManuscriptJson, scenes);
    }
    public async Task SaveManuscript(Guid id, ManuscriptRequest request, CancellationToken ct)
    {
        var novel = await repo.Novel(id, ct) ?? throw new WorkflowException(404, "Novel not found.");
        if (novel.ManuscriptJson != request.ExpectedDocumentJson)
            throw new WorkflowException(409, "This manuscript changed elsewhere. Copy your draft before reloading.");
        ManuscriptValidation.Validate(request.DocumentJson);
        novel.ManuscriptJson = request.DocumentJson;
        try { await repo.Save(ct); }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException)
        { throw new WorkflowException(409, "This manuscript changed elsewhere. Copy your draft before reloading."); }
    }
    public async Task<ChapterWorkspace> GetChapter(Guid id, CancellationToken ct)
    {
        var chapter = await repo.Chapter(id, ct) ?? throw new WorkflowException(404, "Chapter not found.");
        var novel = (await repo.Novel(chapter.NovelId, ct))!;
        var count = (await repo.Chapters(novel.Id, ct)).Length;
        return new(chapter.ToResponse(), Map(novel, count), (await repo.Scenes(id, ct)).Select(x => x.ToResponse()).ToArray());
    }
    public async Task<SceneResponse> CreateScene(Guid chapterId, SceneDraft request, CancellationToken ct)
    {
        var chapter = await repo.Chapter(chapterId, ct) ?? throw new WorkflowException(404, "Chapter not found.");
        _ = await repo.Novel(chapter.NovelId, ct);
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
            var chapter = (await repo.Chapter(scene.ChapterId, ct))!;
            _ = await repo.Novel(chapter.NovelId, ct);
            await repo.Save(ct);
        }
        return scene.ToResponse();
    }
    private static NovelResponse Map(Novel novel, int chapterCount) => new(novel.Id, novel.WorldId, novel.Title, novel.CoverAssetId, chapterCount);
}

using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Repositories;

public sealed class StoryRepository(TalechemyDbContext db) : IStoryRepository
{
    public async Task<IReadOnlyList<Story>> GetStoriesAsync(Guid worldId, CancellationToken ct = default)
    {
        return await db.Stories.AsNoTracking().Where(x => x.WorldId == worldId).OrderBy(x => x.Id).ToArrayAsync(ct);
    }
    public async Task<Story?> GetStoryAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Stories.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<Chapter>> GetChaptersAsync(Guid storyId, CancellationToken ct = default)
    {
        return await db.Chapters.AsNoTracking().Where(x => x.StoryId == storyId).OrderBy(x => x.Order).ToArrayAsync(ct);
    }
    public async Task<Chapter?> GetChapterAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Chapters.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<Scene>> GetScenesAsync(Guid chapterId, CancellationToken ct = default)
    {
        return await db.Scenes.AsNoTracking().Where(x => x.ChapterId == chapterId).OrderBy(x => x.Order).ToArrayAsync(ct);
    }
    public async Task<Scene?> GetSceneAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Scenes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<AdaptationLink>> GetAdaptationsAsync(Guid sceneId, CancellationToken ct = default)
    {
        return await db.AdaptationLinks.AsNoTracking().Where(x => x.SceneId == sceneId).OrderBy(x => x.Id).ToArrayAsync(ct);
    }
}

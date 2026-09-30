using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
namespace Talechemy.Api.Repositories;

public sealed class WorkspaceRepository(TalechemyDbContext db) : IWorkspaceRepository
{
    public Task<bool> WorldExists(Guid id, CancellationToken ct) => db.Worlds.AnyAsync(x => x.Id == id, ct);
    public Task<Story?> Story(Guid id, CancellationToken ct) => db.Stories.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<Chapter?> Chapter(Guid id, CancellationToken ct) => db.Chapters.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<Scene?> Scene(Guid id, CancellationToken ct) => db.Scenes.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<Scene[]> Scenes(Guid chapterId, CancellationToken ct) => db.Scenes.Where(x => x.ChapterId == chapterId).OrderBy(x => x.Order).ToArrayAsync(ct);
    public async Task<int> NextChapterOrder(Guid storyId, CancellationToken ct) => (await db.Chapters.Where(x => x.StoryId == storyId).MaxAsync(x => (int?)x.Order, ct) ?? 0) + 1;
    public Task<Comic?> Comic(Guid id, CancellationToken ct) => db.Comics.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<ComicPage?> Page(Guid id, CancellationToken ct) => db.ComicPages.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<ComicPage[]> Pages(Guid comicId, CancellationToken ct) => db.ComicPages.Where(x => x.ComicId == comicId).OrderBy(x => x.Number).ToArrayAsync(ct);
    public Task<Panel[]> Panels(Guid pageId, CancellationToken ct) => db.Panels.Where(x => x.PageId == pageId).OrderBy(x => x.Order).ToArrayAsync(ct);
    public Task<Layer[]> Layers(Guid[] panelIds, CancellationToken ct) => db.Layers.Where(x => panelIds.Contains(x.PanelId)).OrderBy(x => x.Order).ToArrayAsync(ct);
    public Task<AdaptationLink?> Source(Guid pageId, CancellationToken ct) => db.AdaptationLinks.FirstOrDefaultAsync(x => x.ComicPageId == pageId, ct);
    public Task<PageTemplate?> Template(Guid id, CancellationToken ct) => db.PageTemplates.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<PageTemplate[]> Templates(Guid worldId, CancellationToken ct) => db.PageTemplates.Where(x => x.WorldId == worldId).OrderBy(x => x.Name).ToArrayAsync(ct);
    public Task<Asset?> Asset(Guid id, CancellationToken ct) => db.Assets.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<int> CountAssets(Guid worldId, Guid[] ids, CancellationToken ct) => db.Assets.CountAsync(x => x.WorldId == worldId && ids.Contains(x.Id) && x.ImageFileName != null, ct);
    public void Add<T>(T entity) where T : class => db.Add(entity);
    public void RemoveLayers(IEnumerable<Layer> layers) => db.Layers.RemoveRange(layers);
    public void RemovePanels(IEnumerable<Panel> panels) => db.Panels.RemoveRange(panels);
    public Task Save(CancellationToken ct) => db.SaveChangesAsync(ct);
}

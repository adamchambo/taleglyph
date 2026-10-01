using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Repositories;

public sealed class ComicRepository(TalechemyDbContext db) : IComicRepository
{
    public async Task<Comic?> GetComicAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Comics.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<ComicPage>> GetPagesAsync(Guid comicId, CancellationToken ct = default)
    {
        return await db.ComicPages.AsNoTracking().Where(x => x.ComicId == comicId).OrderBy(x => x.Number).ToArrayAsync(ct);
    }
    public async Task<ComicPage?> GetPageAsync(Guid id, CancellationToken ct = default)
    {
        return await db.ComicPages.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<Panel>> GetPanelsAsync(Guid pageId, CancellationToken ct = default)
    {
        return await db.Panels.AsNoTracking().Where(x => x.PageId == pageId).OrderBy(x => x.Order).ToArrayAsync(ct);
    }
    public async Task<Panel?> GetPanelAsync(Guid id, CancellationToken ct = default)
    {
        return await db.Panels.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    }
    public async Task<IReadOnlyList<Layer>> GetLayersAsync(Guid panelId, CancellationToken ct = default)
    {
        return await db.Layers.AsNoTracking().Where(x => x.PanelId == panelId).OrderBy(x => x.Id).ToArrayAsync(ct);
    }
}

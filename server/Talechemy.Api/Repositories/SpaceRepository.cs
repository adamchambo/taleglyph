using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.DTOs.Spaces;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Repositories;

public sealed class SpaceRepository(TalechemyDbContext db) : ISpaceRepository
{
    public Task<World?> Space(Guid id, CancellationToken ct) => db.Worlds.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<Asset?> Asset(Guid id, CancellationToken ct) => db.Assets.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<WorkCard[]> Novels(Guid spaceId, CancellationToken ct) => db.Novels.AsNoTracking().Where(x => x.WorldId == spaceId).OrderBy(x => x.Title)
        .Select(x => new WorkCard(x.Id, "novel", x.WorldId, x.Title, x.CoverAssetId, x.UpdatedAt, db.Chapters.Count(c => c.NovelId == x.Id))).ToArrayAsync(ct);
    public Task<WorkCard[]> Comics(Guid spaceId, CancellationToken ct) => db.Comics.AsNoTracking().Where(x => x.WorldId == spaceId).OrderBy(x => x.Title)
        .Select(x => new WorkCard(x.Id, "comic", x.WorldId, x.Title, x.CoverAssetId, x.UpdatedAt, db.ComicPages.Count(p => p.ComicId == x.Id))).ToArrayAsync(ct);
    public Task<Novel?> Novel(Guid id, CancellationToken ct) => db.Novels.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<Comic?> Comic(Guid id, CancellationToken ct) => db.Comics.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<Story?> Story(Guid id, CancellationToken ct) => db.Stories.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<Arc?> Arc(Guid id, CancellationToken ct) => db.Arcs.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<ArcResponse[]> Arcs(Guid spaceId, CancellationToken ct) =>
        (from arc in db.Arcs.AsNoTracking()
         join story in db.Stories.AsNoTracking() on arc.StoryId equals story.Id
         where story.WorldId == spaceId
         orderby arc.StoryId, arc.Order
         select new ArcResponse(arc.Id, arc.StoryId, arc.Title, arc.Summary, arc.Order)).ToArrayAsync(ct);
    public Task<Arc[]> StoryArcs(Guid storyId, CancellationToken ct) => db.Arcs.Where(x => x.StoryId == storyId).OrderBy(x => x.Order).ToArrayAsync(ct);
    public Task<LinkResponse[]> Links(Guid spaceId, CancellationToken ct) => db.Links.AsNoTracking().Where(x => x.WorldId == spaceId)
        .Select(x => new LinkResponse(x.Id, x.FromKind, x.FromId, x.ToKind, x.ToId)).ToArrayAsync(ct);
    public Task<Link?> Link(Guid id, CancellationToken ct) => db.Links.SingleOrDefaultAsync(x => x.Id == id, ct);
    public Task<bool> LinkExists(string fromKind, Guid fromId, string toKind, Guid toId, CancellationToken ct) =>
        db.Links.AnyAsync(x => x.FromKind == fromKind && x.FromId == fromId && x.ToKind == toKind && x.ToId == toId, ct);
    public Task<Link[]> LinksTouching(string kind, Guid id, CancellationToken ct) =>
        db.Links.Where(x => (x.FromKind == kind && x.FromId == id) || (x.ToKind == kind && x.ToId == id)).ToArrayAsync(ct);
    public async Task<Guid?> SpaceOf(string kind, Guid id, CancellationToken ct) => kind switch
    {
        "novel" => await db.Novels.Where(x => x.Id == id).Select(x => (Guid?)x.WorldId).SingleOrDefaultAsync(ct),
        "comic" => await db.Comics.Where(x => x.Id == id).Select(x => (Guid?)x.WorldId).SingleOrDefaultAsync(ct),
        "note" => await db.Notes.Where(x => x.Id == id).Select(x => (Guid?)x.WorldId).SingleOrDefaultAsync(ct),
        "story" => await db.Stories.Where(x => x.Id == id).Select(x => (Guid?)x.WorldId).SingleOrDefaultAsync(ct),
        "arc" => await (from arc in db.Arcs where arc.Id == id
                        join story in db.Stories on arc.StoryId equals story.Id
                        select (Guid?)story.WorldId).SingleOrDefaultAsync(ct),
        _ => null
    };
    public Task<NoteCard[]> Notes(Guid spaceId, CancellationToken ct) => db.Notes.AsNoTracking().Where(x => x.WorldId == spaceId).OrderByDescending(x => x.UpdatedAt)
        .Select(x => new NoteCard(x.Id, x.WorldId, x.Title, x.Content, x.UpdatedAt)).ToArrayAsync(ct);
    public Task<Note?> Note(Guid id, CancellationToken ct) => db.Notes.SingleOrDefaultAsync(x => x.Id == id, ct);
    public void Add<T>(T entity) where T : class => db.Add(entity);
    public void Remove<T>(T entity) where T : class => db.Remove(entity);
    public void RemoveRange<T>(IEnumerable<T> entities) where T : class => db.RemoveRange(entities);
    public Task Save(CancellationToken ct) => db.SaveChangesAsync(ct);
}

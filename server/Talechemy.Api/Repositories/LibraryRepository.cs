using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.DTOs.Library;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Repositories;
public sealed class LibraryRepository(TalechemyDbContext db) : ILibraryRepository
{
    private IQueryable<StoryCard> Cards(Guid? id = null) => from story in db.Stories.AsNoTracking().Where(x => id == null || x.Id == id).OrderBy(x => x.Order).ThenBy(x => x.Title)
        join space in db.Worlds.AsNoTracking() on story.WorldId equals space.Id
        select new StoryCard(story.Id,space.Id,space.Name,story.Title,story.Synopsis,story.Tags,story.UpdatedAt,story.Revision,
            db.Arcs.Count(x=>x.StoryId==story.Id), story.Order, story.CoverAssetId);
    public async Task<LibrarySnapshot> Snapshot(CancellationToken ct)
    {
        var spaces=await db.Worlds.AsNoTracking().OrderBy(x=>x.Name).Select(x=>new SpaceCard(x.Id,x.Name,x.Description,x.CoverAssetId,
            db.Stories.Count(s=>s.WorldId==x.Id),db.Novels.Count(s=>s.WorldId==x.Id),db.Comics.Count(s=>s.WorldId==x.Id),
            db.Characters.Count(s=>s.WorldId==x.Id),db.Assets.Count(s=>s.WorldId==x.Id),db.Notes.Count(s=>s.WorldId==x.Id))).ToArrayAsync(ct);
        var stories=await Cards().ToArrayAsync(ct);
        return new(spaces,stories);
    }
    public Task<StoryCard?> Card(Guid id,CancellationToken ct)=>Cards(id).SingleOrDefaultAsync(ct);
    public Task<Story?> Story(Guid id,CancellationToken ct)=>db.Stories.SingleOrDefaultAsync(x=>x.Id==id,ct);
    public Task<List<Story>> Stories(Guid spaceId,CancellationToken ct)=>db.Stories.Where(x=>x.WorldId==spaceId).ToListAsync(ct);
    public Task<Asset?> Asset(Guid id,CancellationToken ct)=>db.Assets.SingleOrDefaultAsync(x=>x.Id==id,ct);
    public Task<World?> Space(Guid id,CancellationToken ct)=>db.Worlds.SingleOrDefaultAsync(x=>x.Id==id,ct);
    public async Task<Guid?> SpaceFor(string kind,Guid id,CancellationToken ct) => kind switch
    {
        "chapter"=>await (from chapter in db.Chapters where chapter.Id==id
            join novel in db.Novels on chapter.NovelId equals novel.Id select (Guid?)novel.WorldId).SingleOrDefaultAsync(ct),
        "comic"=>await db.Comics.Where(x=>x.Id==id).Select(x=>(Guid?)x.WorldId).SingleOrDefaultAsync(ct),
        _=>null
    };
    public void Add<T>(T entity) where T:class=>db.Add(entity);
    public Task Save(CancellationToken ct)=>db.SaveChangesAsync(ct);
}

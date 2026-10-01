using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Talechemy.Api.DTOs.Library;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Repositories;
public sealed class LibraryRepository(TalechemyDbContext db) : ILibraryRepository
{
    private IQueryable<StoryCard> Cards(Guid? id = null) => from story in db.Stories.AsNoTracking().Where(x => id == null || x.Id == id).OrderByDescending(x => x.UpdatedAt)
        join space in db.Worlds.AsNoTracking() on story.WorldId equals space.Id
        join series in db.Series.AsNoTracking() on story.SeriesId equals series.Id into groups
        from series in groups.DefaultIfEmpty()
        select new StoryCard(story.Id,space.Id,space.Name,story.Title,story.Synopsis,story.Tags,story.SeriesId,
            series == null ? null : series.Name,story.CoverAssetId,story.UpdatedAt,story.StartingSection,story.Revision,
            db.Chapters.Count(x=>x.StoryId==story.Id),db.Comics.Count(x=>x.StoryId==story.Id),
            db.Characters.Count(x=>x.WorldId==space.Id),db.Assets.Count(x=>x.WorldId==space.Id));
    public async Task<LibrarySnapshot> Snapshot(CancellationToken ct)
    {
        var stories=await Cards().ToArrayAsync(ct);
        var spaces=await db.Worlds.AsNoTracking().OrderBy(x=>x.Name).Select(x=>new SpaceSummary(x.Id,x.Name,x.Description)).ToArrayAsync(ct);
        var series=await db.Series.AsNoTracking().OrderBy(x=>x.Name).Select(x=>new SeriesSummary(x.Id,x.WorldId,x.Name)).ToArrayAsync(ct);
        return new(stories,spaces,series);
    }
    public Task<StoryCard?> Card(Guid id,CancellationToken ct)=>Cards(id).SingleOrDefaultAsync(ct);
    public Task<Story?> Story(Guid id,CancellationToken ct)=>db.Stories.SingleOrDefaultAsync(x=>x.Id==id,ct);
    public Task<World?> Space(Guid id,CancellationToken ct)=>db.Worlds.SingleOrDefaultAsync(x=>x.Id==id,ct);
    public Task<Asset?> Asset(Guid id,CancellationToken ct)=>db.Assets.SingleOrDefaultAsync(x=>x.Id==id,ct);
    public Task<Series?> Series(Guid id,CancellationToken ct)=>db.Series.SingleOrDefaultAsync(x=>x.Id==id,ct);
    public async Task<Guid?> StoryFor(string kind,Guid id,CancellationToken ct) => kind switch
    {
        "chapter"=>await db.Chapters.Where(x=>x.Id==id).Select(x=>(Guid?)x.StoryId).SingleOrDefaultAsync(ct),
        "comic"=>await db.Comics.Where(x=>x.Id==id).Select(x=>(Guid?)x.StoryId).SingleOrDefaultAsync(ct),
        _=>null
    };
    public void Add<T>(T entity) where T:class=>db.Add(entity);
    public Task Save(CancellationToken ct)=>db.SaveChangesAsync(ct);
}

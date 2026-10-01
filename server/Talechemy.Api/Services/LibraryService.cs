using Talechemy.Api.DTOs.Library;
using Talechemy.Api.DTOs.Stories;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Services;
public sealed class LibraryService(ILibraryRepository repo)
{
    public Task<LibrarySnapshot> Snapshot(CancellationToken ct)=>repo.Snapshot(ct);
    public async Task<StoryCard> Card(Guid id,CancellationToken ct)=>await repo.Card(id,ct)??throw new WorkflowException(404,"Story not found.");
    public async Task<StoryCard> Create(StorySetupRequest request,CancellationToken ct)
    {
        World space;
        if(request.SpaceId is {} id) space=await repo.Space(id,ct)??throw new WorkflowException(404,"Space not found.");
        else
        {
            space=new World {Id=Guid.NewGuid(),Name=string.IsNullOrWhiteSpace(request.NewSpaceName)?request.Title.Trim():request.NewSpaceName.Trim(),Theme="fantasy"};
            repo.Add(space);
        }
        await Validate(request,space.Id,ct);
        var story=new Story {Id=Guid.NewGuid(),WorldId=space.Id};Apply(story,request);
        repo.Add(story);await repo.Save(ct);return await Card(story.Id,ct);
    }
    public async Task<StoryCard> Update(Guid id,StorySetupRequest request,CancellationToken ct)
    {
        var story=await repo.Story(id,ct)??throw new WorkflowException(404,"Story not found.");
        if(story.Revision!=request.Revision)throw new WorkflowException(409,"Story details changed elsewhere. Keep your draft and reload before retrying.");
        if(request.SpaceId is {} spaceId && spaceId!=story.WorldId)throw new WorkflowException(400,"Moving an existing story between spaces is not supported yet.");
        await Validate(request,story.WorldId,ct);Apply(story,request);story.Revision++;
        await repo.Save(ct);return await Card(id,ct);
    }
    private async Task Validate(StorySetupRequest r,Guid worldId,CancellationToken ct)
    {
        if(r.Tags.Any(x=>string.IsNullOrWhiteSpace(x)||x.Trim().Length>40))throw new WorkflowException(400,"Tags must contain 1–40 characters.");
        if(r.CoverAssetId is {} coverId)
        {
            var asset=await repo.Asset(coverId,ct);
            if(asset is null||asset.WorldId!=worldId||asset.ImageFileName is null)throw new WorkflowException(400,"Choose cover artwork from this story’s space.");
        }
        if(r.SeriesId is {} seriesId && (await repo.Series(seriesId,ct))?.WorldId!=worldId)throw new WorkflowException(400,"Choose a series from this story’s space.");
    }
    private static void Apply(Story story,StorySetupRequest r)
    {
        story.Title=r.Title.Trim();story.Synopsis=r.Overview.Trim();story.Tags=r.Tags.Select(x=>x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        story.StartingSection=r.StartingSection;story.CoverAssetId=r.CoverAssetId;story.SeriesId=r.SeriesId;story.UpdatedAt=DateTimeOffset.UtcNow;
    }
    public async Task<SeriesSummary> CreateSeries(SeriesSetupRequest r,CancellationToken ct)
    {
        _=await repo.Space(r.SpaceId,ct)??throw new WorkflowException(404,"Space not found.");
        var series=new Series {Id=Guid.NewGuid(),WorldId=r.SpaceId,Name=r.Name.Trim()};repo.Add(series);await repo.Save(ct);
        return new(series.Id,series.WorldId,series.Name);
    }
    public async Task<LibraryRouteContext> Context(string kind,Guid id,CancellationToken ct)
    {
        var storyId=await repo.StoryFor(kind,id,ct)??throw new WorkflowException(404,"Content not found.");
        var story=await Card(storyId,ct);return new(story.Id,story.SpaceId);
    }
    public Task<NovelResponse[]> Novels(Guid id,CancellationToken ct)=>repo.Novels(id,ct);
    public async Task<NovelResponse> CreateNovel(Guid id,string title,CancellationToken ct)
    {
        _=await repo.Story(id,ct)??throw new WorkflowException(404,"Story not found.");
        var novel=new Novel {Id=Guid.NewGuid(),StoryId=id,Title=title.Trim()};repo.Add(novel);await repo.Save(ct);
        return new(novel.Id,novel.StoryId,novel.Title,0);
    }
    public async Task<Guid> CreateComic(Guid id,string title,CancellationToken ct)
    {
        var story=await repo.Story(id,ct)??throw new WorkflowException(404,"Story not found.");
        var comic=new Comic {Id=Guid.NewGuid(),StoryId=id,Title=title.Trim()};repo.Add(comic);
        var page=new ComicPage {Id=Guid.NewGuid(),ComicId=comic.Id,Number=1,Layout="stacked"};repo.Add(page);
        for(var i=1;i<=3;i++)repo.Add(new Panel {Id=Guid.NewGuid(),PageId=page.Id,Order=i,Title=$"Panel {i}"});
        story.UpdatedAt=DateTimeOffset.UtcNow;await repo.Save(ct);return comic.Id;
    }
}

using Talechemy.Api.DTOs.Library;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Services;
public sealed class LibraryService(ILibraryRepository repo)
{
    public Task<LibrarySnapshot> Snapshot(CancellationToken ct)=>repo.Snapshot(ct);
    public async Task<StoryCard> Card(Guid id,CancellationToken ct)=>await repo.Card(id,ct)??throw new WorkflowException(404,"Story not found.");
    public async Task<StoryCard> Create(StorySetupRequest request,CancellationToken ct)
    {
        var space=await repo.Space(request.SpaceId,ct)??throw new WorkflowException(404,"Space not found.");
        await ValidateCover(request.CoverAssetId, request.SpaceId, ct);
        Validate(request);
        var existing=await repo.Stories(space.Id,ct);
        var story=new Story {Id=Guid.NewGuid(),WorldId=space.Id,Order=existing.Select(x=>x.Order).DefaultIfEmpty().Max()+1};Apply(story,request);
        repo.Add(story);await repo.Save(ct);return await Card(story.Id,ct);
    }
    public async Task<StoryCard> Update(Guid id,StorySetupRequest request,CancellationToken ct)
    {
        var story=await repo.Story(id,ct)??throw new WorkflowException(404,"Story not found.");
        if(story.Revision!=request.Revision)throw new WorkflowException(409,"Story details changed elsewhere. Keep your draft and reload before retrying.");
        if(request.SpaceId!=story.WorldId)throw new WorkflowException(400,"Moving an existing story between spaces is not supported yet.");
        await ValidateCover(request.CoverAssetId, request.SpaceId, ct);
        Validate(request);Apply(story,request);story.Revision++;
        await repo.Save(ct);return await Card(id,ct);
    }
    private async Task ValidateCover(Guid? assetId, Guid spaceId, CancellationToken ct)
    {
        if (assetId is not { } id) return;
        var asset = await repo.Asset(id, ct);
        if (asset is null || asset.WorldId != spaceId || asset.ImageFileName is null)
            throw new WorkflowException(400, "Choose cover artwork from this space.");
    }
    private static void Validate(StorySetupRequest r)
    {
        if(r.Tags.Any(x=>string.IsNullOrWhiteSpace(x)||x.Trim().Length>40))throw new WorkflowException(400,"Tags must contain 1–40 characters.");
    }
    private static void Apply(Story story,StorySetupRequest r)
    {
        story.Title=r.Title.Trim();story.Synopsis=r.Overview.Trim();story.Tags=r.Tags.Select(x=>x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        story.CoverAssetId=r.CoverAssetId;
        story.UpdatedAt=DateTimeOffset.UtcNow;
    }
    public async Task<StoryCard[]> Reorder(Guid spaceId, Guid[] ids, CancellationToken ct)
    {
        _=await repo.Space(spaceId,ct)??throw new WorkflowException(404,"Space not found.");
        var stories=await repo.Stories(spaceId,ct);
        if(ids.Length!=stories.Count||ids.Distinct().Count()!=ids.Length||ids.Any(id=>stories.All(s=>s.Id!=id)))
            throw new WorkflowException(409,"The stories in this space changed. Reload before reordering.");
        var offset=stories.Count==0?0:stories.Max(x=>x.Order);
        for(var i=0;i<ids.Length;i++) stories.Single(s=>s.Id==ids[i]).Order=offset+i+1;
        await repo.Save(ct);
        for(var i=0;i<ids.Length;i++) stories.Single(s=>s.Id==ids[i]).Order=i+1;
        await repo.Save(ct);
        var snapshot=await repo.Snapshot(ct);
        return snapshot.Stories.Where(s=>s.SpaceId==spaceId).ToArray();
    }
    public async Task<LibraryRouteContext> Context(string kind,Guid id,CancellationToken ct)
    {
        var spaceId=await repo.SpaceFor(kind,id,ct)??throw new WorkflowException(404,"Content not found.");
        return new(spaceId);
    }
}

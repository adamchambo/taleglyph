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
        Validate(request);
        var story=new Story {Id=Guid.NewGuid(),WorldId=space.Id};Apply(story,request);
        repo.Add(story);await repo.Save(ct);return await Card(story.Id,ct);
    }
    public async Task<StoryCard> Update(Guid id,StorySetupRequest request,CancellationToken ct)
    {
        var story=await repo.Story(id,ct)??throw new WorkflowException(404,"Story not found.");
        if(story.Revision!=request.Revision)throw new WorkflowException(409,"Story details changed elsewhere. Keep your draft and reload before retrying.");
        if(request.SpaceId!=story.WorldId)throw new WorkflowException(400,"Moving an existing story between spaces is not supported yet.");
        Validate(request);Apply(story,request);story.Revision++;
        await repo.Save(ct);return await Card(id,ct);
    }
    private static void Validate(StorySetupRequest r)
    {
        if(r.Tags.Any(x=>string.IsNullOrWhiteSpace(x)||x.Trim().Length>40))throw new WorkflowException(400,"Tags must contain 1–40 characters.");
    }
    private static void Apply(Story story,StorySetupRequest r)
    {
        story.Title=r.Title.Trim();story.Synopsis=r.Overview.Trim();story.Tags=r.Tags.Select(x=>x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        story.UpdatedAt=DateTimeOffset.UtcNow;
    }
    public async Task<LibraryRouteContext> Context(string kind,Guid id,CancellationToken ct)
    {
        var spaceId=await repo.SpaceFor(kind,id,ct)??throw new WorkflowException(404,"Content not found.");
        return new(spaceId);
    }
}

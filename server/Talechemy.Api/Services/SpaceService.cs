using Talechemy.Api.DTOs.Spaces;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.World;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Services;

public sealed class SpaceService(ISpaceRepository repo)
{
    public async Task Update(Guid id, SpaceUpdateRequest r, CancellationToken ct)
    {
        var space = await repo.Space(id, ct) ?? throw new WorkflowException(404, "Space not found.");
        await ValidateCover(r.CoverAssetId, id, ct);
        space.Name = r.Name.Trim(); space.Description = r.Description.Trim(); space.CoverAssetId = r.CoverAssetId;
        await repo.Save(ct);
    }
    public async Task<SpaceWorks> Works(Guid id, CancellationToken ct)
    {
        _ = await repo.Space(id, ct) ?? throw new WorkflowException(404, "Space not found.");
        return new(await repo.Novels(id, ct), await repo.Comics(id, ct));
    }
    public async Task<WorkCard> CreateNovel(Guid spaceId, string title, CancellationToken ct)
    {
        _ = await repo.Space(spaceId, ct) ?? throw new WorkflowException(404, "Space not found.");
        var novel = new Novel { Id = Guid.NewGuid(), WorldId = spaceId, Title = title.Trim() };
        repo.Add(novel); await repo.Save(ct);
        return new(novel.Id, "novel", spaceId, novel.Title, null, novel.UpdatedAt, 0);
    }
    public async Task<WorkCard> CreateComic(Guid spaceId, string title, CancellationToken ct)
    {
        _ = await repo.Space(spaceId, ct) ?? throw new WorkflowException(404, "Space not found.");
        var comic = new Comic { Id = Guid.NewGuid(), WorldId = spaceId, Title = title.Trim() };
        repo.Add(comic);
        var page = new ComicPage { Id = Guid.NewGuid(), ComicId = comic.Id, Number = 1, Layout = "stacked" }; repo.Add(page);
        for (var i = 1; i <= 3; i++) repo.Add(new Panel { Id = Guid.NewGuid(), PageId = page.Id, Order = i, Title = $"Panel {i}" });
        await repo.Save(ct);
        return new(comic.Id, "comic", spaceId, comic.Title, null, comic.UpdatedAt, 1);
    }
    public async Task UpdateWork(string kind, Guid id, WorkUpdateRequest r, CancellationToken ct)
    {
        if (kind == "novel")
        {
            var novel = await repo.Novel(id, ct) ?? throw new WorkflowException(404, "Novel not found.");
            await ValidateCover(r.CoverAssetId, novel.WorldId, ct);
            novel.Title = r.Title.Trim(); novel.CoverAssetId = r.CoverAssetId; novel.UpdatedAt = DateTimeOffset.UtcNow;
        }
        else if (kind == "comic")
        {
            var comic = await repo.Comic(id, ct) ?? throw new WorkflowException(404, "Comic not found.");
            await ValidateCover(r.CoverAssetId, comic.WorldId, ct);
            comic.Title = r.Title.Trim(); comic.CoverAssetId = r.CoverAssetId; comic.UpdatedAt = DateTimeOffset.UtcNow;
        }
        else throw new WorkflowException(404, "Unknown kind of work.");
        await repo.Save(ct);
    }
    private async Task ValidateCover(Guid? assetId, Guid spaceId, CancellationToken ct)
    {
        if (assetId is not { } id) return;
        var asset = await repo.Asset(id, ct);
        if (asset is null || asset.WorldId != spaceId || asset.ImageFileName is null)
            throw new WorkflowException(400, "Choose cover artwork from this space.");
    }

    public async Task<ArcResponse[]> Arcs(Guid spaceId, CancellationToken ct)
    {
        _ = await repo.Space(spaceId, ct) ?? throw new WorkflowException(404, "Space not found.");
        return await repo.Arcs(spaceId, ct);
    }
    public async Task<ArcResponse> CreateArc(Guid storyId, ArcRequest r, CancellationToken ct)
    {
        var story = await repo.Story(storyId, ct) ?? throw new WorkflowException(404, "Story not found.");
        var arcs = await repo.StoryArcs(storyId, ct);
        var arc = new Arc { Id = Guid.NewGuid(), StoryId = storyId, Title = r.Title.Trim(), Summary = r.Summary.Trim(), Order = arcs.Select(x => x.Order).DefaultIfEmpty().Max() + 1 };
        repo.Add(arc); story.UpdatedAt = DateTimeOffset.UtcNow; await repo.Save(ct);
        return Map(arc);
    }
    public async Task<ArcResponse> UpdateArc(Guid id, ArcRequest r, CancellationToken ct)
    {
        var arc = await repo.Arc(id, ct) ?? throw new WorkflowException(404, "Arc not found.");
        arc.Title = r.Title.Trim(); arc.Summary = r.Summary.Trim(); await repo.Save(ct);
        return Map(arc);
    }
    public async Task DeleteArc(Guid id, CancellationToken ct)
    {
        var arc = await repo.Arc(id, ct) ?? throw new WorkflowException(404, "Arc not found.");
        repo.RemoveRange(await repo.LinksTouching("arc", id, ct)); repo.Remove(arc);
        await repo.Save(ct);
    }
    public async Task<ArcResponse[]> ReorderArcs(Guid storyId, Guid[] ids, CancellationToken ct)
    {
        var arcs = await repo.StoryArcs(storyId, ct);
        if (ids.Length != arcs.Length || ids.Distinct().Count() != ids.Length || ids.Any(id => arcs.All(a => a.Id != id)))
            throw new WorkflowException(409, "The arcs in this story changed. Reload before reordering.");
        // (StoryId, Order) is unique and PostgreSQL checks it per row, so swapping in place collides.
        // The first save writes the new order above the current range; the second compacts it to 1..n.
        var offset = arcs.Max(x => x.Order);
        for (var i = 0; i < ids.Length; i++) arcs.Single(a => a.Id == ids[i]).Order = offset + i + 1;
        await repo.Save(ct);
        for (var i = 0; i < ids.Length; i++) arcs.Single(a => a.Id == ids[i]).Order = i + 1;
        await repo.Save(ct);
        return arcs.OrderBy(x => x.Order).Select(Map).ToArray();
    }
    private static ArcResponse Map(Arc x) => new(x.Id, x.StoryId, x.Title, x.Summary, x.Order);

    public async Task<LinkResponse[]> Links(Guid spaceId, CancellationToken ct)
    {
        _ = await repo.Space(spaceId, ct) ?? throw new WorkflowException(404, "Space not found.");
        return await repo.Links(spaceId, ct);
    }
    public async Task<LinkResponse> CreateLink(LinkRequest r, CancellationToken ct)
    {
        var fromSpace = await repo.SpaceOf(r.FromKind, r.FromId, ct);
        var toSpace = await repo.SpaceOf(r.ToKind, r.ToId, ct);
        if (LinkRules.Check(r.FromKind, fromSpace, r.ToKind, toSpace) is { } problem) throw problem;
        if (await repo.LinkExists(r.FromKind, r.FromId, r.ToKind, r.ToId, ct)) throw new WorkflowException(409, "That link already exists.");
        var link = new Link { Id = Guid.NewGuid(), WorldId = fromSpace!.Value, FromKind = r.FromKind, FromId = r.FromId, ToKind = r.ToKind, ToId = r.ToId };
        repo.Add(link); await repo.Save(ct);
        return new(link.Id, link.FromKind, link.FromId, link.ToKind, link.ToId);
    }
    public async Task DeleteLink(Guid id, CancellationToken ct)
    {
        var link = await repo.Link(id, ct) ?? throw new WorkflowException(404, "Link not found.");
        repo.Remove(link); await repo.Save(ct);
    }

    public async Task<NoteCard[]> Notes(Guid spaceId, CancellationToken ct)
    {
        _ = await repo.Space(spaceId, ct) ?? throw new WorkflowException(404, "Space not found.");
        return await repo.Notes(spaceId, ct);
    }
    public async Task<NoteCard> CreateNote(Guid spaceId, NoteRequest r, CancellationToken ct)
    {
        _ = await repo.Space(spaceId, ct) ?? throw new WorkflowException(404, "Space not found.");
        var note = new Note { Id = Guid.NewGuid(), WorldId = spaceId, Title = r.Title.Trim(), Content = r.Content };
        repo.Add(note); await repo.Save(ct);
        return new(note.Id, note.WorldId, note.Title, note.Content, note.UpdatedAt);
    }
    public async Task<NoteCard> UpdateNote(Guid id, NoteRequest r, CancellationToken ct)
    {
        var note = await repo.Note(id, ct) ?? throw new WorkflowException(404, "Note not found.");
        note.Title = r.Title.Trim(); note.Content = r.Content; note.UpdatedAt = DateTimeOffset.UtcNow;
        await repo.Save(ct);
        return new(note.Id, note.WorldId, note.Title, note.Content, note.UpdatedAt);
    }
    public async Task DeleteNote(Guid id, CancellationToken ct)
    {
        var note = await repo.Note(id, ct) ?? throw new WorkflowException(404, "Note not found.");
        repo.RemoveRange(await repo.LinksTouching("note", id, ct)); repo.Remove(note);
        await repo.Save(ct);
    }
}

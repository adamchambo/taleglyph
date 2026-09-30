using System.Text.Json;
using Talechemy.Api.DTOs.Comics;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Providers.Adaptation;
using Talechemy.Api.Repositories.Interfaces;
namespace Talechemy.Api.Services;

public sealed class AdaptationService(IWorkspaceRepository repo, IAdaptationPlanner planner)
{
    public async Task<Guid> Adapt(Guid chapterId, AdaptChapterRequest request, CancellationToken ct)
    {
        var chapter = await repo.Chapter(chapterId, ct) ?? throw new WorkflowException(404, "Chapter not found.");
        var story = (await repo.Story(chapter.StoryId, ct))!;
        var all = await repo.Scenes(chapterId, ct);
        var scenes = all.Where(x => request.SceneIds.Contains(x.Id)).ToArray();
        if (scenes.Length != request.SceneIds.Length) throw new WorkflowException(400, "Select distinct scenes from this chapter.");
        PanelDraft[] panels;
        if (request.TemplateId is { } templateId)
        {
            var template = await repo.Template(templateId, ct);
            if (template is null || template.WorldId != story.WorldId) throw new WorkflowException(400, "Choose a template from this world.");
            panels = JsonSerializer.Deserialize<PanelDraft[]>(template.ContentJson)!;
        }
        else panels = Enumerable.Range(1, request.PanelCount).Select(i => new PanelDraft { Title = $"Panel {i}" }).ToArray();
        await ValidateAssets(story.WorldId, panels, ct);
        var plan = await planner.Plan(scenes, panels, ct);
        var comic = new Comic { Id = Guid.NewGuid(), StoryId = story.Id, Title = request.Title.Trim() };
        repo.Add(comic);
        var number = 0;
        foreach (var item in plan)
        {
            var page = new ComicPage { Id = Guid.NewGuid(), ComicId = comic.Id, Number = ++number, Layout = "stacked" };
            repo.Add(page); AddPanels(page.Id, item.Panels);
            repo.Add(new AdaptationLink
            {
                Id = Guid.NewGuid(),
                SceneId = item.Source.Id,
                ComicPageId = page.Id,
                SourceRevision = item.Source.Revision,
                ReviewedRevision = item.Source.Revision,
                SourceTitle = item.Source.Title,
                SourceProse = item.Source.Prose,
                Planner = planner.Name
            });
        }
        // One SaveChanges transaction commits the entire adaptation or nothing.
        await repo.Save(ct); return comic.Id;
    }
    public async Task<ComicWorkspace> Workspace(Guid comicId, CancellationToken ct)
    {
        var comic = await repo.Comic(comicId, ct) ?? throw new WorkflowException(404, "Comic not found.");
        var story = (await repo.Story(comic.StoryId, ct))!;
        var pages = await repo.Pages(comic.Id, ct);
        var result = new List<EditablePage>();
        foreach (var page in pages) result.Add(await ReadPage(page, ct));
        return new(comic.Id, story.WorldId, comic.Title, story.Title, result);
    }
    private async Task<EditablePage> ReadPage(ComicPage page, CancellationToken ct)
    {
        var panels = await repo.Panels(page.Id, ct);
        var layers = await repo.Layers(panels.Select(x => x.Id).ToArray(), ct);
        SourceReference? source = null;
        if (await repo.Source(page.Id, ct) is { } link)
        {
            var scene = (await repo.Scene(link.SceneId, ct))!;
            var chapter = (await repo.Chapter(scene.ChapterId, ct))!;
            source = new(scene.Id, chapter.Id, chapter.Title, link.SourceTitle, link.SourceProse, link.SourceRevision,
                scene.Title, scene.Prose, scene.Revision, scene.Revision != link.ReviewedRevision);
        }
        return new(page.Id, page.Number, page.Revision, panels.Select(p => new PanelDraft
        {
            Title = p.Title,
            Layers = layers.Where(l => l.PanelId == p.Id).Select(l => new LayerDraft
            {
                Name = l.Name,
                Kind = l.Kind,
                X = l.X,
                Y = l.Y,
                Width = l.Width,
                Visible = l.Visible,
                Locked = l.Locked,
                AssetId = l.AssetId,
                Text = l.Text
            }).ToArray()
        }).ToArray(), source);
    }
    public async Task<EditablePage> SavePage(Guid id, PageDraft request, CancellationToken ct)
    {
        var page = await repo.Page(id, ct) ?? throw new WorkflowException(404, "Page not found.");
        if (page.Revision != request.Revision) throw new WorkflowException(409, "This page changed elsewhere. Copy your changes before reloading.");
        var comic = (await repo.Comic(page.ComicId, ct))!;
        var story = (await repo.Story(comic.StoryId, ct))!;
        await ValidateAssets(story.WorldId, request.Panels, ct);
        var old = await repo.Panels(page.Id, ct);
        repo.RemoveLayers(await repo.Layers(old.Select(x => x.Id).ToArray(), ct));
        repo.RemovePanels(old);
        AddPanels(id, request.Panels);
        page.Revision++;
        await repo.Save(ct);
        return await ReadPage(page, ct);
    }
    private void AddPanels(Guid pageId, PanelDraft[] panels)
    {
        for (var index = 0; index < panels.Length; index++)
        {
            var p = panels[index];
            var panel = new Panel { Id = Guid.NewGuid(), PageId = pageId, Title = p.Title.Trim(), Order = index + 1 };
            repo.Add(panel);
            for (var layerIndex = 0; layerIndex < p.Layers.Length; layerIndex++)
            {
                var l = p.Layers[layerIndex];
                repo.Add(new Layer
                {
                    Id = Guid.NewGuid(),
                    PanelId = panel.Id,
                    Name = l.Name.Trim(),
                    Kind = l.Kind,
                    X = l.X,
                    Y = l.Y,
                    Width = l.Width,
                    Visible = l.Visible,
                    Locked = l.Locked,
                    AssetId = l.AssetId,
                    Text = l.Text,
                    Order = layerIndex
                });
            }
        }
    }
    private async Task ValidateAssets(Guid worldId, PanelDraft[] panels, CancellationToken ct)
    {
        if (panels.Any(p => p is null || p.Layers is null || p.Layers.Any(l => l is null))) throw new WorkflowException(400, "Panels and layers cannot contain empty entries.");
        var layers = panels.SelectMany(p => p.Layers).ToArray();
        if (layers.Any(l => l.Kind == "Image" && l.AssetId is null || l.Kind == "Text" && l.AssetId is not null))
            throw new WorkflowException(400, "Image layers require an asset; text layers must not reference one.");
        var ids = layers.Where(l => l.AssetId.HasValue).Select(l => l.AssetId!.Value).Distinct().ToArray();
        if (await repo.CountAssets(worldId, ids, ct) != ids.Length) throw new WorkflowException(400, "All images must belong to this world.");
    }
    public async Task<TemplateResponse[]> Templates(Guid worldId, CancellationToken ct) =>
        (await repo.Templates(worldId, ct)).Select(t => new TemplateResponse(t.Id, t.WorldId, t.Name, JsonSerializer.Deserialize<PanelDraft[]>(t.ContentJson)!.Length)).ToArray();
    public async Task<TemplateResponse> SaveTemplate(Guid pageId, string name, int revision, CancellationToken ct)
    {
        var page = await repo.Page(pageId, ct) ?? throw new WorkflowException(404, "Page not found.");
        var comic = (await repo.Comic(page.ComicId, ct))!;
        var story = (await repo.Story(comic.StoryId, ct))!;
        if (page.Revision != revision) throw new WorkflowException(409, "This page changed elsewhere. Reload before saving its template.");
        var content = await ReadPage(page, ct);
        var template = new PageTemplate { Id = Guid.NewGuid(), WorldId = story.WorldId, Name = name.Trim(), ContentJson = JsonSerializer.Serialize(content.Panels) };
        repo.Add(template); await repo.Save(ct);
        return new(template.Id, template.WorldId, template.Name, content.Panels.Length);
    }
    public async Task Acknowledge(Guid pageId, int revision, CancellationToken ct)
    {
        var link = await repo.Source(pageId, ct) ?? throw new WorkflowException(404, "Source link not found.");
        var scene = (await repo.Scene(link.SceneId, ct))!;
        if (scene.Revision != revision) throw new WorkflowException(409, "The source changed again. Reload before marking it reviewed.");
        link.ReviewedRevision = revision; await repo.Save(ct);
    }
}

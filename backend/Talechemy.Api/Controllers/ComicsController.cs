using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Comics;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/comics")]
public sealed class ComicsController(IComicService service, IStoryService stories) : ControllerBase
{
    [HttpGet] public async Task<ActionResult<IReadOnlyList<ComicResponse>>> List([FromQuery] Guid storyId, CancellationToken ct) => (await stories.GetStoryAsync(storyId, ct)) is null ? NotFound() : Ok((await service.GetComicsAsync(storyId, ct)));
    [HttpGet("{id:guid}")] public async Task<ActionResult<ComicResponse>> Get(Guid id, CancellationToken ct) => (await service.GetComicAsync(id, ct)) is { } comic ? Ok(comic) : NotFound();
    [HttpGet("{id:guid}/pages")] public async Task<ActionResult<IReadOnlyList<ComicPageResponse>>> Pages(Guid id, CancellationToken ct) => (await service.GetComicAsync(id, ct)) is null ? NotFound() : Ok((await service.GetPagesAsync(id, ct)));
    [HttpGet("pages/{id:guid}")] public async Task<ActionResult<ComicPageResponse>> Page(Guid id, CancellationToken ct) => (await service.GetPageAsync(id, ct)) is { } page ? Ok(page) : NotFound();
    [HttpGet("pages/{id:guid}/panels")] public async Task<ActionResult<IReadOnlyList<PanelResponse>>> Panels(Guid id, CancellationToken ct) => (await service.GetPageAsync(id, ct)) is null ? NotFound() : Ok((await service.GetPanelsAsync(id, ct)));
    [HttpGet("panels/{id:guid}/layers")] public async Task<ActionResult<IReadOnlyList<LayerResponse>>> Layers(Guid id, CancellationToken ct) => (await service.GetPanelAsync(id, ct)) is null ? NotFound() : Ok((await service.GetLayersAsync(id, ct)));
}

using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Authoring;
using Talechemy.Api.DTOs.Comics;
using Talechemy.Api.Services;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/adaptations")]
public sealed class AdaptationsController(AdaptationService service) : ControllerBase
{
    [HttpPost("chapters/{id:guid}")]
    public async Task<IActionResult> Adapt(Guid id, AdaptChapterRequest request, CancellationToken ct) => Ok(new { id = await service.Adapt(id, request, ct) });
    [HttpGet("comics/{id:guid}")]
    public async Task<IActionResult> Workspace(Guid id, CancellationToken ct) => Ok(await service.Workspace(id, ct));
    [HttpPut("pages/{id:guid}")]
    public async Task<IActionResult> Save(Guid id, PageDraft request, CancellationToken ct) => Ok(await service.SavePage(id, request, ct));
    [HttpGet("templates")]
    public async Task<IActionResult> Templates([FromQuery] Guid worldId, CancellationToken ct) => Ok(await service.Templates(worldId, ct));
    [HttpPost("pages/{id:guid}/templates")]
    public async Task<IActionResult> Template(Guid id, TemplateRequest request, CancellationToken ct) => Ok(await service.SaveTemplate(id, request.Title, request.Revision, ct));
    [HttpPost("pages/{id:guid}/review")]
    public async Task<IActionResult> Review(Guid id, [FromQuery] int revision, CancellationToken ct)
    { await service.Acknowledge(id, revision, ct); return NoContent(); }
}

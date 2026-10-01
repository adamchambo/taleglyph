using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Authoring;
using Talechemy.Api.DTOs.Spaces;
using Talechemy.Api.Services;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api")]
public sealed class SpacesController(SpaceService service) : ControllerBase
{
    [HttpPut("spaces/{id:guid}")] public async Task<IActionResult> Update(Guid id, SpaceUpdateRequest request, CancellationToken ct) { await service.Update(id, request, ct); return NoContent(); }
    [HttpGet("spaces/{id:guid}/works")] public async Task<IActionResult> Works(Guid id, CancellationToken ct) => Ok(await service.Works(id, ct));
    [HttpPost("spaces/{id:guid}/novels")] public async Task<IActionResult> Novel(Guid id, TitleRequest request, CancellationToken ct) => Ok(await service.CreateNovel(id, request.Title, ct));
    [HttpPost("spaces/{id:guid}/comics")] public async Task<IActionResult> Comic(Guid id, TitleRequest request, CancellationToken ct) => Ok(await service.CreateComic(id, request.Title, ct));
    [HttpPut("works/{kind}/{id:guid}")] public async Task<IActionResult> UpdateWork(string kind, Guid id, WorkUpdateRequest request, CancellationToken ct) { await service.UpdateWork(kind, id, request, ct); return NoContent(); }

    [HttpGet("spaces/{id:guid}/arcs")] public async Task<IActionResult> Arcs(Guid id, CancellationToken ct) => Ok(await service.Arcs(id, ct));
    [HttpPost("stories/{id:guid}/arcs")] public async Task<IActionResult> CreateArc(Guid id, ArcRequest request, CancellationToken ct) => Ok(await service.CreateArc(id, request, ct));
    [HttpPut("stories/{id:guid}/arcs/order")] public async Task<IActionResult> ReorderArcs(Guid id, ArcOrderRequest request, CancellationToken ct) => Ok(await service.ReorderArcs(id, request.ArcIds, ct));
    [HttpPut("arcs/{id:guid}")] public async Task<IActionResult> UpdateArc(Guid id, ArcRequest request, CancellationToken ct) => Ok(await service.UpdateArc(id, request, ct));
    [HttpDelete("arcs/{id:guid}")] public async Task<IActionResult> DeleteArc(Guid id, CancellationToken ct) { await service.DeleteArc(id, ct); return NoContent(); }

    [HttpGet("spaces/{id:guid}/links")] public async Task<IActionResult> Links(Guid id, CancellationToken ct) => Ok(await service.Links(id, ct));
    [HttpPost("links")] public async Task<IActionResult> CreateLink(LinkRequest request, CancellationToken ct) => Ok(await service.CreateLink(request, ct));
    [HttpDelete("links/{id:guid}")] public async Task<IActionResult> DeleteLink(Guid id, CancellationToken ct) { await service.DeleteLink(id, ct); return NoContent(); }

    [HttpGet("spaces/{id:guid}/notes")] public async Task<IActionResult> Notes(Guid id, CancellationToken ct) => Ok(await service.Notes(id, ct));
    [HttpPost("spaces/{id:guid}/notes")] public async Task<IActionResult> CreateNote(Guid id, NoteRequest request, CancellationToken ct) => Ok(await service.CreateNote(id, request, ct));
    [HttpPut("notes/{id:guid}")] public async Task<IActionResult> UpdateNote(Guid id, NoteRequest request, CancellationToken ct) => Ok(await service.UpdateNote(id, request, ct));
    [HttpDelete("notes/{id:guid}")] public async Task<IActionResult> DeleteNote(Guid id, CancellationToken ct) { await service.DeleteNote(id, ct); return NoContent(); }
}

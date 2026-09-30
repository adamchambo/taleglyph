using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Worlds;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/worlds")]
public sealed class WorldsController(IWorldService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult<IReadOnlyList<WorldResponse>>> List(CancellationToken ct) => Ok((await service.GetWorldsAsync(ct)));
    [HttpGet("{id:guid}")] public async Task<ActionResult<WorldResponse>> Get(Guid id, CancellationToken ct) => (await service.GetWorldAsync(id, ct)) is { } world ? Ok(world) : NotFound();
    [HttpGet("{id:guid}/lore")] public async Task<ActionResult<IReadOnlyList<LoreEntryResponse>>> Lore(Guid id, CancellationToken ct) => (await service.GetWorldAsync(id, ct)) is null ? NotFound() : Ok((await service.GetLoreAsync(id, ct)));
    [HttpGet("{id:guid}/relationships")] public async Task<ActionResult<IReadOnlyList<RelationshipResponse>>> Relationships(Guid id, CancellationToken ct) => (await service.GetWorldAsync(id, ct)) is null ? NotFound() : Ok((await service.GetRelationshipsAsync(id, ct)));
    [HttpGet("{id:guid}/notes")] public async Task<ActionResult<IReadOnlyList<NoteResponse>>> Notes(Guid id, CancellationToken ct) => (await service.GetWorldAsync(id, ct)) is null ? NotFound() : Ok((await service.GetNotesAsync(id, ct)));

    [HttpPost]
    public async Task<ActionResult<WorldResponse>> Create(CreateWorldRequest request, CancellationToken ct)
    {
        var world = await service.CreateWorldAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = world.Id }, world);
    }
}

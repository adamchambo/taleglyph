using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Characters;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/characters")]
public sealed class CharactersController(IWorldService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult<IReadOnlyList<CharacterResponse>>> List([FromQuery] Guid worldId, CancellationToken ct) => (await service.GetWorldAsync(worldId, ct)) is null ? NotFound() : Ok((await service.GetCharactersAsync(worldId, ct)));
    [HttpGet("{id:guid}")] public async Task<ActionResult<CharacterResponse>> Get(Guid id, CancellationToken ct) => (await service.GetCharacterAsync(id, ct)) is { } character ? Ok(character) : NotFound();
    [HttpPost]
    public async Task<ActionResult<CharacterResponse>> Create(CreateCharacterRequest request, CancellationToken ct)
    {
        var character = (await service.CreateCharacterAsync(request, ct));
        return character is null ? NotFound() : CreatedAtAction(nameof(Get), new { id = character.Id }, character);
    }
    [HttpPut("{id:guid}")] public async Task<ActionResult<CharacterResponse>> Update(Guid id, UpdateCharacterRequest request, CancellationToken ct) => (await service.UpdateCharacterAsync(id, request, ct)) is { } character ? Ok(character) : NotFound();
}

using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Locations;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/locations")]
public sealed class LocationsController(IWorldService service) : ControllerBase
{
    [HttpGet] public async Task<ActionResult<IReadOnlyList<LocationResponse>>> List([FromQuery] Guid worldId, CancellationToken ct) => (await service.GetWorldAsync(worldId, ct)) is null ? NotFound() : Ok((await service.GetLocationsAsync(worldId, ct)));
}

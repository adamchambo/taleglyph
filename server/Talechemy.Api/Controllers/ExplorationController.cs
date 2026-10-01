using Microsoft.AspNetCore.Mvc;
using Talechemy.Api.DTOs.Exploration;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Controllers;

[ApiController, Route("api/exploration")]
public sealed class ExplorationController(IExplorationService service) : ControllerBase
{
    [HttpPost("generate")]
    public async Task<ActionResult<GenerationResponse>> Generate(GenerateRequest request, CancellationToken cancellationToken)
    {
        var result = await service.GenerateAsync(request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}

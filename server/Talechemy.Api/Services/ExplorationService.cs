using Talechemy.Api.DTOs.Exploration;
using Talechemy.Api.Models.Exploration;
using Talechemy.Api.Providers.AI;
using Talechemy.Api.Repositories.Interfaces;
using Talechemy.Api.Services.Interfaces;
namespace Talechemy.Api.Services;

public sealed class ExplorationService(IWorldRepository worlds, IAiProvider provider) : IExplorationService
{
    public async Task<GenerationResponse?> GenerateAsync(GenerateRequest request, CancellationToken cancellationToken)
    {
        if ((await worlds.GetWorldAsync(request.WorldId, cancellationToken)) is null) return null;
        var result = await provider.GenerateAsync(new Experiment { Id = Guid.NewGuid(), WorldId = request.WorldId, Prompt = request.Prompt.Trim(), Kind = request.Kind }, cancellationToken);
        return new(result.ExperimentId, result.Description, result.IsSimulated);
    }
}

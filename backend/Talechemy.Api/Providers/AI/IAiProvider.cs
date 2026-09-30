using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Providers.AI;

public interface IAiProvider
{
    Task<GenerationResult> GenerateAsync(Experiment experiment, CancellationToken cancellationToken);
}

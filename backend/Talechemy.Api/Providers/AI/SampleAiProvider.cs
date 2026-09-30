using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Providers.AI;
// Deterministic placeholder. No external service, credentials, or AI generation.
public sealed class SampleAiProvider : IAiProvider
{
    public Task<GenerationResult> GenerateAsync(Experiment experiment, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult(new GenerationResult(experiment.Id, $"Sample {experiment.Kind.ToLowerInvariant()} exploration. Prompt received: {experiment.Prompt}", true));
    }
}

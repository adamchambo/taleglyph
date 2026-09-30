using Talechemy.Api.DTOs.Exploration;
namespace Talechemy.Api.Services.Interfaces;

public interface IExplorationService
{
    Task<GenerationResponse?> GenerateAsync(GenerateRequest request, CancellationToken cancellationToken);
}

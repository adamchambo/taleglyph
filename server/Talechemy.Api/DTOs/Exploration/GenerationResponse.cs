namespace Talechemy.Api.DTOs.Exploration;

public sealed record GenerationResponse(Guid ExperimentId, string Description, bool IsSimulated);

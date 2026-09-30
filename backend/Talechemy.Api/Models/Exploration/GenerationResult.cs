namespace Talechemy.Api.Models.Exploration;

public sealed record GenerationResult(Guid ExperimentId, string Description, bool IsSimulated);

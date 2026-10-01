using System.ComponentModel.DataAnnotations;
namespace Talechemy.Api.DTOs.Worlds;

public sealed record WorldResponse(Guid Id, string Name, string Description, string Theme, string CastSummary);
public sealed class CastSummaryRequest
{
    [StringLength(4000)] public string Summary { get; init; } = "";
}

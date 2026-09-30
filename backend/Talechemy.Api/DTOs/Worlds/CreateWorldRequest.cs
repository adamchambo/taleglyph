using System.ComponentModel.DataAnnotations;
namespace Talechemy.Api.DTOs.Worlds;

public sealed class CreateWorldRequest
{
    [Required, StringLength(120)] public string Name { get; init; } = "";
    [StringLength(4000)] public string Description { get; init; } = "";
    [Required, RegularExpression("^(fantasy|scifi)$")] public string Theme { get; init; } = "fantasy";
}

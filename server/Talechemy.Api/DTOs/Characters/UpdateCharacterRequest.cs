using System.ComponentModel.DataAnnotations;
using Talechemy.Api.Validation;
namespace Talechemy.Api.DTOs.Characters;

public sealed class UpdateCharacterRequest
{

    [Required, StringLength(120)] public string Name { get; init; } = "";
    [StringLength(120)] public string Role { get; init; } = "";
    [StringLength(4000)] public string Description { get; init; } = "";
    [StringLength(2000)] public string Motivation { get; init; } = "";
    [Required, RegularExpression("^(Draft|Canon)$")] public string CanonStatus { get; init; } = "Draft";
}

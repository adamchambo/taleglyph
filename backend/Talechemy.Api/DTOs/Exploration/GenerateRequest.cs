using System.ComponentModel.DataAnnotations;
using Talechemy.Api.Validation;
namespace Talechemy.Api.DTOs.Exploration;

public sealed class GenerateRequest
{
    [NonEmptyGuid] public Guid WorldId { get; init; }
    [Required, StringLength(2000)] public string Prompt { get; init; } = "";
    [Required, RegularExpression("^(Character|Location|Prop)$")] public string Kind { get; init; } = "Character";
}

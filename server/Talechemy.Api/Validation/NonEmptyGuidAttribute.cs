using System.ComponentModel.DataAnnotations;
namespace Talechemy.Api.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class NonEmptyGuidAttribute : ValidationAttribute
{
    public NonEmptyGuidAttribute() : base("A non-empty identifier is required.") { }
    public override bool IsValid(object? value) => value is Guid id && id != Guid.Empty;
}

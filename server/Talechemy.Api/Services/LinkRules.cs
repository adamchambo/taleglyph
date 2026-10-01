namespace Talechemy.Api.Services;

public static class LinkRules
{
    public static readonly string[] FromKinds = ["novel", "comic", "note"];
    public static readonly string[] ToKinds = ["story", "arc"];

    public static WorkflowException? Check(string fromKind, Guid? fromSpace, string toKind, Guid? toSpace)
    {
        if (!FromKinds.Contains(fromKind) || !ToKinds.Contains(toKind))
            return new(400, $"A {fromKind} cannot link to a {toKind}.");
        if (fromSpace is null || toSpace is null) return new(404, "One side of that link no longer exists.");
        if (fromSpace != toSpace) return new(400, "Links stay inside one space.");
        return null;
    }
}

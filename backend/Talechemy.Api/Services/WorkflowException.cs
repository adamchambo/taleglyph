namespace Talechemy.Api.Services;

public sealed class WorkflowException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

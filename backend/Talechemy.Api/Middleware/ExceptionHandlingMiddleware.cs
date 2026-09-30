using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
namespace Talechemy.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var status = exception switch
        {
            Talechemy.Api.Services.WorkflowException workflow => workflow.Status,
            Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException => 409,
            Microsoft.EntityFrameworkCore.DbUpdateException { InnerException: Npgsql.PostgresException { SqlState: "23505" } } => 409,
            _ => 500
        };
        var title = exception is Talechemy.Api.Services.WorkflowException ? exception.Message : status == 409 ? "This content changed elsewhere. Reload before retrying." : "An unexpected error occurred.";
        if (status == 500) logger.LogError(exception, "Unhandled request error. Trace: {TraceId}", context.TraceIdentifier);
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title = title,
            Extensions = { ["traceId"] = context.TraceIdentifier }
        }, cancellationToken);
        return true;
    }
}

using Talechemy.Api.Extensions;
using Talechemy.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ExceptionHandlingMiddleware>();
builder.Services.AddTalechemy(builder.Configuration);
var app = builder.Build();
app.UseExceptionHandler();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", storage = "postgresql" }));
app.MapControllers();
app.Run();

public partial class Program { }

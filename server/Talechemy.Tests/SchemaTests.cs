using Microsoft.EntityFrameworkCore;
using Talechemy.Api.Data;
using Xunit;

namespace Talechemy.Tests;

public class SchemaTests
{
    [Fact]
    public void SchemaCanBeBuiltForPostgreSqlWithoutConnecting()
    {
        var options = new DbContextOptionsBuilder<TalechemyDbContext>()
            .UseNpgsql("Host=localhost;Database=schema_validation")
            .Options;
        using var db = new TalechemyDbContext(options);
        var sql = db.Database.GenerateCreateScript();
        Assert.Contains("CREATE TABLE", sql);
        Assert.Contains("FOREIGN KEY", sql);
        Assert.Contains("CREATE UNIQUE INDEX", sql);
    }
}

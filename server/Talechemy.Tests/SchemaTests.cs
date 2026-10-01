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
        var story = db.Model.FindEntityType(typeof(Talechemy.Api.Models.Stories.Story))!;
        Assert.True(story.FindProperty("CoverAssetId")!.IsNullable);
        var cover = Assert.Single(story.GetForeignKeys(), fk => fk.Properties.Single().Name == "CoverAssetId");
        Assert.Equal(DeleteBehavior.Restrict, cover.DeleteBehavior);
        Assert.Equal(typeof(Talechemy.Api.Models.Assets.Asset), cover.PrincipalEntityType.ClrType);
        Assert.Contains("CREATE TABLE", sql);
        Assert.Contains("FOREIGN KEY", sql);
        Assert.Contains("CREATE UNIQUE INDEX", sql);
    }
}

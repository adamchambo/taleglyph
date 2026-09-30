using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Data.Configurations;

public sealed class ComicPageConfiguration : IEntityTypeConfiguration<ComicPage>
{
    public void Configure(EntityTypeBuilder<ComicPage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Revision).IsConcurrencyToken().HasDefaultValue(1);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Layout).IsRequired().HasMaxLength(32);
        builder.HasOne<Comic>().WithMany().HasForeignKey(x => x.ComicId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.ComicId, x.Number }).IsUnique();
    }
}

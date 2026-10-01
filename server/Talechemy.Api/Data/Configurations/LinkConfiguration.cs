using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.World;

namespace Talechemy.Api.Data.Configurations;

public sealed class LinkConfiguration : IEntityTypeConfiguration<Link>
{
    public void Configure(EntityTypeBuilder<Link> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.FromKind).IsRequired().HasMaxLength(16);
        builder.Property(x => x.ToKind).IsRequired().HasMaxLength(16);
        builder.HasOne<World>().WithMany().HasForeignKey(x => x.WorldId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.FromKind, x.FromId, x.ToKind, x.ToId }).IsUnique();
        builder.HasIndex(x => new { x.ToKind, x.ToId });
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Talechemy.Api.Models.World;
using Talechemy.Api.Models.Stories;
using Talechemy.Api.Models.Comics;
using Talechemy.Api.Models.Assets;
using Talechemy.Api.Models.Exploration;
namespace Talechemy.Api.Data.Configurations;

public sealed class CharacterConfiguration : IEntityTypeConfiguration<Character>
{
    public void Configure(EntityTypeBuilder<Character> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(120);
        builder.Property(x => x.Role).IsRequired().HasMaxLength(120);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.Motivation).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.CanonStatus).IsRequired().HasMaxLength(32);
        builder.HasOne<World>().WithMany().HasForeignKey(x => x.WorldId).OnDelete(DeleteBehavior.Restrict);
    }
}

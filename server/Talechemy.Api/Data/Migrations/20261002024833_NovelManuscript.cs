using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Talechemy.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class NovelManuscript : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ManuscriptJson",
                table: "Novels",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ManuscriptJson",
                table: "Novels");
        }
    }
}

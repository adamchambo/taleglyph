using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Talechemy.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChapterAdaptationWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Revision",
                table: "Scenes",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Layers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "Width",
                table: "Layers",
                type: "double precision",
                nullable: false,
                defaultValue: 70.0);

            migrationBuilder.AddColumn<int>(
                name: "Revision",
                table: "ComicPages",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "ImageFileName",
                table: "Assets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Planner",
                table: "AdaptationLinks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ReviewedRevision",
                table: "AdaptationLinks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SourceProse",
                table: "AdaptationLinks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SourceRevision",
                table: "AdaptationLinks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SourceTitle",
                table: "AdaptationLinks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PageTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorldId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    ContentJson = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PageTemplates_Worlds_WorldId",
                        column: x => x.WorldId,
                        principalTable: "Worlds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PageTemplates_WorldId",
                table: "PageTemplates",
                column: "WorldId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PageTemplates");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "Scenes");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "Layers");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "Layers");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "ComicPages");

            migrationBuilder.DropColumn(
                name: "ImageFileName",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Planner",
                table: "AdaptationLinks");

            migrationBuilder.DropColumn(
                name: "ReviewedRevision",
                table: "AdaptationLinks");

            migrationBuilder.DropColumn(
                name: "SourceProse",
                table: "AdaptationLinks");

            migrationBuilder.DropColumn(
                name: "SourceRevision",
                table: "AdaptationLinks");

            migrationBuilder.DropColumn(
                name: "SourceTitle",
                table: "AdaptationLinks");
        }
    }
}

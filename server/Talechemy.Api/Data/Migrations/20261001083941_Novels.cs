using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Talechemy.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class Novels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Chapters_StoryId_Order",
                table: "Chapters");

            migrationBuilder.CreateTable(
                name: "Novels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Novels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Novels_Stories_StoryId",
                        column: x => x.StoryId,
                        principalTable: "Stories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddColumn<Guid>(
                name: "NovelId",
                table: "Chapters",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                INSERT INTO "Novels" ("Id", "StoryId", "Title")
                SELECT gen_random_uuid(), s."Id", LEFT(s."Title", 120)
                FROM "Stories" s
                WHERE EXISTS (
                    SELECT 1 FROM "Chapters" c WHERE c."StoryId" = s."Id"
                );

                UPDATE "Chapters" AS c
                SET "NovelId" = n."Id"
                FROM "Novels" AS n
                WHERE n."StoryId" = c."StoryId" AND c."NovelId" IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "NovelId",
                table: "Chapters",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_NovelId_Order",
                table: "Chapters",
                columns: new[] { "NovelId", "Order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_StoryId",
                table: "Chapters",
                column: "StoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Novels_StoryId",
                table: "Novels",
                column: "StoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Chapters_Novels_NovelId",
                table: "Chapters",
                column: "NovelId",
                principalTable: "Novels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chapters_Novels_NovelId",
                table: "Chapters");

            migrationBuilder.DropTable(
                name: "Novels");

            migrationBuilder.DropIndex(
                name: "IX_Chapters_NovelId_Order",
                table: "Chapters");

            migrationBuilder.DropIndex(
                name: "IX_Chapters_StoryId",
                table: "Chapters");

            migrationBuilder.DropColumn(
                name: "NovelId",
                table: "Chapters");

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_StoryId_Order",
                table: "Chapters",
                columns: new[] { "StoryId", "Order" },
                unique: true);
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Talechemy.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class SpaceHub : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Chapters_Stories_StoryId", table: "Chapters");
            migrationBuilder.DropForeignKey(name: "FK_Comics_Stories_StoryId", table: "Comics");
            migrationBuilder.DropForeignKey(name: "FK_Novels_Stories_StoryId", table: "Novels");
            migrationBuilder.DropForeignKey(name: "FK_Stories_Assets_CoverAssetId", table: "Stories");
            migrationBuilder.DropForeignKey(name: "FK_Stories_Series_SeriesId", table: "Stories");

            migrationBuilder.CreateTable(
                name: "Arcs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Summary = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Arcs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Arcs_Stories_StoryId",
                        column: x => x.StoryId,
                        principalTable: "Stories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Links",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorldId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromKind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    FromId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToKind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    ToId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Links", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Links_Worlds_WorldId",
                        column: x => x.WorldId,
                        principalTable: "Worlds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddColumn<Guid>(name: "CoverAssetId", table: "Worlds", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "CoverAssetId", table: "Novels", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "CoverAssetId", table: "Comics", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<DateTimeOffset>(name: "UpdatedAt", table: "Novels", type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP");
            migrationBuilder.AddColumn<DateTimeOffset>(name: "UpdatedAt", table: "Comics", type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP");
            migrationBuilder.AddColumn<DateTimeOffset>(name: "UpdatedAt", table: "Notes", type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP");

            // Novels and comics move from a story to the story's space. The old ownership survives as a
            // link to that story, and the story's cover is copied to the work and, if unset, to its space.
            migrationBuilder.Sql("""
                INSERT INTO "Links" ("Id", "WorldId", "FromKind", "FromId", "ToKind", "ToId")
                SELECT gen_random_uuid(), s."WorldId", 'novel', n."Id", 'story', s."Id"
                FROM "Novels" n JOIN "Stories" s ON s."Id" = n."StoryId";

                INSERT INTO "Links" ("Id", "WorldId", "FromKind", "FromId", "ToKind", "ToId")
                SELECT gen_random_uuid(), s."WorldId", 'comic', c."Id", 'story', s."Id"
                FROM "Comics" c JOIN "Stories" s ON s."Id" = c."StoryId";

                UPDATE "Novels" AS n
                SET "CoverAssetId" = s."CoverAssetId", "UpdatedAt" = s."UpdatedAt", "StoryId" = s."WorldId"
                FROM "Stories" AS s WHERE s."Id" = n."StoryId";

                UPDATE "Comics" AS c
                SET "CoverAssetId" = s."CoverAssetId", "UpdatedAt" = s."UpdatedAt", "StoryId" = s."WorldId"
                FROM "Stories" AS s WHERE s."Id" = c."StoryId";

                UPDATE "Worlds" AS w
                SET "CoverAssetId" = (
                    SELECT s."CoverAssetId" FROM "Stories" s
                    WHERE s."WorldId" = w."Id" AND s."CoverAssetId" IS NOT NULL
                    ORDER BY s."UpdatedAt" DESC LIMIT 1)
                WHERE w."CoverAssetId" IS NULL;
                """);

            migrationBuilder.DropTable(name: "Series");
            migrationBuilder.DropIndex(name: "IX_Stories_CoverAssetId", table: "Stories");
            migrationBuilder.DropIndex(name: "IX_Stories_SeriesId", table: "Stories");
            migrationBuilder.DropIndex(name: "IX_Chapters_StoryId", table: "Chapters");
            migrationBuilder.DropColumn(name: "CoverAssetId", table: "Stories");
            migrationBuilder.DropColumn(name: "SeriesId", table: "Stories");
            migrationBuilder.DropColumn(name: "StartingSection", table: "Stories");
            migrationBuilder.DropColumn(name: "StoryId", table: "Chapters");

            migrationBuilder.RenameColumn(name: "StoryId", table: "Novels", newName: "WorldId");
            migrationBuilder.RenameIndex(name: "IX_Novels_StoryId", table: "Novels", newName: "IX_Novels_WorldId");
            migrationBuilder.RenameColumn(name: "StoryId", table: "Comics", newName: "WorldId");
            migrationBuilder.RenameIndex(name: "IX_Comics_StoryId", table: "Comics", newName: "IX_Comics_WorldId");

            migrationBuilder.CreateIndex(name: "IX_Worlds_CoverAssetId", table: "Worlds", column: "CoverAssetId");
            migrationBuilder.CreateIndex(name: "IX_Novels_CoverAssetId", table: "Novels", column: "CoverAssetId");
            migrationBuilder.CreateIndex(name: "IX_Comics_CoverAssetId", table: "Comics", column: "CoverAssetId");
            migrationBuilder.CreateIndex(name: "IX_Arcs_StoryId_Order", table: "Arcs", columns: new[] { "StoryId", "Order" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_Links_FromKind_FromId_ToKind_ToId", table: "Links", columns: new[] { "FromKind", "FromId", "ToKind", "ToId" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_Links_ToKind_ToId", table: "Links", columns: new[] { "ToKind", "ToId" });
            migrationBuilder.CreateIndex(name: "IX_Links_WorldId", table: "Links", column: "WorldId");

            migrationBuilder.AddForeignKey(name: "FK_Comics_Assets_CoverAssetId", table: "Comics", column: "CoverAssetId", principalTable: "Assets", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Comics_Worlds_WorldId", table: "Comics", column: "WorldId", principalTable: "Worlds", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Novels_Assets_CoverAssetId", table: "Novels", column: "CoverAssetId", principalTable: "Assets", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Novels_Worlds_WorldId", table: "Novels", column: "WorldId", principalTable: "Worlds", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Worlds_Assets_CoverAssetId", table: "Worlds", column: "CoverAssetId", principalTable: "Assets", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Comics_Assets_CoverAssetId", table: "Comics");
            migrationBuilder.DropForeignKey(name: "FK_Comics_Worlds_WorldId", table: "Comics");
            migrationBuilder.DropForeignKey(name: "FK_Novels_Assets_CoverAssetId", table: "Novels");
            migrationBuilder.DropForeignKey(name: "FK_Novels_Worlds_WorldId", table: "Novels");
            migrationBuilder.DropForeignKey(name: "FK_Worlds_Assets_CoverAssetId", table: "Worlds");
            migrationBuilder.DropIndex(name: "IX_Worlds_CoverAssetId", table: "Worlds");
            migrationBuilder.DropIndex(name: "IX_Novels_CoverAssetId", table: "Novels");
            migrationBuilder.DropIndex(name: "IX_Comics_CoverAssetId", table: "Comics");

            migrationBuilder.RenameColumn(name: "WorldId", table: "Novels", newName: "StoryId");
            migrationBuilder.RenameIndex(name: "IX_Novels_WorldId", table: "Novels", newName: "IX_Novels_StoryId");
            migrationBuilder.RenameColumn(name: "WorldId", table: "Comics", newName: "StoryId");
            migrationBuilder.RenameIndex(name: "IX_Comics_WorldId", table: "Comics", newName: "IX_Comics_StoryId");

            migrationBuilder.AddColumn<Guid>(name: "CoverAssetId", table: "Stories", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "SeriesId", table: "Stories", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<string>(name: "StartingSection", table: "Stories", type: "character varying(32)", maxLength: 32, nullable: false, defaultValue: "overview");
            migrationBuilder.AddColumn<Guid>(name: "StoryId", table: "Chapters", type: "uuid", nullable: true);

            // A work goes back to the first story it links to, or any story in its space. A space with
            // works but no stories cannot be represented in the old shape, so the foreign keys below fail.
            migrationBuilder.Sql("""
                UPDATE "Novels" AS n SET "StoryId" = COALESCE(
                    (SELECT l."ToId" FROM "Links" l WHERE l."FromKind" = 'novel' AND l."FromId" = n."Id" AND l."ToKind" = 'story' LIMIT 1),
                    (SELECT s."Id" FROM "Stories" s WHERE s."WorldId" = n."StoryId" ORDER BY s."UpdatedAt" DESC LIMIT 1),
                    n."StoryId");

                UPDATE "Comics" AS c SET "StoryId" = COALESCE(
                    (SELECT l."ToId" FROM "Links" l WHERE l."FromKind" = 'comic' AND l."FromId" = c."Id" AND l."ToKind" = 'story' LIMIT 1),
                    (SELECT s."Id" FROM "Stories" s WHERE s."WorldId" = c."StoryId" ORDER BY s."UpdatedAt" DESC LIMIT 1),
                    c."StoryId");

                UPDATE "Chapters" AS ch SET "StoryId" = n."StoryId" FROM "Novels" n WHERE n."Id" = ch."NovelId";

                UPDATE "Stories" AS s SET "CoverAssetId" = (
                    SELECT n."CoverAssetId" FROM "Novels" n WHERE n."StoryId" = s."Id" AND n."CoverAssetId" IS NOT NULL LIMIT 1);
                """);

            migrationBuilder.AlterColumn<Guid>(name: "StoryId", table: "Chapters", type: "uuid", nullable: false, oldClrType: typeof(Guid), oldType: "uuid", oldNullable: true);

            migrationBuilder.DropTable(name: "Arcs");
            migrationBuilder.DropTable(name: "Links");
            migrationBuilder.DropColumn(name: "CoverAssetId", table: "Worlds");
            migrationBuilder.DropColumn(name: "CoverAssetId", table: "Novels");
            migrationBuilder.DropColumn(name: "UpdatedAt", table: "Novels");
            migrationBuilder.DropColumn(name: "UpdatedAt", table: "Notes");
            migrationBuilder.DropColumn(name: "CoverAssetId", table: "Comics");
            migrationBuilder.DropColumn(name: "UpdatedAt", table: "Comics");

            migrationBuilder.CreateTable(
                name: "Series",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    WorldId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Series", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Series_Worlds_WorldId",
                        column: x => x.WorldId,
                        principalTable: "Worlds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(name: "IX_Stories_CoverAssetId", table: "Stories", column: "CoverAssetId");
            migrationBuilder.CreateIndex(name: "IX_Stories_SeriesId", table: "Stories", column: "SeriesId");
            migrationBuilder.CreateIndex(name: "IX_Chapters_StoryId", table: "Chapters", column: "StoryId");
            migrationBuilder.CreateIndex(name: "IX_Series_WorldId", table: "Series", column: "WorldId");

            migrationBuilder.AddForeignKey(name: "FK_Chapters_Stories_StoryId", table: "Chapters", column: "StoryId", principalTable: "Stories", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Comics_Stories_StoryId", table: "Comics", column: "StoryId", principalTable: "Stories", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Novels_Stories_StoryId", table: "Novels", column: "StoryId", principalTable: "Stories", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Stories_Assets_CoverAssetId", table: "Stories", column: "CoverAssetId", principalTable: "Assets", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_Stories_Series_SeriesId", table: "Stories", column: "SeriesId", principalTable: "Series", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
        }
    }
}

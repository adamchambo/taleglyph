using System.Text.Json;
namespace Talechemy.Api.Services;

/// <summary>
/// Strict allowlist for the stored ProseMirror manuscript document. Every node
/// type, mark and text alignment is enumerated; anything else is rejected.
/// Headings are the section identity and are only valid as top-level blocks.
/// </summary>
internal static class ManuscriptValidation
{
    // Which node types may appear as children of which parent. "doc" is the root.
    private static readonly Dictionary<string, HashSet<string>> Children = new()
    {
        ["doc"] = ["heading", "paragraph", "blockquote", "bulletList", "orderedList", "horizontalRule", "pageBreak"],
        ["blockquote"] = ["paragraph", "bulletList", "orderedList", "blockquote"],
        ["bulletList"] = ["listItem"],
        ["orderedList"] = ["listItem"],
        ["listItem"] = ["paragraph", "bulletList", "orderedList", "blockquote"],
    };
    private static readonly HashSet<string> TextBlocks = ["heading", "paragraph"];
    private static readonly HashSet<string> Inline = ["text", "hardBreak"];
    private static readonly HashSet<string> Marks = ["bold", "italic", "underline", "strike"];
    private static readonly HashSet<string> Alignments = ["left", "center", "right", "justify"];

    public static void Validate(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.GetProperty("type").GetString() != "doc") throw new JsonException();
            var ids = new HashSet<string>();
            ValidateChildren("doc", root.GetProperty("content"), ids);
        }
        catch (Exception e) when (e is JsonException or KeyNotFoundException or InvalidOperationException or FormatException)
        { throw new WorkflowException(400, "Invalid manuscript document or heading identity."); }
    }

    private static void ValidateChildren(string parent, JsonElement content, HashSet<string> headingIds)
    {
        var allowed = Children[parent];
        var count = 0;
        foreach (var node in content.EnumerateArray())
        {
            count++;
            var type = node.GetProperty("type").GetString();
            if (type is null || !allowed.Contains(type)) throw new JsonException();
            ValidateBlock(type, node, headingIds);
        }
        // Containers cannot be empty (the editor schema requires at least one child).
        if (parent != "doc" && count == 0) throw new JsonException();
    }

    private static void ValidateBlock(string type, JsonElement node, HashSet<string> headingIds)
    {
        if (TextBlocks.Contains(type))
        {
            if (type == "heading")
            {
                var attrs = node.GetProperty("attrs");
                var id = attrs.GetProperty("id").GetString();
                if (string.IsNullOrWhiteSpace(id) || !headingIds.Add(id) || attrs.GetProperty("level").GetInt32() is not (1 or 2)) throw new JsonException();
                if (attrs.GetProperty("summary").ValueKind != JsonValueKind.String) throw new JsonException();
            }
            ValidateAlignment(node);
            if (node.TryGetProperty("content", out var inline)) ValidateInline(inline);
        }
        else if (Children.ContainsKey(type))
        {
            // The key must be present; ValidateChildren enforces non-empty for containers.
            ValidateChildren(type, node.GetProperty("content"), headingIds);
        }
        else if (node.TryGetProperty("content", out _))
        {
            // Leaf blocks (horizontalRule, pageBreak) carry no content.
            throw new JsonException();
        }
    }

    private static void ValidateAlignment(JsonElement node)
    {
        if (!node.TryGetProperty("attrs", out var attrs) || !attrs.TryGetProperty("textAlign", out var align)) return;
        if (align.ValueKind == JsonValueKind.Null) return;
        if (align.ValueKind != JsonValueKind.String || !Alignments.Contains(align.GetString()!)) throw new JsonException();
    }

    private static void ValidateInline(JsonElement content)
    {
        foreach (var node in content.EnumerateArray())
        {
            var type = node.GetProperty("type").GetString();
            if (type is null || !Inline.Contains(type)) throw new JsonException();
            if (type == "text" && node.GetProperty("text").ValueKind != JsonValueKind.String) throw new JsonException();
            if (type == "hardBreak" && node.TryGetProperty("text", out _)) throw new JsonException();
            // Marks may sit on any inline node (a bold selection can span a hard break).
            if (node.TryGetProperty("marks", out var marks))
                foreach (var mark in marks.EnumerateArray())
                    if (mark.GetProperty("type").GetString() is not { } m || !Marks.Contains(m)) throw new JsonException();
        }
    }
}

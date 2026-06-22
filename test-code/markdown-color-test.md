# Markdown Color Test

Use `Developer: Inspect Editor Tokens and Scopes` in VS Code to check the exact scope under the cursor.

This file labels each Markdown feature with:

- Markdown term
- Common TextMate scope
- Test text

## 1. Plain Paragraph

Markdown term: paragraph text

Common scope: `text.html.markdown`, `meta.paragraph.markdown`

Expected idea: normal text should use the default foreground.

Plain paragraph text. This should look like normal editor text.

## 2. ATX Headings

Markdown term: ATX heading

Common scope: `markup.heading`, `markup.heading.markdown`, `punctuation.definition.heading.markdown`

Expected idea: the `#` marker and heading text may be colored separately.

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## 3. Setext Headings

Markdown term: Setext heading

Common scope: `markup.heading.setext`, `punctuation.definition.heading.setext.markdown`

Expected idea: the underline marker `===` or `---` may have heading colors.

Setext Heading 1
================

Setext Heading 2
----------------

## 4. Emphasis

Markdown term: emphasis

Common scope: `markup.italic`, `markup.italic.markdown`, `punctuation.definition.italic.markdown`

Expected idea: italic text should usually be italic. The `*` or `_` markers may have punctuation colors.

This is *italic with asterisks*.

This is _italic with underscores_.

## 5. Strong Emphasis

Markdown term: strong emphasis

Common scope: `markup.bold`, `markup.bold.markdown`, `punctuation.definition.bold.markdown`

Expected idea: bold text should usually be bold. The `**` or `__` markers may have punctuation colors.

This is **bold with asterisks**.

This is __bold with underscores__.

## 6. Strong Emphasis Plus Emphasis

Markdown term: bold italic

Common scope: `markup.bold`, `markup.italic`, `punctuation.definition.bold.markdown`, `punctuation.definition.italic.markdown`

Expected idea: nested emphasis may combine bold and italic.

This is ***bold italic with asterisks***.

This is ___bold italic with underscores___.

## 7. Strikethrough

Markdown term: strikethrough

Common scope: `markup.strikethrough`

Expected idea: text between `~~` should be struck through if the grammar supports it.

This is ~~strikethrough text~~.

## 8. Inline Code

Markdown term: code span / inline code

Common scope: `markup.inline.raw`, `markup.raw.inline.markdown`, `punctuation.definition.raw.markdown`

Expected idea: `inline code` should have code/raw colors. Backtick markers may have punctuation colors.

Use `const value = "#ffffff"` inside a paragraph.

Use escaped backticks: \`not inline code\`.

## 9. Fenced Code Block

Markdown term: fenced code block

Common scope: `markup.raw`, `markup.raw.block.markdown`, `punctuation.definition.raw.markdown`, embedded language scopes

Expected idea: fence markers and code body may use different colors. Embedded code should use JavaScript highlighting.

```js
const foregroundColor = "#ffffff";

function greetUser(userName) {
  return `Hello, ${userName}`;
}
```

```
code
```

## 10. Fenced Code Block With Another Language

Markdown term: fenced code block with info string

Common scope: `markup.raw`, `markup.raw.block.markdown`, embedded language scopes

Expected idea: code body should use Python highlighting.

```python
foreground_color = "#ffffff"

def greet_user(user_name: str) -> str:
    return f"Hello, {user_name}"
```

## 11. Indented Code Block

Markdown term: indented code block

Common scope: `markup.raw`, `markup.raw.block.markdown`

Expected idea: four-space indented lines may be raw code.

    const indentedCode = true;
    console.log(indentedCode);

## 12. Unordered List

Markdown term: unordered list / bullet list

Common scope: `markup.list`, `markup.list.unnumbered.markdown`, `punctuation.definition.list.begin.markdown`

Expected idea: the `-` bullet marker can have its own color. The list item text can stay normal foreground.

- Unordered item with dash marker
* Unordered item with asterisk marker
+ Unordered item with plus marker

## 13. Nested Unordered List

Markdown term: nested unordered list

Common scope: `markup.list`, `punctuation.definition.list.begin.markdown`

Expected idea: nested bullet markers should still be easy to see.

- Level 1 item
  - Level 2 item
    - Level 3 item

## 14. Ordered List

Markdown term: ordered list

Common scope: `markup.list`, `markup.list.numbered.markdown`, `punctuation.definition.list.begin.markdown`

Expected idea: the `1.` number marker can have its own color.

1. Ordered item one
2. Ordered item two with **bold text**
3. Ordered item three with `inline code`

## 15. Task List

Markdown term: task list

Common scope: `markup.list`, `punctuation.definition.list.begin.markdown`, checkbox punctuation scopes depending on grammar

Expected idea: `-`, `[ ]`, and `[x]` may be tokenized separately.

- [ ] Open task
- [x] Completed task

## 16. Block Quote

Markdown term: block quote

Common scope: `markup.quote`, `markup.quote.markdown`, `punctuation.definition.blockquote.markdown`

Expected idea: the `>` marker and quoted text may have quote color and italic style.

> Quote level one.
> It can contain **bold**, *italic*, and `inline code`.
>
> > Nested quote level two.

## 17. Horizontal Rule

Markdown term: thematic break / horizontal rule

Common scope: `meta.separator`, `meta.separator.markdown`

Expected idea: `---`, `***`, and `___` may have separator color.

---

***

___

## 18. Inline Link

Markdown term: inline link

Common scope: `markup.underline.link`, `markup.underline.link.markdown`, `string.other.link.title.markdown`, `punctuation.definition.link.markdown`

Expected idea: link text, URL punctuation, and title text may have different colors.

[Normal link](https://example.com)

[Link with title](https://example.com "Example title")

## 19. Reference Link

Markdown term: reference link

Common scope: `markup.underline.link`, `string.other.link.description.markdown`, `punctuation.definition.link.markdown`

Expected idea: the link label and reference definition may have separate colors.

[Reference link][reference-id]

[reference-id]: https://example.com "Reference title"

## 20. Autolink

Markdown term: autolink

Common scope: `markup.underline.link`, `punctuation.definition.link.markdown`

Expected idea: URL and email inside angle brackets may use link color.

<https://example.com>

<email@example.com>

## 21. Image

Markdown term: image

Common scope: `meta.image.inline`, `meta.image.inline.markdown`, `markup.underline.link`, `markup.underline.link.image.markdown`

Expected idea: image punctuation, alt text, URL, and title may be tokenized differently.

![Image alt text](https://example.com/image.png "Image title")

## 22. Table

Markdown term: table

Common scope: table support depends on the Markdown grammar; cells can still contain inline markup scopes.

Expected idea: inline code, bold, italic, and links should still color inside table cells.

| Markdown term | Test text | Scope to inspect |
|---|---:|:---|
| Inline code | `inline code` | `markup.inline.raw` |
| Bold | **bold** | `markup.bold` |
| Italic | *italic* | `markup.italic` |
| Link | [link](https://example.com) | `markup.underline.link` |

## 23. HTML Underline

Markdown term: raw HTML underline

Common scope: HTML scopes, sometimes `markup.underline` depending on grammar and tag mapping

Expected idea: `<u>` exists because Markdown itself has no native underline syntax.

<u>HTML underline text</u>

## 24. Raw HTML

Markdown term: raw HTML block

Common scope: HTML scopes, sometimes embedded source scopes

Expected idea: HTML tags, attribute names, strings, and text may use HTML colors, not Markdown colors.

<div class="note">
  <strong>HTML strong text</strong>
  <em>HTML emphasis text</em>
  <code>HTML inline code</code>
</div>

<!-- HTML comment -->

## 25. Escaped Markdown Punctuation

Markdown term: backslash escape

Common scope: punctuation escape scopes depending on grammar

Expected idea: escaped markers should not start Markdown formatting.

\*not italic\*

\[not a link](https://example.com)

\# not a heading

## 26. Footnote

Markdown term: footnote

Common scope: extension-dependent Markdown scopes

Expected idea: footnote labels and definitions may not be supported by every grammar.

Here is a sentence with a footnote.[^note]

[^note]: This is the footnote text with `inline code`.

## 27. Definition List

Markdown term: definition list

Common scope: extension-dependent Markdown scopes

Expected idea: definition list syntax is not part of core CommonMark, so support depends on grammar.

Term
: Definition text

Another Term
: Definition with **bold text** and [a link](https://example.com).

## 28. YAML Front Matter

Markdown term: front matter / metadata block

Common scope: `punctuation.definition.metadata.markdown`, YAML scopes, `meta.separator.markdown`

Expected idea: the opening and closing `---` may share separator or metadata punctuation colors.

---
title: Markdown Color Test
tags:
  - theme
  - markdown
---

## 29. Git Diff Markup

Markdown term: diff fenced code block

Common scope: embedded diff scopes, `markup.inserted`, `markup.deleted`, `markup.changed`

Expected idea: added and deleted lines may trigger `markup.inserted` and `markup.deleted`.

```diff
- Removed line
+ Added line
! Changed line
```

## 30. Standalone Diff-Like Lines

Markdown term: plain paragraph that looks like diff

Common scope: usually normal Markdown paragraph unless grammar treats it specially

Expected idea: these may not trigger diff scopes outside a diff code block.

+ Plus line outside code block
- Minus line outside code block
! Bang line outside code block

## 31. Markup Scope Terms

These are TextMate scope names, not Markdown syntax names:

| Scope | Usually means |
|---|---|
| `markup.raw` | Raw/code-like text, often fenced or indented code |
| `markup.inline.raw` | Inline code span |
| `markup.underline` | Underlined text, usually from HTML or grammar-specific markup |
| `markup.underline.link` | Link text or link URL area |
| `markup.inserted` | Inserted/added text, often diff `+` lines |
| `markup.deleted` | Deleted/removed text, often diff `-` lines |
| `markup.changed` | Changed text, often diff or patch syntax |
| `markup.untracked` | Untracked text, usually source-control related grammar |
| `markup.ignored` | Ignored text, usually source-control related grammar |

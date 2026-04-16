"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { DownloadButton } from "@/components/ui/download-button";
import { InputOutputLayout } from "@/components/ui/input-output-layout";

// ── Converter ────────────────────────────────────────────────────────────────

function convertTable(table: Element): string {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) return "";
  const toText = (cell: Element) =>
    (cell.textContent ?? "").replace(/\|/g, "\\|").trim();
  const first = rows[0];
  const headers = Array.from(first.querySelectorAll("th, td")).map(toText);
  const header = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.slice(1).map((row) => {
    const cells = Array.from(row.querySelectorAll("th, td")).map(toText);
    return `| ${cells.join(" | ")} |`;
  });
  return "\n\n" + [header, sep, ...body].join("\n") + "\n\n";
}

function convertNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const kids = () =>
    Array.from(el.childNodes).map(convertNode).join("");

  switch (tag) {
    case "head":
    case "script":
    case "style":
    case "svg":
      return "";

    case "h1": return `\n\n# ${kids().trim()}\n\n`;
    case "h2": return `\n\n## ${kids().trim()}\n\n`;
    case "h3": return `\n\n### ${kids().trim()}\n\n`;
    case "h4": return `\n\n#### ${kids().trim()}\n\n`;
    case "h5": return `\n\n##### ${kids().trim()}\n\n`;
    case "h6": return `\n\n###### ${kids().trim()}\n\n`;

    case "p":
      return `\n\n${kids().trim()}\n\n`;
    case "br":
      return "\n";
    case "hr":
      return "\n\n---\n\n";

    case "strong":
    case "b":
      return `**${kids()}**`;
    case "em":
    case "i":
      return `*${kids()}*`;
    case "del":
    case "s":
      return `~~${kids()}~~`;

    case "code": {
      if (el.parentElement?.tagName.toLowerCase() === "pre") return kids();
      return `\`${kids()}\``;
    }
    case "pre": {
      const codeEl = el.querySelector("code");
      const lang =
        (codeEl?.className.match(/language-(\S+)/) ?? [])[1] ?? "";
      const content = (codeEl ?? el).textContent ?? "";
      return `\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    }

    case "a": {
      const href = el.getAttribute("href") ?? "";
      const title = el.getAttribute("title");
      const text = kids();
      return title
        ? `[${text}](${href} "${title}")`
        : `[${text}](${href})`;
    }
    case "img": {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") ?? "";
      const title = el.getAttribute("title");
      return title
        ? `![${alt}](${src} "${title}")`
        : `![${alt}](${src})`;
    }

    case "blockquote": {
      const content = kids().trim();
      return (
        "\n\n" +
        content
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n") +
        "\n\n"
      );
    }

    case "ul": {
      const items = Array.from(el.children).filter(
        (c) => c.tagName.toLowerCase() === "li"
      );
      return (
        "\n\n" +
        items.map((li) => `- ${convertNode(li).trim()}`).join("\n") +
        "\n\n"
      );
    }
    case "ol": {
      const items = Array.from(el.children).filter(
        (c) => c.tagName.toLowerCase() === "li"
      );
      return (
        "\n\n" +
        items
          .map((li, i) => `${i + 1}. ${convertNode(li).trim()}`)
          .join("\n") +
        "\n\n"
      );
    }
    case "li":
      return kids();

    case "table":
      return convertTable(el);
    // rows/cells handled inside convertTable above
    case "thead":
    case "tbody":
    case "tfoot":
    case "tr":
    case "th":
    case "td":
      return kids();

    default:
      return kids();
  }
}

function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const md = convertNode(doc.body);
  // Collapse 3+ blank lines → 2, and trim
  return md.replace(/\n{3,}/g, "\n\n").trim();
}

// ── Component ─────────────────────────────────────────────────────────────────

const EXAMPLE = `<h1>Hello World</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> example.</p>
<h2>Links &amp; Images</h2>
<p><a href="https://example.com" title="Example">Visit Example</a></p>
<img src="https://example.com/img.png" alt="Demo image" />
<h2>Lists</h2>
<ul>
  <li>Apples</li>
  <li>Bananas</li>
  <li>Cherries</li>
</ul>
<ol>
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ol>
<h2>Table</h2>
<table>
  <tr><th>Name</th><th>Role</th></tr>
  <tr><td>Alice</td><td>Engineer</td></tr>
  <tr><td>Bob</td><td>Designer</td></tr>
</table>
<blockquote><p>To be or not to be, that is the question.</p></blockquote>
<pre><code class="language-js">console.log("hello");</code></pre>`;

function run(html: string): { output: string; error: string } {
  try {
    return { output: htmlToMarkdown(html), error: "" };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

export default function HtmlToMarkdown() {
  const t = useTranslations("htmlToMarkdown");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [richPasted, setRichPasted] = useState(false);

  const convert = useCallback((html: string) => {
    const result = run(html);
    setOutput(result.output);
    setError(result.error);
  }, []);

  // Intercept paste on the textarea — if the clipboard carries text/html
  // (copied from Word, browser, Google Docs…) extract it and auto-convert.
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const html = e.clipboardData.getData("text/html");
      if (!html) return; // no rich text — let normal paste happen
      e.preventDefault();
      setInput(html);
      setRichPasted(true);
      convert(html);
    },
    [convert]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      setRichPasted(false);
    },
    []
  );

  const loadExample = useCallback(() => {
    setInput(EXAMPLE);
    setRichPasted(false);
    convert(EXAMPLE);
  }, [convert]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setRichPasted(false);
  }, []);

  return (
    <div className="space-y-4">
      {richPasted && (
        <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          {t("richPasteDetected")}
        </div>
      )}
      <InputOutputLayout
        inputLabel={t("inputLabel")}
        outputLabel={t("outputLabel")}
        input={
          <Textarea
            value={input}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder={t("inputPlaceholder")}
            className="h-80 resize-none font-mono text-sm"
          />
        }
        output={
          <>
            {output && (
              <div className="flex justify-end gap-1">
                <CopyButton value={output} />
                <DownloadButton
                  data={output}
                  filename="output.md"
                  mimeType="text/markdown"
                  label=".md"
                />
              </div>
            )}
            <Textarea
              value={output}
              readOnly
              placeholder={t("outputPlaceholder")}
              className="h-80 resize-none font-mono text-sm"
            />
          </>
        }
      />
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => convert(input)}>
          {t("convert")}
        </Button>
        <Button size="sm" variant="secondary" onClick={loadExample}>
          {t("loadExample")}
        </Button>
        <Button size="sm" variant="outline" onClick={clear}>
          {t("clear")}
        </Button>
      </div>
    </div>
  );
}

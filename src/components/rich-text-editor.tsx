"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[120px] max-w-none p-3 rounded-md border border-input bg-background",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && (
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("bold") ? "bg-accent font-bold" : ""
            }`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("italic") ? "bg-accent" : ""
            }`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("strike") ? "bg-accent" : ""
            }`}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
          <div className="w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("bulletList") ? "bg-accent" : ""
            }`}
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("orderedList") ? "bg-accent" : ""
            }`}
            title="Numbered List"
          >
            1. List
          </button>
          <div className="w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-accent font-semibold"
                : ""
            }`}
            title="Heading"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("blockquote") ? "bg-accent" : ""
            }`}
            title="Quote"
          >
            &ldquo; &rdquo;
          </button>
          <div className="w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors font-mono ${
              editor.isActive("code") ? "bg-accent" : ""
            }`}
            title="Inline Code"
          >
            {"</>"}
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors font-mono ${
              editor.isActive("codeBlock") ? "bg-accent" : ""
            }`}
            title="Code Block"
          >
            {"{ }"}
          </button>
          <div className="w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().setHardBreak().run()}
            className="px-3 py-1 text-sm rounded hover:bg-accent transition-colors"
            title="Line Break (Shift+Enter)"
          >
            ↵
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-1 text-sm rounded hover:bg-accent transition-colors ${
              editor.isActive("paragraph") ? "bg-accent" : ""
            }`}
            title="Paragraph"
          >
            ¶
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

export function RichTextDisplay({ content }: { content: string }) {
  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/utils/tailwind";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export function MarkdownEditor({
  content,
  onChange,
  className,
}: MarkdownEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);

    // Debounce saving
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onChange(newContent);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent =
        localContent.substring(0, start) + "  " + localContent.substring(end);

      setLocalContent(newContent);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }

    // Save on Ctrl+S
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      onChange(localContent);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-full w-full resize-none outline-none",
            "font-mono text-sm leading-relaxed",
            "border-none bg-transparent",
            "focus:ring-0 focus:outline-none",
          )}
          placeholder="Start typing your markdown content..."
          spellCheck={false}
        />
      </div>

      {/* Status bar */}
      <div className="text-muted-foreground flex justify-between border-t px-4 py-2 text-xs">
        <span>Lines: {localContent.split("\n").length}</span>
        <span>Characters: {localContent.length}</span>
      </div>
    </div>
  );
}

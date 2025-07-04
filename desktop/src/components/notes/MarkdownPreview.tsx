import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkWikiLink from "remark-wiki-link";
import { cn } from "@/utils/tailwind";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const handleWikiLinkClick = (pageName: string) => {
    console.log("Wiki link clicked:", pageName);
    // TODO: Implement navigation to linked note
  };

  return (
    <div className={cn("h-full overflow-auto", className)}>
      <div className="max-w-none p-4">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            [
              remarkWikiLink,
              {
                pageResolver: (name: string) => [
                  name.replace(/ /g, "-").toLowerCase(),
                ],
                hrefTemplate: (permalink: string) => `#${permalink}`,
              },
            ],
          ]}
          components={{
            // Custom styling for different markdown elements
            h1: ({ children }) => (
              <h1 className="mb-4 border-b pb-2 text-3xl font-bold">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mt-6 mb-3 text-2xl font-semibold">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-4 mb-2 text-xl font-semibold">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="mt-3 mb-2 text-lg font-semibold">{children}</h4>
            ),
            h5: ({ children }) => (
              <h5 className="mt-2 mb-2 text-base font-semibold">{children}</h5>
            ),
            h6: ({ children }) => (
              <h6 className="mt-2 mb-2 text-sm font-semibold">{children}</h6>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed">{children}</p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            code: ({ children }) => (
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="mb-4 overflow-x-auto rounded-md bg-gray-100 p-4 dark:bg-gray-800">
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold dark:bg-gray-800">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-4 py-2">{children}</td>
            ),
            a: ({ href, children }) => {
              if (href?.startsWith("#")) {
                // This is a wiki link
                const pageName = href.slice(1);
                return (
                  <button
                    className="text-blue-600 underline hover:text-blue-800"
                    onClick={() => handleWikiLinkClick(pageName)}
                  >
                    {children}
                  </button>
                );
              }
              return (
                <a
                  href={href}
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            },
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="my-4 h-auto max-w-full rounded-md"
                loading="lazy"
              />
            ),
            hr: () => <hr className="my-8 border-t border-gray-300" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

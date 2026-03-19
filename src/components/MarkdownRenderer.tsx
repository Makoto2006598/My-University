import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            return !inline ? (
              <div className="bg-slate-900 text-slate-100 rounded-md p-4 my-4 overflow-x-auto">
                <code {...props}>{children}</code>
              </div>
            ) : (
              <code className="bg-slate-200 text-slate-800 rounded px-1 py-0.5 text-sm" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
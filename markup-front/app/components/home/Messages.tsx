import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Message } from "./types";

interface MessagesProps {
  messages: Message[];
  selectedFont: string;
}

// Memoized individual message component
const MessageItem = memo(({ message, selectedFont, index }: { message: Message; selectedFont: string; index: number }) => {
  // Memoize the markdown components to prevent recreation on every render
  const markdownComponents = useMemo(() => ({
    p: ({children}: any) => <p className="text-sm leading-[1.6] mb-3 last:mb-0" style={{ fontFamily: selectedFont }}>{children}</p>,
    h1: ({children}: any) => <h1 className="text-xl font-semibold mb-3 mt-4 first:mt-0">{children}</h1>,
    h2: ({children}: any) => <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
    ul: ({children}: any) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
    ol: ({children}: any) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
    li: ({children}: any) => <li className="text-sm leading-[1.6]" style={{ fontFamily: selectedFont }}>{children}</li>,
    blockquote: ({children}: any) => <blockquote className="border-l-3 border-[#e8e6e3] dark:border-[#484848] pl-3 italic my-3 opacity-80">{children}</blockquote>,
    code: ({inline, children}: any) =>
      inline ?
        <code className="bg-[#f6f6f4] dark:bg-[#363636] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code> :
        <pre className="bg-[#f6f6f4] dark:bg-[#363636] p-3 rounded-lg overflow-x-auto mb-3 border border-[#e8e6e3] dark:border-[#484848]"><code className="text-sm font-mono">{children}</code></pre>,
    a: ({href, children}: any) => <a href={href} className="text-[#2c2c2c] dark:text-gray-100 underline hover:opacity-80">{children}</a>,
    hr: () => <hr className="my-4 border-[#e8e6e3] dark:border-[#484848]" />,
    table: ({children}: any) => <table className="border-collapse w-full mb-3 text-sm">{children}</table>,
    th: ({children}: any) => <th className="border border-[#e8e6e3] dark:border-[#484848] bg-[#f6f6f4] dark:bg-[#363636] px-3 py-2 font-medium text-left">{children}</th>,
    td: ({children}: any) => <td className="border border-[#e8e6e3] dark:border-[#484848] px-3 py-2">{children}</td>,
    br: () => <br className="block" />,
  }), [selectedFont]);
  
  // Only render assistant messages (file content)
  if (message.role === 'user') {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[85%] bg-white dark:bg-[#424242] text-[#2c2c2c] dark:text-gray-100 rounded-2xl rounded-bl-md border border-[#e8e6e3] dark:border-[#484848] px-4 py-3 shadow-sm">
        {/* Message header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium bg-[#2c2c2c]/10 dark:bg-white/10 text-[#2c2c2c] dark:text-gray-100">
            M
          </div>
          <span className="text-xs font-medium text-[#737373] dark:text-gray-400">
            MDaude
          </span>
        </div>
        {/* Message content */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export const Messages = memo(({ messages, selectedFont }: MessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {messages.map((message, index) => (
          <MessageItem
            key={`${message.role}-${index}-${message.content.length}`}
            message={message}
            selectedFont={selectedFont}
            index={index}
          />
        ))}
      </div>
    </div>
  );
});

Messages.displayName = 'Messages';
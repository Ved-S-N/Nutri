import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import Card from "./Card";

interface AISummaryCardProps {
  summary: string;
}

const AISummaryCard: React.FC<AISummaryCardProps> = ({ summary }) => {
  return (
    <Card className="bg-gradient-to-br from-accent/10 to-green-500/5 border border-accent/20 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-accent" size={20} />
        <h3 className="text-lg font-semibold text-white">AI Summary</h3>
      </div>

      {/* AI Summary with Markdown support */}
      <div className="prose prose-invert max-w-none leading-relaxed text-neutral-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2 text-neutral-300">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            li: ({ children }) => (
              <li className="mb-1 list-none flex items-start gap-2">
                <span className="text-accent text-lg leading-none">•</span>
                <span className="text-neutral-300">{children}</span>
              </li>
            ),
            ul: ({ children }) => <ul className="space-y-1">{children}</ul>,
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default AISummaryCard;

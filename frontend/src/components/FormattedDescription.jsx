import React from 'react';

/**
 * Normalizes common HTML entities or broken quotes in scraped/legacy problem descriptions
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Parses inline markdown: **bold** and `code`
 * @param {string} text
 * @returns {React.ReactNode[]}
 */
function renderInlineMarkdown(text) {
  if (typeof text !== 'string') return text;

  const normalized = normalizeText(text);
  const parts = [];
  let remaining = normalized;
  let keyIdx = 0;

  // Matches either **bold text** or `inline code`
  const inlineRegex = /(\*\*[^*]+\*\*|`[^`]+`)/;

  while (remaining.length > 0) {
    const match = remaining.match(inlineRegex);
    if (!match) {
      parts.push(remaining);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      parts.push(remaining.substring(0, matchIndex));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-white">
          {boldText}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeText = token.slice(1, -1);
      parts.push(
        <code
          key={`c-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-xs"
        >
          {codeText}
        </code>
      );
    } else {
      parts.push(token);
    }

    remaining = remaining.substring(matchIndex + token.length);
  }

  return parts;
}

/**
 * FormattedDescription Component
 * Parses markdown blocks (paragraphs, unordered lists) and inline tokens (**bold**, `code`)
 * @param {{ content: string, className?: string }} props
 */
export function FormattedDescription({ content, className = '' }) {
  if (!content) return null;

  const rawLines = String(content).split(/\r?\n/);
  const blocks = [];
  let currentList = [];
  let currentParagraphLines = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const validLines = currentParagraphLines.map((l) => l.trim()).filter(Boolean);
      if (validLines.length > 0) {
        blocks.push({ type: 'p', lines: validLines });
      }
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'ul', items: [...currentList] });
      currentList = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    if (isBullet) {
      flushParagraph();
      currentList.push(trimmed.slice(2).trim());
    } else {
      flushList();
      currentParagraphLines.push(trimmed);
    }
  }

  flushParagraph();
  flushList();

  return (
    <div className={`space-y-4 text-sm text-zinc-300 leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="list-disc list-outside pl-5 space-y-2 text-zinc-300">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="leading-relaxed">
            {block.lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {renderInlineMarkdown(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedDescription;

import { Box } from "@mui/material";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/*
📌 Renders a chat answer's Markdown (headings, lists, tables, code) as formatted text.
react-markdown ignores raw HTML in the answer, so model output can't inject markup.
*/

const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  // Wide tables scroll inside the bubble instead of stretching the panel.
  table: ({ children }) => (
    <div className="chat-table-wrapper">
      <table>{children}</table>
    </div>
  ),
};

// Tailwind's reset strips list, heading and table styles, so restore compact ones here.
const markdownStyles = {
  fontSize: "0.875rem",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
  "& > :first-of-type": { mt: 0 },
  "& > :last-child": { mb: 0 },
  "& p": { my: 1 },
  "& h1, & h2, & h3, & h4": {
    fontWeight: 600,
    lineHeight: 1.3,
    mt: 2,
    mb: 1,
  },
  "& h1": { fontSize: "1.05rem" },
  "& h2": { fontSize: "1rem" },
  "& h3, & h4": { fontSize: "0.925rem" },
  "& ul, & ol": { pl: 2.5, my: 1 },
  "& ul": { listStyleType: "disc" },
  "& ol": { listStyleType: "decimal" },
  "& li": { my: 0.25 },
  "& li > ul, & li > ol": { my: 0.25 },
  "& strong": { fontWeight: 600 },
  "& a": { color: "primary.main", textDecoration: "underline" },
  "& code": {
    fontFamily: "monospace",
    fontSize: "0.8rem",
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: "3px",
    px: 0.5,
  },
  "& pre": {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: "4px",
    p: 1,
    my: 1,
    overflowX: "auto",
  },
  "& pre code": { backgroundColor: "transparent", p: 0 },
  "& blockquote": {
    borderLeft: "3px solid lightgrey",
    pl: 1.5,
    my: 1,
    color: "text.secondary",
  },
  "& hr": { my: 1.5, borderColor: "lightgrey" },
  "& .chat-table-wrapper": { overflowX: "auto", my: 1 },
  "& table": { borderCollapse: "collapse", fontSize: "0.8rem" },
  "& th, & td": {
    border: "1px solid lightgrey",
    px: 1,
    py: 0.5,
    textAlign: "left",
    verticalAlign: "top",
  },
  "& th": { fontWeight: 600, backgroundColor: "rgba(0, 0, 0, 0.04)" },
};

export default function ChatMarkdown({ content }: { content: string }) {
  return (
    <Box sx={markdownStyles}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </Box>
  );
}

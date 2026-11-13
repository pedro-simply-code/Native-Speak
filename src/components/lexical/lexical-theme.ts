import type { EditorThemeClasses } from "lexical";

export const lexicalTheme: EditorThemeClasses = {
  paragraph: "lexical-paragraph",
  quote: "lexical-quote",
  heading: {
    h1: "lexical-h1",
    h2: "lexical-h2",
    h3: "lexical-h3",
  },
  list: {
    ul: "lexical-ul",
    ol: "lexical-ol",
    listitem: "lexical-li",
  },
  link: "lexical-link",
  text: {
    bold: "lexical-bold",
    italic: "lexical-italic",
    underline: "lexical-underline",
    strikethrough: "lexical-strike",
    code: "lexical-inline-code",
  },
  code: "lexical-code-block",
  table: "lexical-table",
  tableCell: "lexical-table-cell",
  tableCellHeader: "lexical-table-cell-header",
};

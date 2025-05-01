import { parser } from "./syntax2.ts"
import { LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"

export const EXAMPLELanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({ closing: "}", align: true })
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        Identifier: t.typeName,
        KeyWord: t.keyword,
        String: t.string,
        Number: t.number,
        LineComment: t.lineComment,
        SetStatement: t.keyword,
        LoopStatement: t.keyword,
        ForStatement: t.keyword,
        IfStatement: t.keyword,
        FuncDef: t.keyword,

        Icons: t.paren,
        // '"/"': t.punctuation,
        // '","': t.punctuation,
        // Icons: t.paren,
        "func": t.keyword,
        "set": t.keyword,
        "if": t.keyword,
        "loop": t.keyword,

        ",": t.punctuation,
        "+": t.operator,
        "-": t.operator,
        '"*"': t.operator,
        '"/"': t.operator,
        '"%"': t.operator,
        "=": t.operator,
        "==": t.operator,
        "<": t.operator,
        ">": t.operator,
        "&": t.operator,
        "|": t.operator,
        "( )": t.paren,
        "{ }": t.brace,
        "[ ]": t.squareBracket,
        // ",": t.paren,

      })
    ]
  }),
  languageData: {
    commentTokens: { line: "#" }

  }
})



import { completeFromList } from "@codemirror/autocomplete"

export const exampleCompletion = EXAMPLELanguage.data.of({
  autocomplete: completeFromList([
    { label: "func", type: "keyword" },
    { label: "set", type: "keyword" },
    { label: "if", type: "keyword" },
    { label: "loop", type: "keyword" },
    { label: "forward", type: "function" },
    { label: "left", type: "function" },
    { label: "goto", type: "function" }
  ])
})

export function EXAMPLE() {
  return new LanguageSupport(EXAMPLELanguage, [exampleCompletion])
}
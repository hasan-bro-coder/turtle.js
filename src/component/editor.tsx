import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

// import { StreamLanguage, Language, } from "@codemirror/language"
// import { Parser } from "@lezer/common"
// import {lua} from "@codemirror/autocomplete"

import { change } from "../store";
import { useSelector, useDispatch } from "react-redux";

import { EXAMPLE } from "../lang/languagepack/syntax";
// import { LRLanguage } from "@codemirror/language"
// import { LRParser } from "@lezer/lr";

// export const exampleLanguage = LRLanguage.define({
//   parser: new LRParser(),
//   languageData: {
//     commentTokens: {line: ";"}
//   }
// })

// import {completeFromList} from "@codemirror/autocomplete"

// export const exampleCompletion = exampleLanguage.data.of({
//   autocomplete: completeFromList([
//     {label: "defun", type: "keyword"},
//     {label: "defvar", type: "keyword"},
//     {label: "let", type: "keyword"},
//     {label: "cons", type: "function"},
//     {label: "car", type: "function"},
//     {label: "cdr", type: "function"}
//   ])
// })

// import {autocompletion, CompletionContext} from "@codemirror/autocomplete"




// function myCompletions(context: CompletionContext) {
//   let word = context.matchBefore(/\w*/)
//   if (word.from == word.to && !context.explicit)
//     return null
//   return {
//     from: word.from,
//     options: [
//       {label: "match", type: "keyword"},
//       {label: "hello", type: "variable", info: "(World)"},
//       {label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro"}
//     ]
//   }
// }






interface EditorProps {
  changed: (code: string) => void;
}

function Editor({ changed }: EditorProps) {
  // let code = "YO"
  // interface RootState {
  //   code: {
  //     code: string;
  //   };
  // }

  let code = useSelector((state: any) => state.code);

  // let lang = new Language(new Parser(),[],"tjs")


  //   let code = localStorage.getItem('code') || `{set i = 0}
  // {loop i < 4
  //   [print i]
  //   [forward 50]
  //   [left 90]
  //   {set i = i + 1}
  // }`
  let dispatch = useDispatch();

  function getdata() {
    if (localStorage.getItem('code') == null) {
      localStorage.setItem('code', code)
    } else {
      setTimeout(() => {
        dispatch(change(localStorage.getItem('code')))
      }
      , 1000)
    }
    return code
  }
  // dispatch(change(code))

  return (
    <div id="code-con">
      <CodeMirror
        value={getdata()}
        placeholder="Please enter TJS code."
        height="50vh"
        theme={vscodeDark}
        onChange={(value) => {
          // console.log('value:', value);
          // console.log('viewUpdate:', viewUpdate);
          // code = value
          dispatch(change(value))
          changed(value)

          // console.log('code:', code);

        }}
        extensions={[EXAMPLE()]} // [exampleLanguage, exampleCompletion]

      // lang="js"
      // exportparts={[StreamLanguage.define()]}
      // extensions={[sql().extension]}
      />
      {/* <textarea id="code" spellCheck="false"></textarea> */}
    </div>
  );
}

export default Editor;
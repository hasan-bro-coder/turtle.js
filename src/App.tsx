// import { useState } from 'react'
import "./App.scss";
import Nav from "./component/nav";
import Editor from "./component/editor";
import Canvas from "./component/canvas";

// import Split from "react-split";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import { clearConsole } from "./store";
// import TjsConsole from "./component/tjsconsole";

function App() {
  // let [code] = useState("YO")

  // let env = new Environment();

  let code = useSelector((state: any) => state.code);
  // let run = (code: string) => {

  // let console2 = useSelector((state: any) => state.tjsconsole);
  let dispatch = useDispatch();
  // }
  let [running, setRunning] = useState(false);

  let timeout: null | ReturnType<typeof setTimeout> = null;
  let changed: (code: string) => void = (code: string) => {
    localStorage.setItem("code", code);

    // if (timeout) {
    //   clearTimeout(timeout);
    //   timeout = null;
    // }
    // timeout = setTimeout(() => {
    //   dispatch(clearConsole())
    //   setRunning(true)
    // }, 500);
  };

  let runit = (_code: string) => {
    console.clear();
    if (timeout) {
      clearTimeout(timeout);
    }
    document.querySelector("#canvas-con")?.scrollIntoView();
    dispatch(clearConsole());
    setRunning(true);
    // run(code,env)
  };

  let save = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "code.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  // let loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const content = e.target?.result as string;
  //       localStorage.setItem('code', content);
  //       dispatch(change(content));
  //     };
  //     reader.readAsText(file);
  //   }
  // };

  return (
    <>
      <Nav
        run={() => runit(code)}
        save={save}
        back={() => 0}
      ></Nav>

      <div className="div flex flex-column">
        <Editor changed={changed}></Editor>
        <Canvas isClicked={running} setRunning={setRunning}></Canvas>
      </div>
      {/* <div id='app'> */}
      {/* <Split
        className="app-con"
        gutterSize={8}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="vertical"
        minSize={[500, 200]}
        expandToMin={true}
      >
        <Split
          className="app"
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          cursor="col-resize"
          direction="horizontal"
          minSize={300}
          expandToMin={false}
        >
          <Editor changed={changed}></Editor>
          <Canvas isClicked={running} setRunning={setRunning}></Canvas>
        </Split> 
        <TjsConsole output={console2}></TjsConsole>
      </Split> */}
      {/* </div> */}
    </>
  );
}

export default App;

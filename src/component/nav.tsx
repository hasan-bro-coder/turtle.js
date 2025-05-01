import { FC } from "react";

interface NavProps {
    run: () => void;
    save: () => void;
    back: () => void;
}


var Nav: FC<NavProps> = (props)=>{
    return <nav >
        <button id="run" onClick={props.run}>run</button>
        <button id="save" onClick={props.save}>save</button>
        {/* <button id="load" onClick={document.querySelector<HTMLInputElement>(`input[type="file"]`)?.click}>load</button> */}
        {/* <input type="file" id="load" onChange={props.back} /> */}
        <button id="back" onClick={props.back}>back</button>
    </nav>
}

export default Nav;
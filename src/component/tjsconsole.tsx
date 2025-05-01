function TjsConsole(data: { output: string }) {
    return (
        // <div id="console-con">
        <div id="console" >
            {data.output.split('\n').map((line: string, i) => {
                return <div key={i}>{line}</div>
            })}
        </div>
        // </div>
    );
}

export default TjsConsole;
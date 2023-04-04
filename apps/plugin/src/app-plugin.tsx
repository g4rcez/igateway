import "./App.css";
import { useListener } from "../../../src";

export default function AppPlugin() {
    useListener("http://localhost:9999", { start: (data: any) => console.log("started", data) });
    return (
        <div className="App">
            <h1>Plugin: 3000</h1>
        </div>
    );
}

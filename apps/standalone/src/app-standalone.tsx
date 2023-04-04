import React, { useEffect } from "react";
import "./App.css";
import { useIframeDocument } from "../../../src";

export default function AppStandalone() {
    const iframe = useIframeDocument("http://localhost:3000");

    useEffect(() => {
        const interval = setInterval(() => {
            iframe.post("@infinity", { type: "start", test: "09123", interval });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="App">
            <h1>Root</h1>
            <iframe.Iframe />
        </div>
    );
}

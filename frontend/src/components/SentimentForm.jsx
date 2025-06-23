import React, { useEffect, useState } from "react";

export default function SentimentForm() {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => console.log("✅ WebSocket connection opened");
    ws.onclose = (e) => console.log("❌ WebSocket connection closed", e);
    ws.onerror = (e) => console.error("WebSocket error", e);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults((prev) => [data, ...prev]);
    };

    return () => ws.close();
  }, []);

  const handleSubmit = async () => {
    await fetch("http://localhost:4000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Sentiment Analysis Dashboard</h2>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <br />
      <button onClick={handleSubmit}>Analyze</button>

      <div>
        <h3>Results</h3>
        {results.map((result, i) =>
          result.result ? (
            <div key={i}>
              <strong>{result.text}</strong>: {result.result[0].label} (
              {Math.round(result.result[0].score * 100)}%)
            </div>
          ) : (
            <></> // fallback
          )
        )}
      </div>
    </div>
  );
}

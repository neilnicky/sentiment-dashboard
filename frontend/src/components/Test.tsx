import React, { useEffect } from "react";

export default function Test() {
  useEffect(() => {
    const testSentences = [
      "It’s okay, I guess.",
      "Not bad, not good.",
      "This is average.",
      "It's decent.",
      "Nothing impressive.",
      "Could be better, could be worse.",
    ];

    testSentences.forEach(async (text) => {
      await fetch("http://localhost:4000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    });
  }, []);
  return <div>Test</div>;
}

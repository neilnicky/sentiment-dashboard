import amqp from "amqplib";
import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();

const queueName = "sentiment_jobs";

export async function runWorker() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName);

  console.log("Worker listening for sentiment jobs...");

  channel.consume(queueName, async (msg) => {
    const { id, text } = JSON.parse(msg.content.toString());

    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      console.error("HF API error:", hfResponse.status, errText);
      return;
    }
    const result = await hfResponse.json();

    const response = {
      id,
      text,
      result: result[0],
    };

    console.log("💬 Received from HF API:", result);
    console.log("📤 Sending to WebSocket server:", response);

    // Send to WebSocket (via HTTP post to server)
    await fetch("http://localhost:4000/ws-broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });

    channel.ack(msg);
  });
}

runWorker();

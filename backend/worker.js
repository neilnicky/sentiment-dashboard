import amqp from "amqplib";
import fetch from "node-fetch";

const queueName = "sentiment_tasks";

export async function runWorker() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName);

  console.log("Worker listening for sentiment tasks...");

  channel.consume(queueName, async (msg) => {
    const { id, text } = JSON.parse(msg.content.toString());

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const result = await hfResponse.json();

    const response = {
      id,
      text,
      result: result[0],
    };

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

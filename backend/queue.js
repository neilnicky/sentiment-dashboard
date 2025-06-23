import amqp from "amqplib";

let channel;

export async function connectQueue() {
  const conn = await amqp.connect("amqp://localhost");
  channel = await conn.createChannel();
  await channel.assertQueue("sentiment_jobs");
}

export async function sendToQueue(message) {
  if (!channel) await connectQueue();
  channel.sendToQueue("sentiment_jobs", Buffer.from(JSON.stringify(message)));
}

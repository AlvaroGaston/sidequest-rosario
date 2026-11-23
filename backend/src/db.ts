import mongoose from "mongoose";
import { env } from "./config/env.js";
import { mongoClient } from "./lib/auth.js";

export async function connectDb() {
  await Promise.all([mongoose.connect(env.MONGODB_URI), mongoClient.connect()]);
  console.log(`🗄️  MongoDB conectado (${mongoose.connection.name})`);
}

export async function disconnectDb() {
  await Promise.all([mongoose.disconnect(), mongoClient.close()]);
}

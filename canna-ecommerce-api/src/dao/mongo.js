// src/dao/mongo.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectMongo = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta MONGO_URI en .env");
    }
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "canna_ecommerce",
    });
    console.log("✅ Mongo conectado a Atlas");
  } catch (err) {
    console.error("❌ Error conectando a Mongo:", err.message);
    process.exit(1);
  }
};

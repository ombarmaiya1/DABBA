import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';

let mongodInstance = null;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
  } catch (error) {
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
    } catch (memErr) {
      console.error("Error connecting to MongoDB:", memErr);
    }
  }
};

export default connectDB;
import mongoose from "mongoose";
import connectDB from "./db.js";
import { seedDatabase } from "./seed.js";

const run = async () => {
  await connectDB();
  await seedDatabase({ force: true });
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding runner failed:", err);
  process.exit(1);
});

import mongoose from 'mongoose';

declare global {
  var _mongoose: typeof mongoose | undefined;
}

const MONGODB_URI = process.env.MONGO_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGO_URI is not defined');
}

let cached = global._mongoose;

async function dbConnect() {
  if (cached) return cached;
  cached = await mongoose.connect(MONGODB_URI);
  global._mongoose = cached;
  return cached;
}

export default dbConnect;

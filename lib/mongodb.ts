import { MongoClient, type Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error("Failed to connect to MongoDB in development:", error);
      throw error;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((error) => {
    console.error("Failed to connect to MongoDB in production:", error);
    throw error;
  });
}

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  try {
    const client = await clientPromise;
    const db = client.db("slidelink");
    console.log("ha ha ha ha i am connected");
    return { client, db };
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error(
      "Unable to connect to the database. Please check your MongoDB configuration and network connection."
    );
  }
}

export default clientPromise;

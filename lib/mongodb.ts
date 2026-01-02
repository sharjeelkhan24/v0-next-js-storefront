import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Mock MongoDB client for v0 preview (no actual database connection)
const mockClient = {
  db: (name: string) => ({
    collection: (collectionName: string) => ({
      insertOne: async (doc: any) => ({
        insertedId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      }),
      find: () => ({
        sort: () => ({
          limit: () => ({
            toArray: async () => [],
          }),
        }),
      }),
    }),
  }),
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the client across module reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Use mock client promise in development and production for v0 preview compatibility
clientPromise = Promise.resolve(mockClient as any)

export default clientPromise

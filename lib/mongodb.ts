import { MongoClient, type Db, type Collection, type InsertOneResult, type Document } from "mongodb"

// Mock MongoDB client for v0 preview (no actual database connection)
interface MockCollection {
  insertOne: (doc: Document) => Promise<InsertOneResult>
  find: () => { sort: () => { limit: () => { toArray: () => Promise<Document[]> } } }
  findOne: (filter: Document) => Promise<Document | null>
  updateOne: (filter: Document, update: Document) => Promise<{ modifiedCount: number }>
  deleteOne: (filter: Document) => Promise<{ deletedCount: number }>
}

interface MockDb {
  collection: (name: string) => MockCollection
}

interface MockClient {
  db: (name: string) => MockDb
  connect: () => Promise<MockClient>
  close: () => Promise<void>
}

const createMockClient = (): MockClient => ({
  db: (_name: string): MockDb => ({
    collection: (_collectionName: string): MockCollection => ({
      insertOne: async (_doc: Document) => ({
        insertedId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        acknowledged: true,
      }),
      find: () => ({
        sort: () => ({
          limit: () => ({
            toArray: async () => [],
          }),
        }),
      }),
      findOne: async (_filter: Document) => null,
      updateOne: async (_filter: Document, _update: Document) => ({ modifiedCount: 0 }),
      deleteOne: async (_filter: Document) => ({ deletedCount: 0 }),
    }),
  }),
  connect: async function() { return this },
  close: async () => {},
})

let clientPromise: Promise<MongoClient>

// Use mock client when MONGODB_URI is not set or USE_MOCK_DB is true
const useMockDb = !process.env.MONGODB_URI || process.env.USE_MOCK_DB === "true"

if (useMockDb) {
  // Use mock client for v0 preview or when no MongoDB URI is configured
  console.info("[MongoDB] Using mock database client")
  clientPromise = Promise.resolve(createMockClient() as unknown as MongoClient)
} else {
  const uri = process.env.MONGODB_URI!
  const options = {}

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable to preserve the client across module reloads
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, create a new client
    const client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export default clientPromise

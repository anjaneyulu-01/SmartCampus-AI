// MongoDB connection setup for Node.js backend
// Place this file in attendance/backend/src/database/mongo.js

import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anjaneyuludev01_db_user:4sasZVYx7LKfNEws@cluster0.4x6ysvz.mongodb.net/?appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'face_recognition';

let client;
let db;

export async function connectMongo() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('[INFO] Connected to MongoDB Atlas');
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error('MongoDB not connected. Call connectMongo() first.');
  return db;
}

export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[INFO] MongoDB connection closed');
  }
}

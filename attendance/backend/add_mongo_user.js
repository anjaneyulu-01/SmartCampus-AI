// Script to add a user to MongoDB for login testing
// Usage: node add_mongo_user.js

import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anjaneyuludev01_db_user:4sasZVYx7LKfNEws@cluster0.4x6ysvz.mongodb.net/?appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'face_recognition';

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await bcrypt.hash(password, 10);
  return { salt, hash };
}

async function addUser() {
  const username = 'john';
  const password = 'teacher123';
  const role = 'teacher';
  const display_name = 'John Mathew';
  const assigned_classes = 'C,D';
  const is_active = true;

  const { salt, hash } = await hashPassword(password);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const user = {
    username,
    password_hash: hash,
    salt,
    role,
    display_name,
    assigned_classes,
    is_active,
  };

  await db.collection('users').updateOne(
    { username },
    { $set: user },
    { upsert: true }
  );

  console.log('User added/updated:', username);
  await client.close();
}

addUser().catch(console.error);

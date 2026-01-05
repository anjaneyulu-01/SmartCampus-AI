// Script to reset all user passwords in MongoDB to 'pass123'
// Usage: node reset_all_passwords.js
// Requires: npm install mongodb bcrypt crypto

import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anjaneyuludev01_db_user:4sasZVYx7LKfNEws@cluster0.4x6ysvz.mongodb.net/?appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'face_recognition';

async function resetAllPasswords() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const users = db.collection('users');

  const newPassword = 'pass123';
  const hash = await bcrypt.hash(newPassword, 10);
  const salt = crypto.randomBytes(16).toString('hex'); // Not used by bcrypt, but kept for schema compatibility

  const result = await users.updateMany({}, {
    $set: {
      password_hash: hash,
      salt: salt
    }
  });

  console.log(`Updated ${result.modifiedCount} users. All passwords are now 'pass123'.`);
  await client.close();
}

resetAllPasswords().catch(console.error);

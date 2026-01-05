// Migration script: MySQL users to MongoDB
// Usage: node migrate_users_mysql_to_mongo.js
// Requires: npm install mysql2 mongodb

import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

// MySQL connection config (edit as needed)
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '@anji9603947155',
  database: process.env.MYSQL_DB || 'attendance_db',
};

// MongoDB config (edit as needed)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://anjaneyuludev01_db_user:4sasZVYx7LKfNEws@cluster0.4x6ysvz.mongodb.net/?appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'face_recognition';

async function migrateUsers() {
  // Connect to MySQL
  const mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
  const [rows] = await mysqlConn.execute('SELECT * FROM users');
  console.log(`Fetched ${rows.length} users from MySQL.`);

  // Connect to MongoDB
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db(DB_NAME);
  const usersCol = db.collection('users');

  // Insert or update each user in MongoDB
  for (const user of rows) {
    // Map MySQL fields to MongoDB fields
    const mongoUser = {
      username: user.username,
      password_hash: user.password_hash,
      salt: user.salt,
      role: user.role,
      display_name: user.display_name,
      assigned_classes: user.assigned_classes,
      department_id: user.department_id || null,
      is_active: user.is_active !== undefined ? !!user.is_active : true,
      student_id: user.student_id || null,
      // Add more fields as needed
    };
    await usersCol.updateOne(
      { username: mongoUser.username },
      { $set: mongoUser },
      { upsert: true }
    );
    console.log(`Migrated user: ${mongoUser.username}`);
  }

  await mysqlConn.end();
  await mongoClient.close();
  console.log('Migration complete.');
}

migrateUsers().catch(console.error);

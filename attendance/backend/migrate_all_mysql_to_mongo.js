// Migrate all MySQL tables and data to MongoDB
// Usage: node migrate_all_mysql_to_mongo.js
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

async function migrateAllTables() {
  // Connect to MySQL
  const mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
  const [tables] = await mysqlConn.execute('SHOW TABLES');
  const tableNames = tables.map(row => Object.values(row)[0]);
  console.log('Tables found:', tableNames);

  // Connect to MongoDB
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db(DB_NAME);

  for (const table of tableNames) {
    const [rows] = await mysqlConn.execute(`SELECT * FROM \`${table}\``);
    if (rows.length === 0) {
      console.log(`Skipping empty table: ${table}`);
      continue;
    }
    // Insert all rows into MongoDB collection (same name as table)
    const collection = db.collection(table);
    // Remove _id if present to avoid duplicate key errors
    const docs = rows.map(row => {
      const doc = { ...row };
      if (doc._id !== undefined) delete doc._id;
      return doc;
    });
    await collection.deleteMany({}); // Optional: clear collection before insert
    await collection.insertMany(docs);
    console.log(`Migrated ${docs.length} records from ${table}`);
  }

  await mysqlConn.end();
  await mongoClient.close();
  console.log('All tables migrated successfully.');
}

migrateAllTables().catch(console.error);

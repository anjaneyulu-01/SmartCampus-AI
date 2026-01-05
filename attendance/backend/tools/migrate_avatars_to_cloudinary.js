// Script to migrate all avatars to Cloudinary and update DB

import fs from 'fs';
import path from 'path';
import cloudinary from '../cloudinary.js';
import { connectMongo, getDb } from '../src/database/mongo.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AVATARS_DIR = path.join(__dirname, '../avatars');
async function migrateAvatars() {
  await connectMongo();
  const db = getDb();
  const files = fs.readdirSync(AVATARS_DIR).filter(f => f !== 'default.jpg');
  for (const file of files) {
    const filePath = path.join(AVATARS_DIR, file);
    const studentId = path.parse(file).name;
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'avatars',
        public_id: studentId,
      });
      const url = result.secure_url;
      await db.collection('students').updateOne(
        { student_id: studentId },
        { $set: { avatar_url: url } }
      );
      console.log(`Uploaded ${file} → ${url}`);
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err);
    }
  }
  console.log('Migration complete.');
}

migrateAvatars();

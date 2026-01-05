// Migration script: migrate known_faces and avatars metadata to MongoDB
// Usage: node migrate_faces_to_mongo.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongo, getDb } from './src/database/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KNOWN_FACES_DIR = path.join(__dirname, 'known_faces');
const AVATARS_DIR = path.join(__dirname, 'avatars');

async function main() {
  await connectMongo();
  const db = getDb();
  const faceEncodings = db.collection('face_encodings');
  const students = db.collection('students');

  // Scan known_faces
  const knownFaceFiles = fs.readdirSync(KNOWN_FACES_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  for (const file of knownFaceFiles) {
    const studentId = path.basename(file, path.extname(file));
    const faceImagePath = `/known_faces/${file}`;
    // Try to find avatar for this student
    let avatarFile = fs.readdirSync(AVATARS_DIR).find(f => f.startsWith(studentId));
    let avatarPath = avatarFile ? `/avatars/${avatarFile}` : null;
    // Upsert into face_encodings
    await faceEncodings.updateOne(
      { student_id: studentId },
      { $set: { student_id: studentId, face_image_path: faceImagePath, avatar_path: avatarPath } },
      { upsert: true }
    );
    // Optionally update students collection
    await students.updateOne(
      { _id: studentId },
      { $set: { avatar_url: avatarPath, face_image_path: faceImagePath } },
      { upsert: false }
    );
    console.log(`[MIGRATE] ${studentId}: face=${faceImagePath}, avatar=${avatarPath}`);
  }
  console.log('Migration complete.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

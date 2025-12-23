import { dbGet } from '../database/db.js';

/**
 * Get avatar URL for a student
 */
export async function getAvatarUrlForStudent(studentId) {
  try {
    const student = await dbGet('SELECT avatar_url FROM students WHERE id = ?', [studentId]);
    return student?.avatar_url || '/avatars/default.jpg';
  } catch (error) {
    return '/avatars/default.jpg';
  }
}


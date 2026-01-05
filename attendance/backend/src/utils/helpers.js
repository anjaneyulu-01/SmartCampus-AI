
/**
 * Get avatar URL for a student
 */
export async function getAvatarUrlForStudent(studentId) {
  try {
    const { getDb } = await import('../database/mongo.js');
    const db = getDb();
    const student = await db.collection('students').findOne({ _id: studentId });
    return student?.avatar_url || '/avatars/default.jpg';
  } catch (error) {
    return '/avatars/default.jpg';
  }
}
// Removed unused MySQL helper import


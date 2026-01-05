import { getPool } from './src/database/db.js';
import { hashPassword } from './src/utils/password.js';

async function addTeacher() {
  try {
    const db = getPool();
    
    // First, check existing teachers
    const [existingTeachers] = await db.query(
      'SELECT username, role, display_name, assigned_classes FROM users WHERE role = ?',
      ['teacher']
    );
    
    console.log('\n=== Current Teachers ===');
    console.log(existingTeachers);
    
    // Get CSE department ID
    const [cseDept] = await db.query('SELECT id FROM departments WHERE code = ?', ['CSE']);
    const cseDeptId = cseDept?.[0]?.id || null;
    
    // Add new teacher: john / teacher123
    const username = 'john';
    const password = 'teacher123';
    const { salt, hash } = hashPassword(password);
    
    await db.query(`
      INSERT INTO users (username, password_hash, salt, role, display_name, assigned_classes, department_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        salt = VALUES(salt),
        role = VALUES(role),
        display_name = VALUES(display_name),
        assigned_classes = VALUES(assigned_classes),
        department_id = VALUES(department_id)
    `, [username, hash, salt, 'teacher', 'John Mathew', 'C,D', cseDeptId]);
    
    console.log('\n=== New Teacher Added ===');
    console.log({
      username: username,
      password: password,
      display_name: 'John Mathew',
      assigned_classes: 'C,D',
      department: 'CSE'
    });
    
    // Show all teachers now
    const [allTeachers] = await db.query(
      'SELECT username, role, display_name, assigned_classes, department_id FROM users WHERE role = ?',
      ['teacher']
    );
    
    console.log('\n=== All Teachers After Insert ===');
    console.log(allTeachers);
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding teacher:', error);
    process.exit(1);
  }
}

addTeacher();

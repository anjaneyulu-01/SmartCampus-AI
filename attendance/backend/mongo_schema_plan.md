// MongoDB schema plan for migration from MySQL
// This file documents the collections and fields to be used in MongoDB

/*
Collections:
- departments
- classes
- announcements
- faculty
- workers
- students
- attendance_events
- trust_scores
- messages
- leave_requests
- users
- insights
- student_face_encodings
*/

// Example: departments
// {
//   _id: ObjectId,
//   name: String,
//   code: String,
//   hod_username: String,
//   building: String,
//   contact_email: String,
//   created_at: Date
// }

// Example: students
// {
//   _id: ObjectId,
//   id: String, // legacy student id
//   name: String,
//   avatar_url: String,
//   seat_row: Number,
//   seat_col: Number,
//   mobile: String,
//   class: String,
//   department_id: ObjectId,
//   class_id: ObjectId,
//   enrollment_number: String,
//   created_at: Date
// }

// Relationships will use ObjectId references instead of foreign keys.
// All tables will be mapped to collections with similar field names.
// ENUMs will be stored as strings.
// Indexes can be added for performance as needed.

// Next step: Refactor backend code to use MongoDB collections and queries.

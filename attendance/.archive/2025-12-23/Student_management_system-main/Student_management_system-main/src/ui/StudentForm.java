package ui;

import db.DBConnection;
import model.Student;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.sql.Connection;
import java.sql.PreparedStatement;

/**
 * StudentForm
 * ------------
 * Panel for adding new students (and editing in future).
 * Uses JDBC connection to insert records into the database.
 */
public class StudentForm extends JPanel {

    private final JTextField nameField;
    private final JTextField courseField;
    private final JTextField semesterField;
    private final JLabel statusLabel;

    public StudentForm() {
        setLayout(new GridBagLayout());
        setBackground(new Color(45, 45, 45));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0;

        JLabel title = new JLabel("➕ Add New Student", SwingConstants.CENTER);
        title.setFont(new Font("Segoe UI", Font.BOLD, 22));
        title.setForeground(Color.WHITE);
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        add(title, gbc);

        gbc.gridwidth = 1;

        // Name
        gbc.gridy++;
        gbc.gridx = 0;
        add(label("Name:"), gbc);
        gbc.gridx = 1;
        gbc.weightx = 1.0;
        nameField = new JTextField(15);
        nameField.setPreferredSize(new Dimension(200, 25));
        add(nameField, gbc);

        // Course
        gbc.gridy++;
        gbc.gridx = 0;
        add(label("Course:"), gbc);
        gbc.gridx = 1;
        gbc.weightx = 1.0;
        courseField = new JTextField(15);
        courseField.setPreferredSize(new Dimension(200, 25));
        add(courseField, gbc);

        // Semester
        gbc.gridy++;
        gbc.gridx = 0;
        add(label("Semester:"), gbc);
        gbc.gridx = 1;
        gbc.weightx = 1.0;
        semesterField = new JTextField(15);
        semesterField.setPreferredSize(new Dimension(200, 25));
        add(semesterField, gbc);

        // Button
        gbc.gridy++;
        gbc.gridx = 0;
        gbc.gridwidth = 2;
        JButton addBtn = new JButton("Add Student");
        addBtn.setBackground(new Color(70, 130, 180));
        addBtn.setForeground(Color.WHITE);
        addBtn.setFocusPainted(false);
        add(addBtn, gbc);

        // Status label
        gbc.gridy++;
        statusLabel = new JLabel(" ", SwingConstants.CENTER);
        statusLabel.setForeground(Color.LIGHT_GRAY);
        add(statusLabel, gbc);

        addBtn.addActionListener(this::onAddStudent);
    }

    private JLabel label(String text) {
        JLabel l = new JLabel(text);
        l.setForeground(Color.WHITE);
        return l;
    }

    private void onAddStudent(ActionEvent e) {
        String name = nameField.getText().trim();
        String course = courseField.getText().trim();
        String semText = semesterField.getText().trim();

        if (name.isEmpty() || course.isEmpty() || semText.isEmpty()) {
            showStatus("⚠ Please fill all fields!", Color.ORANGE);
            return;
        }

        try {
            int semester = Integer.parseInt(semText);
            Student student = new Student(name, course, semester);

            try (Connection con = DBConnection.getInstance().getConnection()) {
                PreparedStatement ps = con.prepareStatement(
                        "INSERT INTO students(name, course, semester) VALUES (?, ?, ?)");
                ps.setString(1, student.getName());
                ps.setString(2, student.getCourse());
                ps.setInt(3, student.getSemester());
                ps.executeUpdate();
                showStatus("✅ Student added successfully!", new Color(100, 255, 100));

                // Clear fields
                nameField.setText("");
                courseField.setText("");
                semesterField.setText("");
            }
        } catch (NumberFormatException ex) {
            showStatus("❌ Semester must be a number!", Color.RED);
        } catch (Exception ex) {
            showStatus("❌ Error: " + ex.getMessage(), Color.RED);
        }
    }

    private void showStatus(String msg, Color color) {
        statusLabel.setText(msg);
        statusLabel.setForeground(color);
    }
}

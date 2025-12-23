package ui;

import db.DBConnection;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * StudentTable
 * -------------
 * Displays all student records in a JTable.
 * Supports search, refresh, and delete operations.
 */
public class StudentTable extends JPanel {

    private final JTable table;
    private final DefaultTableModel model;
    private final JTextField searchField;
    private final JLabel statusLabel;

    public StudentTable() {
        setLayout(new BorderLayout(10, 10));
        setBackground(new Color(45, 45, 45));
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        // Top panel (search + buttons)
        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        topPanel.setBackground(new Color(45, 45, 45));

        JLabel searchLabel = new JLabel("🔍 Search:");
        searchLabel.setForeground(Color.WHITE);
        searchField = new JTextField(20);

        JButton refreshBtn = new JButton("🔄 Refresh");
        JButton deleteBtn = new JButton("🗑 Delete");

        topPanel.add(searchLabel);
        topPanel.add(searchField);
        topPanel.add(refreshBtn);
        topPanel.add(deleteBtn);

        add(topPanel, BorderLayout.NORTH);

        // Table
        model = new DefaultTableModel(new String[]{"ID", "Name", "Course", "Semester"}, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false; // Make table non-editable
            }
        };
        table = new JTable(model);
        table.setFillsViewportHeight(true);
        table.setRowHeight(28);
        table.setSelectionBackground(new Color(100, 149, 237));
        table.setSelectionForeground(Color.WHITE);
        table.setAutoResizeMode(JTable.AUTO_RESIZE_ALL_COLUMNS);
        
        // Set column widths
        table.getColumnModel().getColumn(0).setPreferredWidth(50);
        table.getColumnModel().getColumn(1).setPreferredWidth(200);
        table.getColumnModel().getColumn(2).setPreferredWidth(200);
        table.getColumnModel().getColumn(3).setPreferredWidth(100);

        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        add(scrollPane, BorderLayout.CENTER);

        // Status label
        statusLabel = new JLabel(" ", SwingConstants.LEFT);
        statusLabel.setForeground(Color.LIGHT_GRAY);
        add(statusLabel, BorderLayout.SOUTH);

        // Events
        refreshBtn.addActionListener(e -> loadStudents());
        deleteBtn.addActionListener(this::onDeleteStudent);
        searchField.addActionListener(e -> searchStudents());

        loadStudents();
    }

    /** Load all students into the table */
    private void loadStudents() {
        model.setRowCount(0);
        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT * FROM students ORDER BY id DESC");
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                model.addRow(new Object[]{
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("course"),
                        rs.getInt("semester")
                });
            }
            showStatus("✅ Data loaded successfully.");
        } catch (Exception e) {
            showStatus("❌ Error loading data: " + e.getMessage());
        }
    }

    /** Search by name or course */
    private void searchStudents() {
        String query = searchField.getText().trim();
        model.setRowCount(0);

        if (query.isEmpty()) {
            loadStudents();
            return;
        }

        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT * FROM students WHERE name LIKE ? OR course LIKE ?")) {
            ps.setString(1, "%" + query + "%");
            ps.setString(2, "%" + query + "%");
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                model.addRow(new Object[]{
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("course"),
                        rs.getInt("semester")
                });
            }

            showStatus("🔍 Showing results for: " + query);
        } catch (Exception e) {
            showStatus("❌ Error searching: " + e.getMessage());
        }
    }

    /** Delete selected student */
    private void onDeleteStudent(ActionEvent e) {
        int selectedRow = table.getSelectedRow();
        if (selectedRow == -1) {
            showStatus("⚠ Please select a student to delete.");
            return;
        }

        int id = (int) model.getValueAt(selectedRow, 0);
        int confirm = JOptionPane.showConfirmDialog(
                this, "Delete student ID " + id + "?", "Confirm Delete", JOptionPane.YES_NO_OPTION);

        if (confirm == JOptionPane.YES_OPTION) {
            try (Connection con = DBConnection.getInstance().getConnection();
                 PreparedStatement ps = con.prepareStatement("DELETE FROM students WHERE id = ?")) {
                ps.setInt(1, id);
                ps.executeUpdate();
                showStatus("🗑 Deleted student with ID " + id);
                loadStudents();
            } catch (Exception ex) {
                showStatus("❌ Error deleting: " + ex.getMessage());
            }
        }
    }

    private void showStatus(String msg) {
        statusLabel.setText(msg);
    }
}

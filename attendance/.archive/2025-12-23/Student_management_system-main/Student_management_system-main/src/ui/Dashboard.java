package ui;

import model.Student;
import utils.ThemeManager;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;

/**
 * Dashboard
 * ----------
 * Main window after login.
 * Provides navigation and loads content panels dynamically.
 */
public class Dashboard extends JFrame {
    private final JPanel contentPanel;
    private final JLabel titleLabel;
    private final String username;

    public Dashboard(String username) {
        this.username = username;

        ThemeManager.applyDarkTheme();
        setTitle("🎓 Student Management System - Dashboard");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 700);
        setMinimumSize(new Dimension(800, 500));
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Sidebar
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new GridLayout(8, 1, 5, 5));
        sidebar.setBackground(new Color(25, 25, 25));
        sidebar.setBorder(BorderFactory.createEmptyBorder(20, 10, 20, 10));
        sidebar.setPreferredSize(new Dimension(200, 0));
        sidebar.setMinimumSize(new Dimension(180, 0));

        JButton addBtn = navButton("➕  Add Student");
        JButton viewBtn = navButton("📋  View Students");
        JButton analyticsBtn = navButton("📊  Analytics");
        JButton themeBtn = navButton("🌓  Toggle Theme");
        JButton logoutBtn = navButton("🚪  Logout");

        sidebar.add(addBtn);
        sidebar.add(viewBtn);
        sidebar.add(analyticsBtn);
        sidebar.add(themeBtn);
        sidebar.add(logoutBtn);

        // Top bar
        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setBackground(new Color(35, 35, 35));
        topBar.setPreferredSize(new Dimension(0, 50));
        titleLabel = new JLabel("Dashboard", SwingConstants.CENTER);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setForeground(Color.WHITE);
        topBar.add(titleLabel, BorderLayout.CENTER);
        JLabel userLabel = new JLabel("👋 " + username + " ", SwingConstants.RIGHT);
        userLabel.setForeground(Color.LIGHT_GRAY);
        userLabel.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 10));
        topBar.add(userLabel, BorderLayout.EAST);

        // Content area
        contentPanel = new JPanel(new BorderLayout());
        contentPanel.setBackground(new Color(45, 45, 45));
        contentPanel.add(new JLabel("Welcome to the Student Management System Dashboard!",
                SwingConstants.CENTER), BorderLayout.CENTER);

        add(sidebar, BorderLayout.WEST);
        add(topBar, BorderLayout.NORTH);
        add(contentPanel, BorderLayout.CENTER);

        // Action Listeners
        addBtn.addActionListener(e -> switchPanel("Add Student", new StudentForm()));
        viewBtn.addActionListener(e -> switchPanel("View Students", new StudentTable()));
        analyticsBtn.addActionListener(e -> switchPanel("Analytics", new AnalyticsPanel()));
        themeBtn.addActionListener(this::toggleTheme);
        logoutBtn.addActionListener(e -> logout());

        setVisible(true);
    }

    private JButton navButton(String text) {
        JButton btn = new JButton(text);
        btn.setFocusPainted(false);
        btn.setFont(new Font("Segoe UI", Font.PLAIN, 16));
        btn.setBackground(new Color(50, 50, 50));
        btn.setForeground(Color.WHITE);
        btn.setBorder(BorderFactory.createEmptyBorder(10, 15, 10, 15));
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return btn;
    }

    private void switchPanel(String title, JPanel panel) {
        titleLabel.setText(title);
        contentPanel.removeAll();
        contentPanel.add(panel, BorderLayout.CENTER);
        contentPanel.revalidate();
        contentPanel.repaint();
    }

    private void toggleTheme(ActionEvent e) {
        ThemeManager.toggleTheme(this);
    }

    private void logout() {
        int confirm = JOptionPane.showConfirmDialog(this,
                "Are you sure you want to logout?", "Logout",
                JOptionPane.YES_NO_OPTION);
        if (confirm == JOptionPane.YES_OPTION) {
            dispose();
            new LoginScreen();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Dashboard("admin"));
    }
}

package ui;

import db.DBConnection;
import utils.SecurityUtil;
import utils.ThemeManager;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Secure login with SHA-256 hashes + simple Sign Up dialog.
 * users table: (id INT PK AI, username VARCHAR(50) UNIQUE, pass_hash CHAR(64))
 */
public class LoginScreen extends JFrame {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginBtn, signupBtn;
    private JLabel statusLabel;

    public LoginScreen() {
        ThemeManager.applyDarkTheme();
        initUI();
        ensureUsersTable();
        ensureDefaultAdmin();
    }

    private void initUI() {
        setTitle("Student Management System - Login");
        setSize(420, 310);
        setMinimumSize(new Dimension(380, 280));
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setResizable(true);

        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(18, 24, 18, 24));
        panel.setBackground(new Color(30, 30, 30));
        GridBagConstraints g = new GridBagConstraints();
        g.insets = new Insets(10, 10, 10, 10);
        g.fill = GridBagConstraints.HORIZONTAL;

        JLabel title = new JLabel("🔐 Admin Login", SwingConstants.CENTER);
        title.setFont(new Font("Segoe UI", Font.BOLD, 20));
        title.setForeground(Color.WHITE);

        g.gridx = 0; g.gridy = 0; g.gridwidth = 2; panel.add(title, g);
        g.gridwidth = 1;

        g.gridy++; g.gridx = 0; panel.add(label("Username:"), g);
        g.gridx = 1; usernameField = new JTextField(16); panel.add(usernameField, g);

        g.gridy++; g.gridx = 0; panel.add(label("Password:"), g);
        g.gridx = 1; passwordField = new JPasswordField(16); panel.add(passwordField, g);

        g.gridy++; g.gridx = 0; loginBtn = new JButton("Login"); panel.add(loginBtn, g);
        g.gridx = 1; signupBtn = new JButton("Sign Up"); panel.add(signupBtn, g);

        g.gridy++; g.gridx = 0; g.gridwidth = 2;
        statusLabel = new JLabel(" ", SwingConstants.CENTER);
        statusLabel.setForeground(Color.LIGHT_GRAY);
        panel.add(statusLabel, g);

        loginBtn.addActionListener(this::onLogin);
        signupBtn.addActionListener(e -> openSignupDialog());

        add(panel);
        getRootPane().setDefaultButton(loginBtn);
    }

    private JLabel label(String t){ JLabel l=new JLabel(t); l.setForeground(Color.WHITE); return l; }

    private void onLogin(ActionEvent e) {
        String user = usernameField.getText().trim();
        String password = new String(passwordField.getPassword());
        
        if (user.isEmpty()) { 
            show("⚠ Enter username", Color.ORANGE); 
            return; 
        }
        
        if (password.isEmpty()) {
            show("⚠ Enter password", Color.ORANGE);
            return;
        }
        
        String passHash = SecurityUtil.sha256(password);
        System.out.println("🔐 Attempting login for user: " + user);

        try (Connection con = DBConnection.getInstance().getConnection()) {
            PreparedStatement ps = con.prepareStatement(
                "SELECT 1 FROM users WHERE username=? AND pass_hash=?");
            ps.setString(1, user);
            ps.setString(2, passHash);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                System.out.println("✅ Login successful for user: " + user);
                show("✅ Login successful!", new Color(100,255,120));
                dispose();
                new Dashboard(user);
            } else {
                System.out.println("❌ Invalid credentials for user: " + user);
                show("❌ Invalid credentials", Color.RED);
            }
        } catch (Exception ex) { 
            System.err.println("❌ Login error: " + ex.getMessage());
            ex.printStackTrace();
            show("❌ Error: " + ex.getMessage(), Color.RED); 
        }
    }

    private void openSignupDialog() {
        JTextField u = new JTextField(14);
        JPasswordField p = new JPasswordField(14);
        JPanel box = new JPanel(new GridLayout(0,1));
        box.add(new JLabel("New Username:")); box.add(u);
        box.add(new JLabel("New Password:")); box.add(p);

        int ok = JOptionPane.showConfirmDialog(this, box, "Create Admin/Teacher", JOptionPane.OK_CANCEL_OPTION);
        if (ok != JOptionPane.OK_OPTION) return;

        String user = u.getText().trim();
        String hash = SecurityUtil.sha256(new String(p.getPassword()));
        if (user.isEmpty() || hash.isEmpty()) { show("⚠ Enter both fields", Color.ORANGE); return; }

        try (Connection con = DBConnection.getInstance().getConnection()) {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO users(username, pass_hash) VALUES(?, ?)");
            ps.setString(1, user);
            ps.setString(2, hash);
            ps.executeUpdate();
            show("✅ User created: " + user, new Color(120,200,255));
        } catch (Exception ex) { show("❌ " + ex.getMessage(), Color.RED); }
    }

    private void ensureUsersTable() {
        try (Connection con = DBConnection.getInstance().getConnection()) {
            // First, check if table exists and has correct structure
            try (java.sql.Statement stmt = con.createStatement()) {
                // Try to query the table structure
                try (java.sql.ResultSet rs = stmt.executeQuery("DESCRIBE users")) {
                    boolean hasPassHash = false;
                    while (rs.next()) {
                        if ("pass_hash".equalsIgnoreCase(rs.getString("Field"))) {
                            hasPassHash = true;
                            break;
                        }
                    }
                    if (!hasPassHash) {
                        // Table exists but has wrong structure - drop and recreate
                        System.out.println("⚠️ Users table has wrong structure, recreating...");
                        stmt.executeUpdate("DROP TABLE IF EXISTS users");
                    }
                } catch (Exception e) {
                    // Table doesn't exist, will create it
                    System.out.println("ℹ️ Users table doesn't exist, will create it");
                }
            }
            
            // Create table with correct structure
            try (PreparedStatement ps = con.prepareStatement(
                     "CREATE TABLE IF NOT EXISTS users (" +
                     "id INT AUTO_INCREMENT PRIMARY KEY," +
                     "username VARCHAR(50) UNIQUE," +
                     "pass_hash CHAR(64) NOT NULL)")) {
                ps.executeUpdate();
                System.out.println("✅ Users table ensured with correct structure");
            }
        } catch (Exception e) {
            System.err.println("❌ User table error: " + e.getMessage());
            e.printStackTrace();
            show("⚠ Database error - check console", Color.ORANGE);
        }
    }

    private void ensureDefaultAdmin() {
        try (Connection con = DBConnection.getInstance().getConnection()) {
            ResultSet rs = con.createStatement().executeQuery("SELECT COUNT(*) FROM users");
            if (rs.next() && rs.getInt(1)==0) {
                PreparedStatement ins = con.prepareStatement(
                    "INSERT INTO users(username, pass_hash) VALUES(?,?)");
                ins.setString(1, "admin");
                ins.setString(2, SecurityUtil.sha256("admin123"));
                ins.executeUpdate();
                System.out.println("✅ Default admin user created (username: admin, password: admin123)");
            } else {
                System.out.println("✅ Users table already has entries");
            }
        } catch (Exception e) {
            System.err.println("❌ Error ensuring default admin: " + e.getMessage());
            e.printStackTrace();
            show("⚠ Database error - check console", Color.ORANGE);
        }
    }

    private void show(String msg, Color c) {
        statusLabel.setText(msg);
        statusLabel.setForeground(c);
    }

    public static void main(String[] a) {
        SwingUtilities.invokeLater(() -> {
            LoginScreen frame = new LoginScreen();
            frame.setVisible(true);
        });
    }
}

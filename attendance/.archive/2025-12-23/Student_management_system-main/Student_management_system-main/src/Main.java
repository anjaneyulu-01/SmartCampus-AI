import ui.LoginScreen;
import utils.ThemeManager;

import javax.swing.*;

/**
 * Main - Entry Point for Student Management System
 * ================================================
 * Applies dark theme and launches the login screen.
 * This is the main entry point for the entire application.
 */
public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                ThemeManager.applyDarkTheme();
                System.out.println("✅ Launching Student Management System...");
                LoginScreen loginScreen = new LoginScreen();
                loginScreen.setVisible(true);
            } catch (Exception e) {
                System.err.println("❌ Error launching application: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }
}

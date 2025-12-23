package utils;

import com.formdev.flatlaf.FlatDarkLaf;
import com.formdev.flatlaf.FlatLightLaf;
import javax.swing.*;

/**
 * ThemeManager
 * -------------
 * Handles global theme setup using FlatLaf.
 * Call ThemeManager.applyDarkTheme() or applyLightTheme()
 * before initializing Swing components.
 */
public class ThemeManager {

    private static boolean isDark = true; // Default: dark theme

    /** Apply the current theme */
    public static void applyTheme() {
        try {
            if (isDark) {
                UIManager.setLookAndFeel(new FlatDarkLaf());
            } else {
                UIManager.setLookAndFeel(new FlatLightLaf());
            }
            UIManager.put("Button.arc", 20);
            UIManager.put("Component.arc", 15);
            UIManager.put("TextComponent.arc", 10);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to apply theme: " + e.getMessage());
        }
    }

    /** Switch between Dark and Light mode */
    public static void toggleTheme(JFrame frame) {
        isDark = !isDark;
        applyTheme();
        SwingUtilities.updateComponentTreeUI(frame);
        frame.repaint();
    }

    /** Force dark mode */
    public static void applyDarkTheme() {
        isDark = true;
        applyTheme();
    }

    /** Force light mode */
    public static void applyLightTheme() {
        isDark = false;
        applyTheme();
    }

    /** Check if dark mode is enabled */
    public static boolean isDarkMode() {
        return isDark;
    }
}

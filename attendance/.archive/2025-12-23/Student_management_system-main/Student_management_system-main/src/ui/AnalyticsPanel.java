package ui;

import db.DBConnection;
import utils.ChartUtils;

import javax.swing.*;
import java.awt.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.LinkedHashMap;
import java.util.Map;

/** Dashboard analytics: totals + 2 charts (course & semester). */
public class AnalyticsPanel extends JPanel {

    public AnalyticsPanel() {
        setLayout(new BorderLayout(10,10));
        setBackground(new Color(45,45,45));
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        add(buildStatsHeader(), BorderLayout.NORTH);
        add(buildCharts(), BorderLayout.CENTER);
    }

    private JPanel buildStatsHeader() {
        JPanel row = new JPanel(new GridLayout(1,3,10,10));
        row.setBackground(new Color(45,45,45));
        int total = scalar("SELECT COUNT(*) FROM students");
        int distinctCourses = scalar("SELECT COUNT(DISTINCT course) FROM students");
        int maxSem = scalar("SELECT IFNULL(MAX(semester),0) FROM students");
        row.add(card("👥  Total Students", String.valueOf(total)));
        row.add(card("📚  Courses", String.valueOf(distinctCourses)));
        row.add(card("🎓  Max Semester", String.valueOf(maxSem)));
        return row;
    }

    private JPanel card(String title, String value){
        JPanel p = new JPanel(new BorderLayout());
        p.setBackground(new Color(35,35,35));
        p.setBorder(BorderFactory.createEmptyBorder(12,16,12,16));
        JLabel t = new JLabel(title); t.setForeground(Color.LIGHT_GRAY);
        t.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        JLabel v = new JLabel(value); v.setForeground(Color.WHITE);
        v.setFont(new Font("Segoe UI", Font.BOLD, 22));
        p.add(t, BorderLayout.NORTH); p.add(v, BorderLayout.CENTER);
        return p;
    }

    private JPanel buildCharts() {
        JPanel charts = new JPanel(new GridLayout(1,2,10,10));
        charts.setBackground(new Color(45,45,45));
        charts.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        Map<String,Integer> byCourse = new LinkedHashMap<>();
        Map<String,Integer> bySem = new LinkedHashMap<>();

        try (Connection con = DBConnection.getInstance().getConnection()) {
            ResultSet rs1 = con.createStatement().executeQuery(
                "SELECT course, COUNT(*) c FROM students GROUP BY course ORDER BY c DESC");
            while (rs1.next()) {
                byCourse.put(rs1.getString(1), rs1.getInt(2));
            }

            ResultSet rs2 = con.createStatement().executeQuery(
                "SELECT semester, COUNT(*) c FROM students GROUP BY semester ORDER BY semester");
            while (rs2.next()) {
                bySem.put("Sem " + rs2.getInt(1), rs2.getInt(2));
            }
        } catch (Exception e) {
            JPanel err = new JPanel();
            err.setBackground(new Color(45,45,45));
            JLabel errLabel = new JLabel("❌ Analytics error: " + e.getMessage());
            errLabel.setForeground(Color.RED);
            err.add(errLabel);
            return err;
        }

        // Check if data exists before creating charts
        if (!byCourse.isEmpty()) {
            charts.add(ChartUtils.createPieChart("Students by Course", byCourse));
        } else {
            JPanel emptyPanel = new JPanel();
            emptyPanel.setBackground(new Color(45,45,45));
            JLabel emptyLabel = new JLabel("No data available");
            emptyLabel.setForeground(Color.LIGHT_GRAY);
            emptyPanel.add(emptyLabel);
            charts.add(emptyPanel);
        }

        if (!bySem.isEmpty()) {
            charts.add(ChartUtils.createBarChart("Students by Semester", "Semester", "Count", bySem));
        } else {
            JPanel emptyPanel = new JPanel();
            emptyPanel.setBackground(new Color(45,45,45));
            JLabel emptyLabel = new JLabel("No data available");
            emptyLabel.setForeground(Color.LIGHT_GRAY);
            emptyPanel.add(emptyLabel);
            charts.add(emptyPanel);
        }

        return charts;
    }

    private int scalar(String sql){
        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 0;
        } catch (Exception e) { return 0; }
    }
}

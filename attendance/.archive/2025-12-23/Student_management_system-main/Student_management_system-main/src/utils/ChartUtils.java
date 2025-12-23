package utils;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;

import javax.swing.*;
import java.awt.*;
import java.util.Map;

/**
 * ChartUtils (JFreeChart 1.0.19 compatible)
 * -----------------------------------------
 * Provides helper methods to generate charts for the Analytics panel.
 */
public class ChartUtils {

    /** Create a Pie Chart panel */
    public static JPanel createPieChart(String title, Map<String, Integer> data) {
        DefaultPieDataset dataset = new DefaultPieDataset();

        for (String key : data.keySet()) {
            dataset.setValue(key, data.get(key));
        }

        JFreeChart chart = ChartFactory.createPieChart(
                title,
                dataset,
                true,   // legend
                true,   // tooltips
                false   // URLs
        );

        ChartPanel panel = new ChartPanel(chart);
        stylePanel(panel);
        return panel;
    }

    /** Create a Bar Chart panel */
    public static JPanel createBarChart(String title, String categoryAxis, String valueAxis,
                                        Map<String, Integer> data) {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        for (String key : data.keySet()) {
            dataset.addValue(data.get(key), "Students", key);
        }

        JFreeChart chart = ChartFactory.createBarChart(
                title,
                categoryAxis,
                valueAxis,
                dataset,
                PlotOrientation.VERTICAL,
                true,
                true,
                false
        );

        ChartPanel panel = new ChartPanel(chart);
        stylePanel(panel);
        return panel;
    }

    /** Styling helper for chart panels */
    private static void stylePanel(ChartPanel panel) {
        panel.setPreferredSize(new Dimension(450, 300));
        panel.setMinimumSize(new Dimension(300, 200));
        panel.setBackground(new Color(40, 40, 40));
        panel.setDomainZoomable(true);
        panel.setRangeZoomable(true);
    }
}

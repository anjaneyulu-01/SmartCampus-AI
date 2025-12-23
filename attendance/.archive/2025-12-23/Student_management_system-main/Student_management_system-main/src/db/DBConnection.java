package db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * DBConnection
 * ------------
 * Centralized JDBC connection manager (Singleton).
 * - Connects to MySQL 8
 * - Auto-creates required schema/table if missing
 * - Call DBConnection.getInstance().getConnection()
 */
public class DBConnection {

    // ✅ Update here if your creds change
    private static final String DB_NAME   = "studentdb";
    private static final String URL       = "jdbc:mysql://localhost:3306/" + DB_NAME
            + "?allowPublicKeyRetrieval=true&useSSL=false&autoReconnect=true";
    private static final String USER      = "root";
    private static final String PASSWORD  = "laddu@8483";

    private static DBConnection instance;
    private Connection connection;

    private DBConnection() {
        connect();
        ensureSchema();
    }

    /** Get the single instance */
    public static synchronized DBConnection getInstance() {
        if (instance == null) {
            instance = new DBConnection();
        }
        return instance;
    }

    /** Provide a live JDBC connection */
    public Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                connect();
            }
        } catch (SQLException ignored) {}
        return connection;
    }

    /** Create the connection */
    private void connect() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            // First try to connect without database to create it if needed
            String baseUrl = "jdbc:mysql://localhost:3306/?allowPublicKeyRetrieval=true&useSSL=false&autoReconnect=true";
            try (Connection tempCon = DriverManager.getConnection(baseUrl, USER, PASSWORD);
                 Statement stmt = tempCon.createStatement()) {
                stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS " + DB_NAME);
                System.out.println("✅ Database '" + DB_NAME + "' ensured");
            } catch (Exception e) {
                System.err.println("⚠️ Could not create database (may already exist): " + e.getMessage());
            }
            
            // Now connect to the database
            connection = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("✅ DB Connected: " + URL);
        } catch (Exception e) {
            System.err.println("❌ DB Connection failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    /** Ensure DB has the required tables */
    private void ensureSchema() {
        final String createStudents =
                "CREATE TABLE IF NOT EXISTS students (" +
                "  id INT AUTO_INCREMENT PRIMARY KEY," +
                "  name VARCHAR(100) NOT NULL," +
                "  course VARCHAR(100) NOT NULL," +
                "  semester INT NOT NULL" +
                ");";

        try (Statement st = connection.createStatement()) {
            st.executeUpdate(createStudents);
        } catch (SQLException e) {
            System.err.println("⚠️ Schema init warning: " + e.getMessage());
        }
    }
}

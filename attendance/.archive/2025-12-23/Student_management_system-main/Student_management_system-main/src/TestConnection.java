import java.sql.*;

/**
 * TestConnection
 * ---------------
 * Utility class to test database connectivity.
 * Run this to verify your MySQL connection is working.
 */
public class TestConnection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/studentdb?allowPublicKeyRetrieval=true&useSSL=false";
        String user = "root";
        String pass = "laddu@8483"; // Your MySQL root password

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("✅ JDBC Driver loaded successfully!");

            Connection con = DriverManager.getConnection(url, user, pass);
            System.out.println("✅ Database Connected Successfully!");
            System.out.println("✅ Connection URL: " + url);
            System.out.println("✅ Connected as user: " + user);

            con.close();
            System.out.println("✅ Connection closed successfully!");

        } catch (ClassNotFoundException e) {
            System.out.println("❌ JDBC Driver not found!");
            System.out.println("   Make sure mysql-connector-java JAR is in your classpath");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("❌ Database Connection Failed!");
            System.out.println("   Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

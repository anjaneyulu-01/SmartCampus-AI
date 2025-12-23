package utils;

import java.security.MessageDigest;

/**
 * SecurityUtil
 * ============
 * Utility class for password hashing and verification.
 * Uses SHA-256 hashing algorithm for secure password storage.
 */
public class SecurityUtil {

    /**
     * Hash a password using SHA-256
     * @param password The raw password to hash
     * @return The hexadecimal SHA-256 hash of the password
     */
    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    /**
     * SHA-256 - Backward compatible method for existing code
     * @param password The password to hash
     * @return The hexadecimal SHA-256 hash
     */
    public static String sha256(String password) {
        return hashPassword(password);
    }

    /**
     * Verify a raw password against its hashed version
     * @param raw The raw password to verify
     * @param hashed The stored hash to compare against
     * @return True if passwords match, false otherwise
     */
    public static boolean verifyPassword(String raw, String hashed) {
        return hashPassword(raw).equals(hashed);
    }
}

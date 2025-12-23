package model;

/**
 * Student Model
 * --------------
 * Represents a single student record in the system.
 * Used for CRUD operations, table display, and analytics.
 */
public class Student {
    private int id;
    private String name;
    private String course;
    private int semester;

    // Constructors
    public Student() {}

    public Student(int id, String name, String course, int semester) {
        this.id = id;
        this.name = name;
        this.course = course;
        this.semester = semester;
    }

    public Student(String name, String course, int semester) {
        this.name = name;
        this.course = course;
        this.semester = semester;
    }

    // Getters & Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    @Override
    public String toString() {
        return String.format("%d - %s (%s - Sem %d)", id, name, course, semester);
    }
}

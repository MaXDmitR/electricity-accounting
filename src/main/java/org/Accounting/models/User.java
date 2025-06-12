package org.Accounting.models;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Diapason> userDataRecords = new HashSet<>();

    private String email,password,name;

    public User() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Diapason> getUserDataRecords() {
        return userDataRecords;
    }

    public void setUserDataRecords(Set<Diapason> userDataRecords) {
        this.userDataRecords = userDataRecords;
    }

    public User(String email, String password, String name) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
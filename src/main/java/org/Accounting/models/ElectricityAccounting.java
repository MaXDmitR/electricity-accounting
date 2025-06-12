package org.Accounting.models;

import jakarta.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty; // Імпортуємо JsonProperty

import java.time.LocalDate;

@Entity
@Table(name = "electricity_calculated") // Використовуйте назву таблиці, яка відповідає вашій БД
public class ElectricityAccounting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private LocalDate recordDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @JsonProperty("hour1")
    private Integer hour1;
    @JsonProperty("hour2")
    private Integer hour2;
    @JsonProperty("hour3")
    private Integer hour3;
    @JsonProperty("hour4")
    private Integer hour4;
    @JsonProperty("hour5")
    private Integer hour5;
    @JsonProperty("hour6")
    private Integer hour6;
    @JsonProperty("hour7")
    private Integer hour7;
    @JsonProperty("hour8")
    private Integer hour8;
    @JsonProperty("hour9")
    private Integer hour9;
    @JsonProperty("hour10")
    private Integer hour10;
    @JsonProperty("hour11")
    private Integer hour11;
    @JsonProperty("hour12")
    private Integer hour12;
    @JsonProperty("hour13")
    private Integer hour13;
    @JsonProperty("hour14")
    private Integer hour14;
    @JsonProperty("hour15")
    private Integer hour15;
    @JsonProperty("hour16")
    private Integer hour16;
    @JsonProperty("hour17")
    private Integer hour17;
    @JsonProperty("hour18")
    private Integer hour18;
    @JsonProperty("hour19")
    private Integer hour19;
    @JsonProperty("hour20")
    private Integer hour20;
    @JsonProperty("hour21")
    private Integer hour21;
    @JsonProperty("hour22")
    private Integer hour22;
    @JsonProperty("hour23")
    private Integer hour23;
    @JsonProperty("hour24")
    private Integer hour24;

    public ElectricityAccounting() {}

    public ElectricityAccounting(LocalDate recordDate, User user,
                                 Integer hour1, Integer hour2, Integer hour3, Integer hour4, Integer hour5,
                                 Integer hour6, Integer hour7, Integer hour8, Integer hour9, Integer hour10, Integer hour11,
                                 Integer hour12, Integer hour13, Integer hour14, Integer hour15, Integer hour16, Integer hour17,
                                 Integer hour18, Integer hour19, Integer hour20, Integer hour21, Integer hour22, Integer hour23, Integer hour24) {
        this.recordDate = recordDate;
        this.user = user;
        this.hour1 = hour1;
        this.hour2 = hour2;
        this.hour3 = hour3;
        this.hour4 = hour4;
        this.hour5 = hour5;
        this.hour6 = hour6;
        this.hour7 = hour7;
        this.hour8 = hour8;
        this.hour9 = hour9;
        this.hour10 = hour10;
        this.hour11 = hour11;
        this.hour12 = hour12;
        this.hour13 = hour13;
        this.hour14 = hour14;
        this.hour15 = hour15;
        this.hour16 = hour16;
        this.hour17 = hour17;
        this.hour18 = hour18;
        this.hour19 = hour19;
        this.hour20 = hour20;
        this.hour21 = hour21;
        this.hour22 = hour22;
        this.hour23 = hour23;
        this.hour24 = hour24;
    }

    // Розкоментований метод getId()
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public Integer getHour1() { return hour1; }
    public void setHour1(Integer hour1) { this.hour1 = hour1; }
    public Integer getHour2() { return hour2; }
    public void setHour2(Integer hour2) { this.hour2 = hour2; }
    public Integer getHour3() { return hour3; }
    public void setHour3(Integer hour3) { this.hour3 = hour3; }
    public Integer getHour4() { return hour4; }
    public void setHour4(Integer hour4) { this.hour4 = hour4; }
    public Integer getHour5() { return hour5; }
    public void setHour5(Integer hour5) { this.hour5 = hour5; }
    public Integer getHour6() { return hour6; }
    public void setHour6(Integer hour6) { this.hour6 = hour6; }
    public Integer getHour7() { return hour7; }
    public void setHour7(Integer hour7) { this.hour7 = hour7; }
    public Integer getHour8() { return hour8; }
    public void setHour8(Integer hour8) { this.hour8 = hour8; }
    public Integer getHour9() { return hour9; }
    public void setHour9(Integer hour9) { this.hour9 = hour9; }
    public Integer getHour10() { return hour10; }
    public void setHour10(Integer hour10) { this.hour10 = hour10; }
    public Integer getHour11() { return hour11; }
    public void setHour11(Integer hour11) { this.hour11 = hour11; }
    public Integer getHour12() { return hour12; }
    public void setHour12(Integer hour12) { this.hour12 = hour12; }
    public Integer getHour13() { return hour13; }
    public void setHour13(Integer hour13) { this.hour13 = hour13; }
    public Integer getHour14() { return hour14; }
    public void setHour14(Integer hour14) { this.hour14 = hour14; }
    public Integer getHour15() { return hour15; }
    public void setHour15(Integer hour15) { this.hour15 = hour15; }
    public Integer getHour16() { return hour16; }
    public void setHour16(Integer hour16) { this.hour16 = hour16; }
    public Integer getHour17() { return hour17; }
    public void setHour17(Integer hour17) { this.hour17 = hour17; }
    public Integer getHour18() { return hour18; }
    public void setHour18(Integer hour18) { this.hour18 = hour18; }
    public Integer getHour19() { return hour19; }
    public void setHour19(Integer hour19) { this.hour19 = hour19; }
    public Integer getHour20() { return hour20; }
    public void setHour20(Integer hour20) { this.hour20 = hour20; }
    public Integer getHour21() { return hour21; }
    public void setHour21(Integer hour21) { this.hour21 = hour21; }
    public Integer getHour22() { return hour22; }
    public void setHour22(Integer hour22) { this.hour22 = hour22; }
    public Integer getHour23() { return hour23; }
    public void setHour23(Integer hour23) { this.hour23 = hour23; }
    public Integer getHour24() { return hour24; }
    public void setHour24(Integer hour24) { this.hour24 = hour24; }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
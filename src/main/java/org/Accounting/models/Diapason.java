package org.Accounting.models;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "diapason")
public class Diapason {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
@JsonIgnore
private User user;

private LocalDate salesDate;

private LocalTime startTime;

private LocalTime endTime;

private Integer salePercentage;

private Integer reservePercentage;

private Integer amountEnergySpent;

    public Integer getAmountEnergySpent() {
        return amountEnergySpent;
    }

    public void setAmountEnergySpent(Integer amountEnergySpent) {
        this.amountEnergySpent = amountEnergySpent;
    }

    public Integer getReservePercentage() {
        return reservePercentage;
    }

    public void setReservePercentage(Integer reservePercentage) {
        this.reservePercentage = reservePercentage;
    }

    public void setSalePercentage(Integer salePercentage) {
        this.salePercentage = salePercentage;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSalePercentage() {
        return salePercentage;
    }

    public LocalDate getSalesDate() {
        return salesDate;
    }

    public void setSalesDate(LocalDate salesDate) {
        this.salesDate = salesDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

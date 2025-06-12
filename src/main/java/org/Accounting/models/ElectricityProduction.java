    package org.Accounting.models;
    import com.fasterxml.jackson.annotation.JsonIgnore;
    import jakarta.persistence.*;
    import java.time.LocalDate;
    import java.time.LocalTime;
    import com.fasterxml.jackson.annotation.JsonProperty;

    @Entity
    @Table(name = "electricity_production")
    public class ElectricityProduction {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "production_data")
        @JsonProperty("production_data")
        private LocalDate productionData;

        @Column(name = "production_value")
        @JsonProperty("production_value")
        private Integer productionValue;

        @Column(name = "measurement_time")
        @JsonProperty("measurement_time")
        private LocalTime measurementTime;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
        @JsonIgnore
        private User user;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public LocalDate getProductionData() {
            return productionData;
        }

        public void setProductionData(LocalDate productionData) {
            this.productionData = productionData;
        }

        public Integer getProductionValue() {
            return productionValue;
        }

        public void setProductionValue(Integer productionValue) {
            this.productionValue = productionValue;
        }

        public LocalTime getMeasurementTime() {
            return measurementTime;
        }

        public void setMeasurementTime(LocalTime measurementTime) {
            this.measurementTime = measurementTime;
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }

        public ElectricityProduction() {}

        public ElectricityProduction(LocalDate productionData, Integer productionValue, LocalTime measurementTime, User user) {
            this.productionData = productionData;
            this.productionValue = productionValue;
            this.measurementTime = measurementTime;
            this.user = user;
        }
    }
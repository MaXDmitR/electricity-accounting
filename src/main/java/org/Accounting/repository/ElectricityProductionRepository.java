package org.Accounting.repository;

import org.Accounting.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ElectricityProductionRepository extends JpaRepository<org.Accounting.models.ElectricityProduction,Long> {
    List<org.Accounting.models.ElectricityProduction> findByUser(User loggedInUser);
    boolean existsByProductionDataAndMeasurementTimeAndUser(LocalDate productionData, LocalTime measurementTime, User user);
    boolean existsByProductionDataAndUser(LocalDate productionData, User user);

}

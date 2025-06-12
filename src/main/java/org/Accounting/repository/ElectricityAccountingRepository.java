package org.Accounting.repository;

import org.Accounting.models.ElectricityAccounting;
import org.Accounting.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ElectricityAccountingRepository extends JpaRepository<ElectricityAccounting, Long> {

    Optional<ElectricityAccounting> findByRecordDate(LocalDate recordDate);
    List<ElectricityAccounting> findByUser(User user);
    Optional<ElectricityAccounting> findByRecordDateAndUser(LocalDate recordDate, User user);
}

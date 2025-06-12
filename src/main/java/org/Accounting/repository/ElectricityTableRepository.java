package org.Accounting.repository;

import org.Accounting.models.ElectricityTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ElectricityTableRepository extends JpaRepository<ElectricityTable,Long> {
    Optional<ElectricityTable> findByRecordDate(LocalDate recordDate);
}


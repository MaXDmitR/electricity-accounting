package org.Accounting.repository;

import org.Accounting.models.Diapason;
import org.Accounting.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiapasonRepository extends JpaRepository<Diapason, Long> {
    List<Diapason> findByUser(User loggedInUser);

    Optional<Object> findBySalesDateAndStartTimeAndEndTimeAndUser(LocalDate salesDate, LocalTime startTime, LocalTime endTime, User loggedInUser);

    List<Diapason> findBySalesDateAndUser(LocalDate date, User loggedInUser);
}

package com.university.smartcampus.booking;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.university.smartcampus.AppEnums.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BookingRepository extends JpaRepository<BookingEntity, UUID>, JpaSpecificationExecutor<BookingEntity> {

    boolean existsByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
        UUID resourceId,
        List<BookingStatus> statuses,
        Instant endTime,
        Instant startTime
    );

    boolean existsByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
        UUID resourceId,
        List<BookingStatus> statuses,
        Instant endTime,
        Instant startTime,
        UUID id
    );

    List<BookingEntity> findAllByRequesterIdOrderByStartTimeDesc(UUID requesterId);

    List<BookingEntity> findAllByOrderByStartTimeDesc();

}

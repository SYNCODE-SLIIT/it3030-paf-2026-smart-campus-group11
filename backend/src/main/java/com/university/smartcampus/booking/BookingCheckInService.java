package com.university.smartcampus.booking;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.university.smartcampus.AppEnums.BookingStatus;
import com.university.smartcampus.AppEnums.CheckInStatus;
import com.university.smartcampus.AppEnums.ResourceCategory;
import com.university.smartcampus.audit.AuditEnums.AuditDomain;
import com.university.smartcampus.audit.AuditEventService;
import com.university.smartcampus.common.exception.BadRequestException;
import com.university.smartcampus.common.exception.ForbiddenException;
import com.university.smartcampus.common.exception.NotFoundException;
import com.university.smartcampus.notification.NotificationService;
import com.university.smartcampus.user.entity.UserEntity;

@Service
public class BookingCheckInService {

    private final BookingRepository bookingRepository;
    private final BookingValidator bookingValidator;
    private final BookingResourceAvailabilityService bookingResourceAvailabilityService;
    private final NotificationService notificationService;
    private final AuditEventService auditEventService;

    public BookingCheckInService(
        BookingRepository bookingRepository,
        BookingValidator bookingValidator,
        BookingResourceAvailabilityService bookingResourceAvailabilityService,
        NotificationService notificationService,
        AuditEventService auditEventService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingValidator = bookingValidator;
        this.bookingResourceAvailabilityService = bookingResourceAvailabilityService;
        this.notificationService = notificationService;
        this.auditEventService = auditEventService;
    }

    @Transactional
    public BookingDtos.CheckInResponse checkInBooking(UserEntity user, UUID bookingId) {
        Objects.requireNonNull(user, "User is required.");
        Objects.requireNonNull(bookingId, "Booking ID is required.");

        BookingEntity booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking not found."));

        // Only resource owner/manager or requester can check in
        if (!booking.getRequester().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot check in this booking.");
        }

        requireSpaceBooking(booking);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be checked in.");
        }

        bookingResourceAvailabilityService.ensureResourceAvailableForProgression(booking);

        Instant now = bookingValidator.currentInstant();
        if (now.isBefore(booking.getStartTime())) {
            throw new BadRequestException("Booking has not started yet. Check-in is only available during booking time.");
        }

        booking.setCheckInStatus(CheckInStatus.CHECKED_IN);
        booking.setCheckedInAt(now);
        booking.setStatus(BookingStatus.CHECKED_IN);

        BookingEntity saved = bookingRepository.save(booking);
        auditEventService.record(
            AuditDomain.BOOKING,
            "BOOKING_CHECKED_IN",
            "Booking Checked In",
            user,
            saved.getRequester(),
            "BOOKING",
            saved.getId(),
            bookingAuditLabel(saved),
            bookingAuditDetails(saved)
        );
        return new BookingDtos.CheckInResponse(
            saved.getId(),
            saved.getCheckInStatus(),
            saved.getCheckedInAt()
        );
    }

    @Transactional
    public BookingDtos.CheckInResponse markNoShow(UUID bookingId) {
        return markNoShow(bookingId, null);
    }

    @Transactional
    public BookingDtos.CheckInResponse markNoShow(UUID bookingId, UserEntity actor) {
        Objects.requireNonNull(bookingId, "Booking ID is required.");

        BookingEntity booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking not found."));

        requireSpaceBooking(booking);

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new BadRequestException("Only approved or checked-in bookings can be marked as no-show.");
        }

        Instant now = bookingValidator.currentInstant();
        if (now.isBefore(booking.getEndTime())) {
            throw new BadRequestException("Booking time has not ended yet.");
        }

        booking.setCheckInStatus(CheckInStatus.NO_SHOW);
        booking.setStatus(BookingStatus.NO_SHOW);

        BookingEntity saved = bookingRepository.save(booking);
        if (actor == null) {
            auditEventService.recordSystem(
                AuditDomain.BOOKING,
                "BOOKING_NO_SHOW",
                "Booking No Show",
                saved.getRequester(),
                "BOOKING",
                saved.getId(),
                bookingAuditLabel(saved),
                bookingAuditDetails(saved)
            );
        } else {
            auditEventService.record(
                AuditDomain.BOOKING,
                "BOOKING_NO_SHOW",
                "Booking No Show",
                actor,
                saved.getRequester(),
                "BOOKING",
                saved.getId(),
                bookingAuditLabel(saved),
                bookingAuditDetails(saved)
            );
        }
        notificationService.notifyBookingNoShow(saved);
        return new BookingDtos.CheckInResponse(
            saved.getId(),
            saved.getCheckInStatus(),
            saved.getCheckedInAt()
        );
    }

    @Transactional
    public BookingDtos.CheckInResponse completeBooking(UUID bookingId) {
        return completeBooking(bookingId, null);
    }

    @Transactional
    public BookingDtos.CheckInResponse completeBooking(UUID bookingId, UserEntity actor) {
        Objects.requireNonNull(bookingId, "Booking ID is required.");

        BookingEntity booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking not found."));

        requireSpaceBooking(booking);

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new BadRequestException("Only checked-in bookings can be completed.");
        }

        Instant now = bookingValidator.currentInstant();
        if (now.isBefore(booking.getEndTime())) {
            throw new BadRequestException("Booking time has not ended yet. Wait until booking end time to complete.");
        }

        booking.setStatus(BookingStatus.COMPLETED);

        BookingEntity saved = bookingRepository.save(booking);
        if (actor == null) {
            auditEventService.recordSystem(
                AuditDomain.BOOKING,
                "BOOKING_COMPLETED",
                "Booking Completed",
                saved.getRequester(),
                "BOOKING",
                saved.getId(),
                bookingAuditLabel(saved),
                bookingAuditDetails(saved)
            );
        } else {
            auditEventService.record(
                AuditDomain.BOOKING,
                "BOOKING_COMPLETED",
                "Booking Completed",
                actor,
                saved.getRequester(),
                "BOOKING",
                saved.getId(),
                bookingAuditLabel(saved),
                bookingAuditDetails(saved)
            );
        }
        notificationService.notifyBookingCompleted(saved);
        return new BookingDtos.CheckInResponse(
            saved.getId(),
            saved.getCheckInStatus(),
            saved.getCheckedInAt()
        );
    }

    @Transactional(readOnly = true)
    public BookingDtos.CheckInResponse getCheckInStatus(UUID bookingId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking not found."));

        return new BookingDtos.CheckInResponse(
            booking.getId(),
            booking.getCheckInStatus(),
            booking.getCheckedInAt()
        );
    }

    @Transactional
    public void reconcileEndedSpaceBookings() {
        Instant now = bookingValidator.currentInstant();
        autoMarkEndedApprovedSpaceBookingsAsNoShow(now);
        autoCompleteEndedCheckedInSpaceBookings(now);
    }

    private void autoMarkEndedApprovedSpaceBookingsAsNoShow(Instant now) {
        List<BookingEntity> bookings = bookingRepository.findAllByStatusAndEndTimeLessThanEqualOrderByEndTimeAsc(
            BookingStatus.APPROVED,
            now
        );
        for (BookingEntity booking : bookings) {
            if (!isEligibleForAutoNoShow(booking, now)) {
                continue;
            }

            booking.setCheckInStatus(CheckInStatus.NO_SHOW);
            booking.setStatus(BookingStatus.NO_SHOW);

            BookingEntity saved = bookingRepository.save(booking);
            auditEventService.recordSystem(
                AuditDomain.BOOKING,
                "BOOKING_NO_SHOW",
                "Booking No Show",
                saved.getRequester(),
                "BOOKING",
                saved.getId(),
                bookingAuditLabel(saved),
                bookingAuditDetails(saved)
            );
            notificationService.notifyBookingNoShow(saved);
        }
    }

    private void autoCompleteEndedCheckedInSpaceBookings(Instant now) {
        List<BookingEntity> bookings = bookingRepository.findAllByStatusAndEndTimeLessThanEqualOrderByEndTimeAsc(
            BookingStatus.CHECKED_IN,
            now
        );
        for (BookingEntity booking : bookings) {
            if (!isEligibleForAutoCompletion(booking, now)) {
                continue;
            }

            booking.setStatus(BookingStatus.COMPLETED);

            BookingEntity saved = bookingRepository.save(booking);
            auditEventService.recordSystem(
                AuditDomain.BOOKING,
                "BOOKING_COMPLETED",
                "Booking Completed",
                saved.getRequester(),
                "BOOKING",
                saved.getId(),
                bookingAuditLabel(saved),
                bookingAuditDetails(saved)
            );
            notificationService.notifyBookingCompleted(saved);
        }
    }

    private void requireSpaceBooking(BookingEntity booking) {
        if (booking.getResource() == null || booking.getResource().getCategory() != ResourceCategory.SPACES) {
            throw new BadRequestException("Check-in is only available for space bookings.");
        }
    }

    private boolean isEligibleForAutoNoShow(BookingEntity booking, Instant now) {
        return booking != null
            && booking.getStatus() == BookingStatus.APPROVED
            && booking.getEndTime() != null
            && !booking.getEndTime().isAfter(now)
            && booking.getResource() != null
            && booking.getResource().getCategory() == ResourceCategory.SPACES;
    }

    private boolean isEligibleForAutoCompletion(BookingEntity booking, Instant now) {
        return booking != null
            && booking.getStatus() == BookingStatus.CHECKED_IN
            && booking.getEndTime() != null
            && !booking.getEndTime().isAfter(now)
            && booking.getResource() != null
            && booking.getResource().getCategory() == ResourceCategory.SPACES;
    }

    private String bookingAuditLabel(BookingEntity booking) {
        String resourceCode = booking.getResource() == null ? "Unknown resource" : booking.getResource().getCode();
        return resourceCode + " @ " + booking.getStartTime();
    }

    private Map<String, Object> bookingAuditDetails(BookingEntity booking) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("resourceId", booking.getResource() == null ? null : booking.getResource().getId());
        details.put("resourceCode", booking.getResource() == null ? null : booking.getResource().getCode());
        details.put("requesterId", booking.getRequester() == null ? null : booking.getRequester().getId());
        details.put("status", booking.getStatus() == null ? null : booking.getStatus().name());
        details.put("checkInStatus", booking.getCheckInStatus() == null ? null : booking.getCheckInStatus().name());
        details.put("startTime", booking.getStartTime());
        details.put("endTime", booking.getEndTime());
        return details;
    }
}

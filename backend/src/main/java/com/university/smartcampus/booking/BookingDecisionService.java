package com.university.smartcampus.booking;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

import com.university.smartcampus.AppEnums.BookingStatus;
import com.university.smartcampus.audit.AuditEnums.AuditDomain;
import com.university.smartcampus.audit.AuditEventService;
import com.university.smartcampus.booking.BookingDtos.BookingDecisionRequest;
import com.university.smartcampus.booking.BookingDtos.CancelBookingRequest;
import com.university.smartcampus.booking.BookingDtos.BookingResponse;
import com.university.smartcampus.common.exception.BadRequestException;
import com.university.smartcampus.notification.NotificationService;
import com.university.smartcampus.user.entity.UserEntity;

@Service
public class BookingDecisionService {

    private final BookingRepository bookingRepository;
    private final BookingValidator bookingValidator;
    private final BookingService bookingService;
    private final NotificationService notificationService;
    private final BookingResourceAvailabilityService bookingResourceAvailabilityService;
    private final AuditEventService auditEventService;

    public BookingDecisionService(
        BookingRepository bookingRepository,
        BookingValidator bookingValidator,
        BookingService bookingService,
        NotificationService notificationService,
        BookingResourceAvailabilityService bookingResourceAvailabilityService,
        AuditEventService auditEventService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingValidator = bookingValidator;
        this.bookingService = bookingService;
        this.notificationService = notificationService;
        this.bookingResourceAvailabilityService = bookingResourceAvailabilityService;
        this.auditEventService = auditEventService;
    }

    @Transactional
    public BookingResponse approveBooking(UUID bookingId, UserEntity approver) {
        Objects.requireNonNull(approver, "Approver is required.");
        BookingEntity booking = bookingService.requireBooking(bookingId);
        requirePending(booking);
        bookingResourceAvailabilityService.ensureResourceAvailableForProgression(booking);
        bookingValidator.ensureNoApprovedOverlap(
            booking.getResource().getId(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getId()
        );
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(approver);
        booking.setDecidedAt(bookingValidator.currentInstant());
        booking.setRejectionReason(null);
        BookingEntity saved = bookingRepository.save(booking);
        auditEventService.record(
            AuditDomain.BOOKING,
            "BOOKING_APPROVED",
            "Booking Approved",
            approver,
            saved.getRequester(),
            "BOOKING",
            saved.getId(),
            bookingAuditLabel(saved),
            bookingAuditDetails(saved, BookingStatus.PENDING)
        );
        notificationService.notifyBookingApproved(saved, approver);
        return bookingService.toResponse(saved);
    }

    @Transactional
    public BookingResponse rejectBooking(UUID bookingId, UserEntity approver, BookingDecisionRequest request) {
        Objects.requireNonNull(approver, "Approver is required.");
        BookingEntity booking = bookingService.requireBooking(bookingId);
        requirePending(booking);
        String reason = normalizeReason(request == null ? null : request.reason());
        if (!StringUtils.hasText(reason)) {
            throw new BadRequestException("A rejection reason is required.");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setApprovedBy(approver);
        booking.setDecidedAt(bookingValidator.currentInstant());
        booking.setRejectionReason(reason);
        BookingEntity saved = bookingRepository.save(booking);
        auditEventService.record(
            AuditDomain.BOOKING,
            "BOOKING_REJECTED",
            "Booking Rejected",
            approver,
            saved.getRequester(),
            "BOOKING",
            saved.getId(),
            bookingAuditLabel(saved),
            bookingAuditDetails(saved, BookingStatus.PENDING)
        );
        notificationService.notifyBookingRejected(saved, approver);
        return bookingService.toResponse(saved);
    }

    @Transactional
    public BookingResponse cancelApprovedBooking(UUID bookingId, UserEntity actor, CancelBookingRequest request) {
        BookingEntity booking = bookingService.requireBooking(bookingId);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be cancelled through this action.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(normalizeReason(request == null ? null : request.reason()));
        booking.setCancelledAt(bookingValidator.currentInstant());
        BookingEntity saved = bookingRepository.save(booking);
        auditEventService.record(
            AuditDomain.BOOKING,
            "BOOKING_CANCELLED_BY_STAFF",
            "Booking Cancelled By Staff",
            actor,
            saved.getRequester(),
            "BOOKING",
            saved.getId(),
            bookingAuditLabel(saved),
            bookingAuditDetails(saved, BookingStatus.APPROVED)
        );
        notificationService.notifyBookingCancelledByStaff(saved, actor);
        return bookingService.toResponse(saved);
    }

    private void requirePending(BookingEntity booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can transition to this state.");
        }
    }

    private String normalizeReason(String reason) {
        return StringUtils.hasText(reason) ? reason.trim() : null;
    }

    private String bookingAuditLabel(BookingEntity booking) {
        String resourceCode = booking.getResource() == null ? "Unknown resource" : booking.getResource().getCode();
        return resourceCode + " @ " + booking.getStartTime();
    }

    private Map<String, Object> bookingAuditDetails(BookingEntity booking, BookingStatus previousStatus) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("resourceId", booking.getResource() == null ? null : booking.getResource().getId());
        details.put("resourceCode", booking.getResource() == null ? null : booking.getResource().getCode());
        details.put("requesterId", booking.getRequester() == null ? null : booking.getRequester().getId());
        details.put("previousStatus", previousStatus == null ? null : previousStatus.name());
        details.put("status", booking.getStatus() == null ? null : booking.getStatus().name());
        details.put("startTime", booking.getStartTime());
        details.put("endTime", booking.getEndTime());
        details.put("rejectionReason", booking.getRejectionReason());
        details.put("cancellationReason", booking.getCancellationReason());
        return details;
    }
}

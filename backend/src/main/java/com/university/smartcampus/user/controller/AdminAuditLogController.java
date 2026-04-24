package com.university.smartcampus.user.controller;

import java.time.Instant;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.university.smartcampus.audit.AuditDtos.AuditEventPageResponse;
import com.university.smartcampus.audit.AuditEnums.AuditActorType;
import com.university.smartcampus.audit.AuditEnums.AuditDomain;
import com.university.smartcampus.audit.AuditEventService;
import com.university.smartcampus.audit.AuditEventService.AuditEventFilters;
import com.university.smartcampus.auth.service.CurrentUserService;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AdminAuditLogController {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final CurrentUserService currentUserService;
    private final AuditEventService auditEventService;

    public AdminAuditLogController(CurrentUserService currentUserService, AuditEventService auditEventService) {
        this.currentUserService = currentUserService;
        this.auditEventService = auditEventService;
    }

    @GetMapping
    public AuditEventPageResponse listAuditLogs(
            @RequestParam(required = false) AuditDomain domain,
            @RequestParam(required = false) String actionCode,
            @RequestParam(required = false) UUID actorUserId,
            @RequestParam(required = false) String actorEmail,
            @RequestParam(required = false) AuditActorType actorType,
            @RequestParam(required = false) UUID subjectUserId,
            @RequestParam(required = false) String subjectUserEmail,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        currentUserService.requireAdmin(authentication);
        return auditEventService.getRecentEvents(
            new AuditEventFilters(
                domain,
                actionCode,
                actorUserId,
                actorEmail,
                actorType,
                subjectUserId,
                subjectUserEmail,
                entityType,
                from,
                to
            ),
            safePage(page),
            safeSize(size)
        );
    }

    @GetMapping("/user/{userId}")
    public AuditEventPageResponse listAuditLogsForUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        currentUserService.requireAdmin(authentication);
        return auditEventService.getEventsForUser(userId, safePage(page), safeSize(size));
    }

    private int safePage(int page) {
        return Math.max(page, 0);
    }

    private int safeSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(size, MAX_PAGE_SIZE);
    }
}

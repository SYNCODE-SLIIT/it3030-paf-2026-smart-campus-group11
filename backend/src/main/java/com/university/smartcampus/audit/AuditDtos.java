package com.university.smartcampus.audit;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.university.smartcampus.audit.AuditEnums.AuditActorType;
import com.university.smartcampus.audit.AuditEnums.AuditDomain;

public final class AuditDtos {

    private AuditDtos() {
    }

    public record AuditEventResponse(
        UUID id,
        AuditDomain domain,
        String actionCode,
        String actionLabel,
        UUID actorUserId,
        String actorEmail,
        AuditActorType actorType,
        UUID subjectUserId,
        String subjectUserEmail,
        String entityType,
        UUID entityId,
        String entityLabel,
        String summary,
        String details,
        String requestMethod,
        String requestPath,
        String ipAddress,
        String userAgent,
        String requestId,
        Instant createdAt
    ) {
    }

    public record AuditEventPageResponse(
        List<AuditEventResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
    ) {
    }
}

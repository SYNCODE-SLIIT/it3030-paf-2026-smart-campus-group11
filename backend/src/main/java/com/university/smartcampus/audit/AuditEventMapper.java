package com.university.smartcampus.audit;

import org.springframework.stereotype.Component;

import com.university.smartcampus.audit.AuditDtos.AuditEventResponse;

@Component
public class AuditEventMapper {

    public AuditEventResponse toResponse(AuditEventEntity entity) {
        return new AuditEventResponse(
            entity.getId(),
            entity.getDomain(),
            entity.getActionCode(),
            entity.getActionLabel(),
            entity.getActorUserId(),
            entity.getActorEmailSnapshot(),
            entity.getActorTypeSnapshot(),
            entity.getSubjectUserId(),
            entity.getSubjectUserEmailSnapshot(),
            entity.getEntityType(),
            entity.getEntityId(),
            entity.getEntityLabel(),
            entity.getSummary(),
            entity.getDetailsJson(),
            entity.getRequestMethod(),
            entity.getRequestPath(),
            entity.getIpAddress(),
            entity.getUserAgent(),
            entity.getRequestId(),
            entity.getCreatedAt()
        );
    }
}

package com.university.smartcampus.audit;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.university.smartcampus.audit.AuditDtos.AuditEventPageResponse;
import com.university.smartcampus.audit.AuditEnums.AuditActorType;
import com.university.smartcampus.audit.AuditEnums.AuditDomain;
import com.university.smartcampus.common.enums.AppEnums.UserType;
import com.university.smartcampus.user.entity.UserEntity;

import tools.jackson.databind.ObjectMapper;

@Service
public class AuditEventService {

    public record AuditEventFilters(
        AuditDomain domain,
        String actionCode,
        UUID actorUserId,
        String actorEmail,
        AuditActorType actorType,
        UUID subjectUserId,
        String subjectUserEmail,
        String entityType,
        Instant from,
        Instant to
    ) {
    }

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_EMAIL_LENGTH = 255;
    private static final int MAX_ACTION_CODE_LENGTH = 120;
    private static final int MAX_ACTION_LABEL_LENGTH = 120;
    private static final int MAX_ENTITY_TYPE_LENGTH = 80;
    private static final int MAX_ENTITY_LABEL_LENGTH = 255;

    private final AuditEventRepository auditEventRepository;
    private final AuditEventMapper auditEventMapper;
    private final AuditRequestContextHolder requestContextHolder;
    private final ObjectMapper objectMapper;

    public AuditEventService(
        AuditEventRepository auditEventRepository,
        AuditEventMapper auditEventMapper,
        AuditRequestContextHolder requestContextHolder,
        ObjectMapper objectMapper
    ) {
        this.auditEventRepository = auditEventRepository;
        this.auditEventMapper = auditEventMapper;
        this.requestContextHolder = requestContextHolder;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void record(
        AuditDomain domain,
        String actionCode,
        String actionLabel,
        UserEntity actorUser,
        UserEntity subjectUser,
        String entityType,
        UUID entityId,
        String entityLabel,
        Map<String, Object> details
    ) {
        record(domain, actionCode, actionLabel, actorUser, null, null, subjectUser, null, entityType, entityId, entityLabel, null, details);
    }

    @Transactional
    public void recordAnonymous(
        AuditDomain domain,
        String actionCode,
        String actionLabel,
        UserEntity subjectUser,
        String entityType,
        UUID entityId,
        String entityLabel,
        Map<String, Object> details
    ) {
        record(domain, actionCode, actionLabel, null, null, null, subjectUser, null, entityType, entityId, entityLabel, null, details);
    }

    @Transactional
    public void recordAnonymous(
        AuditDomain domain,
        String actionCode,
        String actionLabel,
        String subjectUserEmail,
        String entityType,
        UUID entityId,
        String entityLabel,
        Map<String, Object> details
    ) {
        record(domain, actionCode, actionLabel, null, null, null, null, subjectUserEmail, entityType, entityId, entityLabel, null, details);
    }

    @Transactional
    public void recordSystem(
        AuditDomain domain,
        String actionCode,
        String actionLabel,
        UserEntity subjectUser,
        String entityType,
        UUID entityId,
        String entityLabel,
        Map<String, Object> details
    ) {
        record(domain, actionCode, actionLabel, null, AuditActorType.SYSTEM, "system", subjectUser, null, entityType, entityId, entityLabel, null, details);
    }

    @Transactional(readOnly = true)
    public AuditEventPageResponse getRecentEvents(AuditEventFilters filters, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), normalizeSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<AuditEventEntity> specification = (root, query, cb) -> cb.conjunction();

        if (filters != null) {
            if (filters.domain() != null) {
                specification = specification.and((root, query, cb) -> cb.equal(root.get("domain"), filters.domain()));
            }

            if (StringUtils.hasText(filters.actionCode())) {
                specification = specification.and((root, query, cb) ->
                    cb.equal(cb.upper(root.get("actionCode")), filters.actionCode().trim().toUpperCase(Locale.ROOT)));
            }

            if (filters.actorUserId() != null) {
                specification = specification.and((root, query, cb) -> cb.equal(root.get("actorUserId"), filters.actorUserId()));
            }

            if (StringUtils.hasText(filters.actorEmail())) {
                String normalizedActorEmail = "%" + filters.actorEmail().trim().toLowerCase(Locale.ROOT) + "%";
                specification = specification.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("actorEmailSnapshot")), normalizedActorEmail));
            }

            if (filters.actorType() != null) {
                specification = specification.and((root, query, cb) -> cb.equal(root.get("actorTypeSnapshot"), filters.actorType()));
            }

            if (filters.subjectUserId() != null) {
                specification = specification.and((root, query, cb) -> cb.equal(root.get("subjectUserId"), filters.subjectUserId()));
            }

            if (StringUtils.hasText(filters.subjectUserEmail())) {
                String normalizedSubjectEmail = "%" + filters.subjectUserEmail().trim().toLowerCase(Locale.ROOT) + "%";
                specification = specification.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("subjectUserEmailSnapshot")), normalizedSubjectEmail));
            }

            if (StringUtils.hasText(filters.entityType())) {
                specification = specification.and((root, query, cb) ->
                    cb.equal(cb.upper(root.get("entityType")), filters.entityType().trim().toUpperCase(Locale.ROOT)));
            }

            if (filters.from() != null) {
                specification = specification.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), filters.from()));
            }

            if (filters.to() != null) {
                specification = specification.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), filters.to()));
            }
        }

        Page<AuditEventEntity> events = auditEventRepository.findAll(specification, pageable);
        return toPageResponse(events);
    }

    @Transactional(readOnly = true)
    public AuditEventPageResponse getEventsForUser(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), normalizeSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<AuditEventEntity> specification = (root, query, cb) -> cb.or(
            cb.equal(root.get("subjectUserId"), userId),
            cb.equal(root.get("actorUserId"), userId)
        );
        return toPageResponse(auditEventRepository.findAll(specification, pageable));
    }

    private void record(
        AuditDomain domain,
        String actionCode,
        String actionLabel,
        UserEntity actorUser,
        AuditActorType actorTypeOverride,
        String actorEmailOverride,
        UserEntity subjectUser,
        String subjectEmailOverride,
        String entityType,
        UUID entityId,
        String entityLabel,
        String summary,
        Map<String, Object> details
    ) {
        AuditEventEntity entity = new AuditEventEntity();
        AuditRequestContext context = requestContextHolder.get();

        entity.setId(UUID.randomUUID());
        entity.setDomain(domain);
        entity.setActionCode(trimToLength(requiredText(actionCode, "Audit action code is required."), MAX_ACTION_CODE_LENGTH));
        entity.setActionLabel(trimToLength(resolveActionLabel(actionCode, actionLabel), MAX_ACTION_LABEL_LENGTH));
        entity.setActorUserId(actorUser == null ? null : actorUser.getId());
        entity.setActorEmailSnapshot(trimToLength(resolveActorEmail(actorUser, actorEmailOverride), MAX_EMAIL_LENGTH));
        entity.setActorTypeSnapshot(resolveActorType(actorUser, actorTypeOverride));
        entity.setSubjectUserId(subjectUser == null ? null : subjectUser.getId());
        entity.setSubjectUserEmailSnapshot(trimToLength(resolveSubjectEmail(subjectUser, subjectEmailOverride), MAX_EMAIL_LENGTH));
        entity.setEntityType(trimToLength(requiredText(entityType, "Audit entity type is required."), MAX_ENTITY_TYPE_LENGTH));
        entity.setEntityId(entityId);
        entity.setEntityLabel(trimToLength(normalizeText(entityLabel), MAX_ENTITY_LABEL_LENGTH));
        entity.setSummary(resolveSummary(summary, entity.getActionLabel(), entity.getEntityLabel()));
        entity.setDetailsJson(serializeDetails(details));
        entity.setRequestMethod(context == null ? null : context.requestMethod());
        entity.setRequestPath(context == null ? null : context.requestPath());
        entity.setIpAddress(context == null ? null : context.ipAddress());
        entity.setUserAgent(context == null ? null : context.userAgent());
        entity.setRequestId(context == null ? null : context.requestId());
        entity.setCreatedAt(Instant.now());

        auditEventRepository.save(entity);
    }

    private AuditEventPageResponse toPageResponse(Page<AuditEventEntity> page) {
        return new AuditEventPageResponse(
            page.getContent().stream().map(auditEventMapper::toResponse).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.hasNext()
        );
    }

    private String resolveActionLabel(String actionCode, String actionLabel) {
        if (StringUtils.hasText(actionLabel)) {
            return actionLabel.trim();
        }

        String[] parts = actionCode.trim().toLowerCase(Locale.ROOT).split("_");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) {
                builder.append(part.substring(1));
            }
        }
        return builder.toString();
    }

    private AuditActorType resolveActorType(UserEntity actorUser, AuditActorType actorTypeOverride) {
        if (actorTypeOverride != null) {
            return actorTypeOverride;
        }
        if (actorUser == null || actorUser.getUserType() == null) {
            return null;
        }
        return mapUserType(actorUser.getUserType());
    }

    private AuditActorType mapUserType(UserType userType) {
        return switch (userType) {
            case STUDENT -> AuditActorType.STUDENT;
            case FACULTY -> AuditActorType.FACULTY;
            case MANAGER -> AuditActorType.MANAGER;
            case ADMIN -> AuditActorType.ADMIN;
        };
    }

    private String resolveActorEmail(UserEntity actorUser, String actorEmailOverride) {
        if (StringUtils.hasText(actorEmailOverride)) {
            return actorEmailOverride.trim();
        }
        return actorUser == null ? null : normalizeText(actorUser.getEmail());
    }

    private String resolveSubjectEmail(UserEntity subjectUser, String subjectEmailOverride) {
        if (StringUtils.hasText(subjectEmailOverride)) {
            return subjectEmailOverride.trim();
        }
        return subjectUser == null ? null : normalizeText(subjectUser.getEmail());
    }

    private String resolveSummary(String summary, String actionLabel, String entityLabel) {
        if (StringUtils.hasText(summary)) {
            return summary.trim();
        }
        if (StringUtils.hasText(entityLabel)) {
            return actionLabel + ": " + entityLabel.trim();
        }
        return actionLabel;
    }

    private String serializeDetails(Map<String, Object> details) {
        if (details == null || details.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(details);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to serialize audit event details.", exception);
        }
    }

    private String normalizeText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String requiredText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String trimToLength(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private int normalizeSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, 100);
    }
}

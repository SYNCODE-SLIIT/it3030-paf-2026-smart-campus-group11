package com.university.smartcampus.audit;

import java.time.Instant;
import java.util.UUID;

import com.university.smartcampus.audit.AuditEnums.AuditActorType;
import com.university.smartcampus.audit.AuditEnums.AuditDomain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_events")
public class AuditEventEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AuditDomain domain;

    @Column(name = "action_code", nullable = false, length = 120)
    private String actionCode;

    @Column(name = "action_label", nullable = false, length = 120)
    private String actionLabel;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(name = "actor_email_snapshot", length = 255)
    private String actorEmailSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type_snapshot", length = 20)
    private AuditActorType actorTypeSnapshot;

    @Column(name = "subject_user_id")
    private UUID subjectUserId;

    @Column(name = "subject_user_email_snapshot", length = 255)
    private String subjectUserEmailSnapshot;

    @Column(name = "entity_type", nullable = false, length = 80)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "entity_label", length = 255)
    private String entityLabel;

    @Column(columnDefinition = "text")
    private String summary;

    @Column(name = "details_json", columnDefinition = "jsonb")
    private String detailsJson;

    @Column(name = "request_method", length = 12)
    private String requestMethod;

    @Column(name = "request_path", length = 500)
    private String requestPath;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 1000)
    private String userAgent;

    @Column(name = "request_id", length = 120)
    private String requestId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AuditDomain getDomain() {
        return domain;
    }

    public void setDomain(AuditDomain domain) {
        this.domain = domain;
    }

    public String getActionCode() {
        return actionCode;
    }

    public void setActionCode(String actionCode) {
        this.actionCode = actionCode;
    }

    public String getActionLabel() {
        return actionLabel;
    }

    public void setActionLabel(String actionLabel) {
        this.actionLabel = actionLabel;
    }

    public UUID getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(UUID actorUserId) {
        this.actorUserId = actorUserId;
    }

    public String getActorEmailSnapshot() {
        return actorEmailSnapshot;
    }

    public void setActorEmailSnapshot(String actorEmailSnapshot) {
        this.actorEmailSnapshot = actorEmailSnapshot;
    }

    public AuditActorType getActorTypeSnapshot() {
        return actorTypeSnapshot;
    }

    public void setActorTypeSnapshot(AuditActorType actorTypeSnapshot) {
        this.actorTypeSnapshot = actorTypeSnapshot;
    }

    public UUID getSubjectUserId() {
        return subjectUserId;
    }

    public void setSubjectUserId(UUID subjectUserId) {
        this.subjectUserId = subjectUserId;
    }

    public String getSubjectUserEmailSnapshot() {
        return subjectUserEmailSnapshot;
    }

    public void setSubjectUserEmailSnapshot(String subjectUserEmailSnapshot) {
        this.subjectUserEmailSnapshot = subjectUserEmailSnapshot;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public UUID getEntityId() {
        return entityId;
    }

    public void setEntityId(UUID entityId) {
        this.entityId = entityId;
    }

    public String getEntityLabel() {
        return entityLabel;
    }

    public void setEntityLabel(String entityLabel) {
        this.entityLabel = entityLabel;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDetailsJson() {
        return detailsJson;
    }

    public void setDetailsJson(String detailsJson) {
        this.detailsJson = detailsJson;
    }

    public String getRequestMethod() {
        return requestMethod;
    }

    public void setRequestMethod(String requestMethod) {
        this.requestMethod = requestMethod;
    }

    public String getRequestPath() {
        return requestPath;
    }

    public void setRequestPath(String requestPath) {
        this.requestPath = requestPath;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

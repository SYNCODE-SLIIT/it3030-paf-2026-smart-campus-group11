package com.university.smartcampus.audit;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditEventRepository extends JpaRepository<AuditEventEntity, UUID>, JpaSpecificationExecutor<AuditEventEntity> {

    List<AuditEventEntity> findByActorUserIdOrderByCreatedAtDesc(UUID actorUserId);

    List<AuditEventEntity> findBySubjectUserIdOrderByCreatedAtDesc(UUID subjectUserId);

    Page<AuditEventEntity> findBySubjectUserIdOrderByCreatedAtDesc(UUID subjectUserId, Pageable pageable);
}

package com.university.smartcampus.booking;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.university.smartcampus.AppEnums.ResourceStatus;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<ResourceEntity, UUID> {

    Optional<ResourceEntity> findByCodeIgnoreCase(String code);

    List<ResourceEntity> findByStatus(ResourceStatus status);
}

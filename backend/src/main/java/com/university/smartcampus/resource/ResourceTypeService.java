package com.university.smartcampus.resource;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.university.smartcampus.audit.AuditEnums.AuditDomain;
import com.university.smartcampus.audit.AuditEventService;
import com.university.smartcampus.common.dto.ApiDtos.MessageResponse;
import com.university.smartcampus.common.exception.BadRequestException;
import com.university.smartcampus.common.exception.ConflictException;
import com.university.smartcampus.common.exception.NotFoundException;
import com.university.smartcampus.resource.ResourceTypeDtos.CreateResourceTypeRequest;
import com.university.smartcampus.resource.ResourceTypeDtos.ResourceTypeResponse;
import com.university.smartcampus.resource.ResourceTypeDtos.UpdateResourceTypeRequest;
import com.university.smartcampus.user.entity.UserEntity;

@Service
public class ResourceTypeService {

    private final ResourceTypeRepository resourceTypeRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceTypeMapper resourceTypeMapper;
    private final AuditEventService auditEventService;

    public ResourceTypeService(
        ResourceTypeRepository resourceTypeRepository,
        ResourceRepository resourceRepository,
        ResourceTypeMapper resourceTypeMapper,
        AuditEventService auditEventService
    ) {
        this.resourceTypeRepository = resourceTypeRepository;
        this.resourceRepository = resourceRepository;
        this.resourceTypeMapper = resourceTypeMapper;
        this.auditEventService = auditEventService;
    }

    @Transactional(readOnly = true)
    public List<ResourceTypeResponse> getResourceTypes() {
        return resourceTypeRepository.findAllByOrderByNameAsc().stream()
            .map(resourceTypeMapper::toResponse)
            .toList();
    }

    @Transactional
    public ResourceTypeResponse createResourceType(CreateResourceTypeRequest request) {
        return createResourceType(request, null);
    }

    @Transactional
    public ResourceTypeResponse createResourceType(CreateResourceTypeRequest request, UserEntity actor) {
        String normalizedCode = normalizeRequiredCode(request.code());
        String normalizedName = normalizeRequiredName(request.name());
        ensureCodeAvailable(normalizedCode, null);
        ensureNameAvailable(normalizedName, null);

        ResourceType resourceType = resourceTypeMapper.toEntity(request);
        resourceType.setCode(normalizedCode);
        resourceType.setName(normalizedName);
        validateAndNormalizeRuleFlags(
            resourceType,
            request.capacityEnabled(),
            request.capacityRequired()
        );

        ResourceType saved = resourceTypeRepository.save(resourceType);
        auditEventService.record(
            AuditDomain.CATALOG,
            "RESOURCE_TYPE_CREATED",
            "Resource Type Created",
            actor,
            null,
            "RESOURCE_TYPE",
            saved.getId(),
            saved.getCode() + " - " + saved.getName(),
            java.util.Map.of(
                "code", saved.getCode(),
                "name", saved.getName(),
                "category", saved.getCategory() == null ? null : saved.getCategory().name()
            )
        );
        return resourceTypeMapper.toResponse(saved);
    }

    @Transactional
    public ResourceTypeResponse updateResourceType(UUID id, UpdateResourceTypeRequest request) {
        return updateResourceType(id, request, null);
    }

    @Transactional
    public ResourceTypeResponse updateResourceType(UUID id, UpdateResourceTypeRequest request, UserEntity actor) {
        ResourceType resourceType = getResourceType(id);
        String normalizedCode = null;
        String normalizedName = null;

        if (request.code() != null) {
            normalizedCode = normalizeRequiredCode(request.code());
            ensureCodeAvailable(normalizedCode, id);
        }
        if (request.name() != null) {
            normalizedName = normalizeRequiredName(request.name());
            ensureNameAvailable(normalizedName, id);
        }

        resourceTypeMapper.applyUpdate(resourceType, request);
        if (normalizedCode != null) {
            resourceType.setCode(normalizedCode);
        }
        if (normalizedName != null) {
            resourceType.setName(normalizedName);
        }
        validateAndNormalizeRuleFlags(
            resourceType,
            request.capacityEnabled(),
            request.capacityRequired()
        );

        auditEventService.record(
            AuditDomain.CATALOG,
            "RESOURCE_TYPE_UPDATED",
            "Resource Type Updated",
            actor,
            null,
            "RESOURCE_TYPE",
            resourceType.getId(),
            resourceType.getCode() + " - " + resourceType.getName(),
            java.util.Map.of(
                "code", resourceType.getCode(),
                "name", resourceType.getName(),
                "category", resourceType.getCategory() == null ? null : resourceType.getCategory().name()
            )
        );

        return resourceTypeMapper.toResponse(resourceType);
    }

    @Transactional
    public MessageResponse deleteResourceType(UUID id) {
        return deleteResourceType(id, null);
    }

    @Transactional
    public MessageResponse deleteResourceType(UUID id, UserEntity actor) {
        if (resourceRepository.existsByResourceType_Id(id)) {
            throw new ConflictException("This resource type is already assigned to one or more resources and cannot be removed.");
        }

        ResourceType resourceType = getResourceType(id);
        auditEventService.record(
            AuditDomain.CATALOG,
            "RESOURCE_TYPE_DELETED",
            "Resource Type Deleted",
            actor,
            null,
            "RESOURCE_TYPE",
            resourceType.getId(),
            resourceType.getCode() + " - " + resourceType.getName(),
            java.util.Map.of(
                "code", resourceType.getCode(),
                "name", resourceType.getName(),
                "category", resourceType.getCategory() == null ? null : resourceType.getCategory().name()
            )
        );
        resourceTypeRepository.delete(resourceType);
        return new MessageResponse("Resource type removed.");
    }

    private ResourceType getResourceType(UUID id) {
        return resourceTypeRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Resource type not found."));
    }

    private String normalizeRequiredCode(String code) {
        if (!StringUtils.hasText(code)) {
            throw new BadRequestException("Code is required.");
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeRequiredName(String name) {
        if (!StringUtils.hasText(name)) {
            throw new BadRequestException("Name is required.");
        }
        return name.trim();
    }

    private void ensureCodeAvailable(String code, UUID currentResourceTypeId) {
        boolean exists = currentResourceTypeId == null
            ? resourceTypeRepository.existsByCodeIgnoreCase(code)
            : resourceTypeRepository.existsByCodeIgnoreCaseAndIdNot(code, currentResourceTypeId);
        if (exists) {
            throw new ConflictException("A resource type with this code already exists.");
        }
    }

    private void ensureNameAvailable(String name, UUID currentResourceTypeId) {
        boolean exists = currentResourceTypeId == null
            ? resourceTypeRepository.existsByNameIgnoreCase(name)
            : resourceTypeRepository.existsByNameIgnoreCaseAndIdNot(name, currentResourceTypeId);
        if (exists) {
            throw new ConflictException("A resource type with this name already exists.");
        }
    }

    private void validateAndNormalizeRuleFlags(
        ResourceType resourceType,
        Boolean requestedCapacityEnabled,
        Boolean requestedCapacityRequired
    ) {
        if (requestedCapacityEnabled != null && !requestedCapacityEnabled && requestedCapacityRequired == null) {
            resourceType.setCapacityRequired(false);
        }

        if (!resourceType.isCapacityEnabled()) {
            if (Boolean.TRUE.equals(requestedCapacityRequired)) {
                throw new BadRequestException("Capacity is required only when capacity is enabled.");
            }
            resourceType.setCapacityRequired(false);
        }
    }
}

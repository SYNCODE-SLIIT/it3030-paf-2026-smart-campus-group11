package com.university.smartcampus.booking;

import java.util.UUID;

import com.university.smartcampus.AppEnums.ResourceCategory;
import com.university.smartcampus.AppEnums.ResourceStatus;

public final class ResourceDtos {

    private ResourceDtos() {
    }

    public record ResourceResponse(
        UUID id,
        String code,
        String name,
        ResourceCategory category,
        String subcategory,
        String location,
        Integer capacity,
        ResourceStatus status
    ) {
    }

    public record ResourceSummary(
        UUID id,
        String code,
        String name
    ) {
    }
}

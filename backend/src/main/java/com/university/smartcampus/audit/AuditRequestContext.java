package com.university.smartcampus.audit;

public record AuditRequestContext(
    String requestMethod,
    String requestPath,
    String ipAddress,
    String userAgent,
    String requestId
) {
}

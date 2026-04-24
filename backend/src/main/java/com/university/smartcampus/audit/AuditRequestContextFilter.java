package com.university.smartcampus.audit;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuditRequestContextFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final int MAX_PATH_LENGTH = 500;
    private static final int MAX_IP_LENGTH = 64;
    private static final int MAX_USER_AGENT_LENGTH = 1000;
    private static final int MAX_REQUEST_ID_LENGTH = 120;

    private final AuditRequestContextHolder requestContextHolder;

    public AuditRequestContextFilter(AuditRequestContextHolder requestContextHolder) {
        this.requestContextHolder = requestContextHolder;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String requestId = trimToLength(resolveRequestId(request), MAX_REQUEST_ID_LENGTH);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        AuditRequestContext context = new AuditRequestContext(
            trimToLength(request.getMethod(), 12),
            trimToLength(request.getRequestURI(), MAX_PATH_LENGTH),
            trimToLength(resolveClientIp(request), MAX_IP_LENGTH),
            trimToLength(request.getHeader("User-Agent"), MAX_USER_AGENT_LENGTH),
            requestId
        );

        requestContextHolder.set(context);
        try {
            filterChain.doFilter(request, response);
        } finally {
            requestContextHolder.clear();
        }
    }

    private String resolveRequestId(HttpServletRequest request) {
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId != null && !requestId.isBlank()) {
            return requestId.trim();
        }
        return UUID.randomUUID().toString();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] chain = forwardedFor.split(",");
            if (chain.length > 0 && !chain[0].isBlank()) {
                return chain[0].trim();
            }
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }

    private String trimToLength(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}

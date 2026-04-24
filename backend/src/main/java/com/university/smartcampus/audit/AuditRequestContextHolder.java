package com.university.smartcampus.audit;

import org.springframework.stereotype.Component;

@Component
public class AuditRequestContextHolder {

    private static final ThreadLocal<AuditRequestContext> CURRENT = new ThreadLocal<>();

    public void set(AuditRequestContext context) {
        CURRENT.set(context);
    }

    public AuditRequestContext get() {
        return CURRENT.get();
    }

    public void clear() {
        CURRENT.remove();
    }
}

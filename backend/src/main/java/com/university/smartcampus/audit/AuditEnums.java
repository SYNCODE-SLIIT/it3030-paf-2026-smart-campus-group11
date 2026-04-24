package com.university.smartcampus.audit;

public final class AuditEnums {

    private AuditEnums() {
    }

    public enum AuditDomain {
        AUTH,
        USER,
        BOOKING,
        TICKET,
        CATALOG,
        NOTIFICATION
    }

    public enum AuditActorType {
        STUDENT,
        FACULTY,
        MANAGER,
        ADMIN,
        SYSTEM
    }
}

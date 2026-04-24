create table if not exists public.audit_events (
    id uuid primary key,
    domain varchar(40) not null,
    action_code varchar(120) not null,
    action_label varchar(120) not null,
    actor_user_id uuid references public.users(id) on delete set null,
    actor_email_snapshot varchar(255),
    actor_type_snapshot varchar(20),
    subject_user_id uuid references public.users(id) on delete set null,
    subject_user_email_snapshot varchar(255),
    entity_type varchar(80) not null,
    entity_id uuid,
    entity_label varchar(255),
    summary text,
    details_json jsonb,
    request_method varchar(12),
    request_path varchar(500),
    ip_address varchar(64),
    user_agent varchar(1000),
    request_id varchar(120),
    created_at timestamptz not null,
    constraint chk_audit_events_domain check (
        domain in ('AUTH', 'USER', 'BOOKING', 'TICKET', 'CATALOG', 'NOTIFICATION')
    ),
    constraint chk_audit_events_actor_type check (
        actor_type_snapshot is null
        or actor_type_snapshot in ('STUDENT', 'FACULTY', 'MANAGER', 'ADMIN', 'SYSTEM')
    )
);

create index if not exists idx_audit_events_created_at_desc
    on public.audit_events (created_at desc);

create index if not exists idx_audit_events_domain_created_at_desc
    on public.audit_events (domain, created_at desc);

create index if not exists idx_audit_events_actor_created_at_desc
    on public.audit_events (actor_user_id, created_at desc);

create index if not exists idx_audit_events_subject_created_at_desc
    on public.audit_events (subject_user_id, created_at desc);

create index if not exists idx_audit_events_entity_created_at_desc
    on public.audit_events (entity_type, entity_id, created_at desc);

insert into public.audit_events (
    id,
    domain,
    action_code,
    action_label,
    actor_user_id,
    actor_email_snapshot,
    actor_type_snapshot,
    subject_user_id,
    subject_user_email_snapshot,
    entity_type,
    entity_id,
    entity_label,
    summary,
    details_json,
    request_method,
    request_path,
    ip_address,
    user_agent,
    request_id,
    created_at
)
select
    legacy.id,
    'USER',
    legacy.action::text,
    case legacy.action::text
        when 'USER_CREATED' then 'User Created'
        when 'USER_UPDATED' then 'User Updated'
        when 'USER_SUSPENDED' then 'User Suspended'
        when 'USER_ACTIVATED' then 'User Activated'
        when 'USER_DELETED' then 'User Deleted'
        when 'INVITE_RESENT' then 'Invite Resent'
        when 'MANAGER_ROLE_CHANGED' then 'Manager Role Changed'
        else replace(initcap(replace(legacy.action::text, '_', ' ')), '_', ' ')
    end,
    legacy.performed_by_id,
    legacy.performed_by_email,
    case when legacy.performed_by_email is not null then 'ADMIN' else null end,
    legacy.target_user_id,
    legacy.target_user_email,
    'USER',
    legacy.target_user_id,
    legacy.target_user_email,
    case legacy.action::text
        when 'USER_CREATED' then 'User Created: ' || legacy.target_user_email
        when 'USER_UPDATED' then 'User Updated: ' || legacy.target_user_email
        when 'USER_SUSPENDED' then 'User Suspended: ' || legacy.target_user_email
        when 'USER_ACTIVATED' then 'User Activated: ' || legacy.target_user_email
        when 'USER_DELETED' then 'User Deleted: ' || legacy.target_user_email
        when 'INVITE_RESENT' then 'Invite Resent: ' || legacy.target_user_email
        when 'MANAGER_ROLE_CHANGED' then 'Manager Role Changed: ' || legacy.target_user_email
        else legacy.target_user_email
    end,
    case
        when legacy.details is null or btrim(legacy.details) = '' then null
        else to_jsonb(legacy.details)
    end,
    null,
    null,
    null,
    null,
    null,
    legacy.created_at
from public.admin_audit_logs legacy
where not exists (
    select 1
    from public.audit_events existing
    where existing.id = legacy.id
);

import React from 'react';
import { Avatar, Card, Chip } from '@/components/ui';
import type { TicketResponse } from '@/lib/api-types';
import {
  CATEGORY_LABELS,
  PRIORITY_CHIP_COLOR,
  PRIORITY_LABELS,
  PRIORITY_STRIPE,
  STATUS_DISPLAY,
  STATUS_SEGS,
  getInitials,
  statusChipColor,
} from './ticketDetailHelpers';

interface StatusProgressCardProps {
  ticket: TicketResponse;
}

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  paddingTop: 10,
  borderTop: '1px solid var(--border)',
};

const ROW_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontWeight: 600,
  minWidth: 68,
};

export function StatusProgressCard({ ticket }: StatusProgressCardProps) {
  const segs = STATUS_SEGS[ticket.status];

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {/* Priority stripe */}
      <div style={{ height: 4, background: PRIORITY_STRIPE[ticket.priority] }} />

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Progress segments */}
        <div style={{ display: 'flex', gap: 4 }}>
          {segs.map((color, i) => (
            <div
              key={i}
              style={{ flex: 1, height: 5, borderRadius: 99, background: color, transition: 'background .3s' }}
            />
          ))}
        </div>

        {/* Status chip */}
        <Chip color={statusChipColor(ticket.status)} dot size="md">
          {STATUS_DISPLAY[ticket.status]}
        </Chip>

        {/* Assignee row */}
        <div style={ROW}>
          <span style={ROW_LABEL}>Assignee</span>
          {ticket.assignedToName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="xs" initials={getInitials(ticket.assignedToName)} />
              <span style={{ fontSize: 12, color: 'var(--text-body)', fontWeight: 500 }}>
                {ticket.assignedToName}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
          )}
        </div>

        {/* Category row */}
        <div style={ROW}>
          <span style={ROW_LABEL}>Category</span>
          <span style={{ fontSize: 12, color: 'var(--text-body)' }}>
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </span>
        </div>

        {/* Priority row */}
        <div style={ROW}>
          <span style={ROW_LABEL}>Priority</span>
          <Chip color={PRIORITY_CHIP_COLOR[ticket.priority]} size="sm">
            {PRIORITY_LABELS[ticket.priority]}
          </Chip>
        </div>
      </div>
    </Card>
  );
}

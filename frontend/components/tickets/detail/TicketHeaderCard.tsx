import React from 'react';
import { Card, Chip } from '@/components/ui';
import type { TicketResponse } from '@/lib/api-types';
import {
  CATEGORY_LABELS,
  PRIORITY_CHIP_COLOR,
  PRIORITY_LABELS,
  PRIORITY_STRIPE,
  statusChipColor,
} from './ticketDetailHelpers';

interface TicketHeaderCardProps {
  ticket: TicketResponse;
  actionSlot?: React.ReactNode;
  assignmentSlot?: React.ReactNode;
}

export function TicketHeaderCard({ ticket, actionSlot, assignmentSlot }: TicketHeaderCardProps) {
  const hasActions = actionSlot || assignmentSlot;

  return (
    <Card>
      {/* Priority stripe bleeds to card edges */}
      <div
        style={{
          height: 4,
          background: PRIORITY_STRIPE[ticket.priority],
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          margin: '-24px -24px 20px',
        }}
      />

      {/* Ticket code */}
      <p
        style={{
          margin: '0 0 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: '.32em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {ticket.ticketCode}
      </p>

      {/* Title */}
      <h1
        style={{
          margin: '0 0 14px',
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 900,
          lineHeight: 1.15,
          color: 'var(--text-h)',
        }}
      >
        {ticket.title}
      </h1>

      {/* Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: hasActions ? 18 : 0 }}>
        <Chip color={statusChipColor(ticket.status)} dot>
          {ticket.status.replace('_', ' ')}
        </Chip>
        <Chip color={PRIORITY_CHIP_COLOR[ticket.priority]}>
          {PRIORITY_LABELS[ticket.priority]}
        </Chip>
        <Chip color="neutral">
          {CATEGORY_LABELS[ticket.category] ?? ticket.category}
        </Chip>
      </div>

      {/* Actions row */}
      {hasActions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
          }}
        >
          {actionSlot}
          {assignmentSlot && (
            <div style={{ marginLeft: 'auto' }}>
              {assignmentSlot}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

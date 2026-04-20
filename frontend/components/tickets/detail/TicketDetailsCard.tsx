import React from 'react';
import { Alert, Card } from '@/components/ui';
import type { TicketResponse } from '@/lib/api-types';
import { formatDateTime } from './ticketDetailHelpers';

interface TicketDetailsCardProps {
  ticket: TicketResponse;
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontWeight: 600,
};

const VALUE_STYLE: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-body)',
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px 12px', alignItems: 'baseline' }}>
      <span style={LABEL_STYLE}>{label}</span>
      <span style={VALUE_STYLE}>{children}</span>
    </div>
  );
}

const SECTION_LABEL: React.CSSProperties = {
  margin: '0 0 14px',
  fontFamily: 'var(--font-display)',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-h)',
};

export function TicketDetailsCard({ ticket }: TicketDetailsCardProps) {
  return (
    <Card>
      <p style={SECTION_LABEL}>Details</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Row label="Reporter">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{ticket.reportedByEmail}</span>
        </Row>
        <Row label="Opened">{formatDateTime(ticket.createdAt)}</Row>
        <Row label="Last Updated">{formatDateTime(ticket.updatedAt)}</Row>
        {ticket.resolvedAt && <Row label="Resolved">{formatDateTime(ticket.resolvedAt)}</Row>}
        {ticket.closedAt && <Row label="Closed">{formatDateTime(ticket.closedAt)}</Row>}
        {ticket.contactNote && (
          <Row label="Contact Note">
            <em style={{ color: 'var(--text-body)' }}>{ticket.contactNote}</em>
          </Row>
        )}
      </div>

      {(ticket.resolutionNotes || ticket.rejectionReason) && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ticket.resolutionNotes && (
            <Alert variant="success" title="Resolution">{ticket.resolutionNotes}</Alert>
          )}
          {ticket.rejectionReason && (
            <Alert variant="error" title="Ticket Rejected">{ticket.rejectionReason}</Alert>
          )}
        </div>
      )}
    </Card>
  );
}

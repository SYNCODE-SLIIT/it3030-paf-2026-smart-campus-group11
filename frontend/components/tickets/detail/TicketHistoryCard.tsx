import React from 'react';
import { Card } from '@/components/ui';
import type { TicketStatusHistoryResponse } from '@/lib/api-types';
import { formatDateTime, statusChipColor } from './ticketDetailHelpers';

interface TicketHistoryCardProps {
  history: TicketStatusHistoryResponse[];
}

const LABEL: React.CSSProperties = {
  margin: '0 0 14px',
  fontFamily: 'var(--font-display)',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-h)',
};

const DOT_COLOR: Record<string, string> = {
  blue:    'var(--blue-400)',
  yellow:  'var(--yellow-400)',
  green:   'var(--green-400)',
  neutral: 'var(--neutral-400)',
  red:     'var(--red-400)',
};

export function TicketHistoryCard({ history }: TicketHistoryCardProps) {
  return (
    <Card>
      <p style={LABEL}>
        History
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
          {history.length}
        </span>
      </p>
      {history.length === 0 && (
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>No history available.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {history.map((entry, i) => (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '12px 0',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: DOT_COLOR[statusChipColor(entry.newStatus)],
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {entry.oldStatus && (
                  <>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {entry.oldStatus.replace('_', ' ')}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                  </>
                )}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-h)', fontWeight: 700 }}>
                  {entry.newStatus.replace('_', ' ')}
                </span>
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  by <span style={{ fontFamily: 'var(--font-mono)' }}>{entry.changedByEmail}</span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {formatDateTime(entry.changedAt)}</span>
              </div>
              {entry.note && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

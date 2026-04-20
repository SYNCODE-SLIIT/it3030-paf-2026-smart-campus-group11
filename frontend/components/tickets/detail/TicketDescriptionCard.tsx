import React from 'react';
import { Card } from '@/components/ui';

interface TicketDescriptionCardProps {
  description: string;
}

const LABEL: React.CSSProperties = {
  margin: '0 0 10px',
  fontFamily: 'var(--font-display)',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-h)',
};

export function TicketDescriptionCard({ description }: TicketDescriptionCardProps) {
  return (
    <Card>
      <p style={LABEL}>Description</p>
      <p style={{ margin: 0, color: 'var(--text-body)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {description}
      </p>
    </Card>
  );
}

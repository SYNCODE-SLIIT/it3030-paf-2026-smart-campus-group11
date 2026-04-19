'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/providers/AuthProvider';
import { Alert, Button, Card, Tabs } from '@/components/ui';
import { TicketCard } from '@/components/tickets';
import { getErrorMessage, listMyTickets } from '@/lib/api-client';
import type { TicketPriority, TicketStatus, TicketSummaryResponse } from '@/lib/api-types';

type NoticeState = {
  variant: 'error' | 'success' | 'warning' | 'info' | 'neutral';
  title: string;
  message: string;
} | null;

type MainTab = 'unassigned' | 'assigned' | 'in_progress' | 'done';
type QueueFilter = 'all' | 'mine';
type SortOrder = 'oldest' | 'newest';

const PRIORITY_ORDER: TicketPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  URGENT: 'var(--red-400)',
  HIGH: 'var(--orange-400)',
  MEDIUM: 'var(--blue-400)',
  LOW: 'var(--neutral-400)',
};

const DONE_STATUS_ORDER: TicketStatus[] = ['RESOLVED', 'CLOSED', 'REJECTED'];

const DONE_STATUS_LABELS: Partial<Record<TicketStatus, string>> = {
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

const DONE_STATUS_COLOR: Partial<Record<TicketStatus, string>> = {
  RESOLVED: 'var(--green-400)',
  CLOSED: 'var(--neutral-400)',
  REJECTED: 'var(--red-400)',
};

const DONE_STATUSES = new Set<TicketStatus>(['RESOLVED', 'CLOSED', 'REJECTED']);

function sortByDate(tickets: TicketSummaryResponse[], order: SortOrder): TicketSummaryResponse[] {
  return [...tickets].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return order === 'oldest' ? diff : -diff;
  });
}

interface SectionProps {
  label: string;
  color: string;
  tickets: TicketSummaryResponse[];
  onView: (code: string) => void;
}

function TicketSection({ label, color, tickets, onView }: SectionProps) {
  if (tickets.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: color, flexShrink: 0 }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-muted)',
            opacity: 0.55,
          }}
        >
          {tickets.length}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            showReporter
            onView={() => onView(ticket.ticketCode)}
          />
        ))}
      </div>
    </div>
  );
}

export function AdminTicketsScreen() {
  const { session, appUser } = useAuth();
  const router = useRouter();
  const accessToken = session?.access_token ?? null;

  const [tickets, setTickets] = React.useState<TicketSummaryResponse[]>([]);
  const [mainTab, setMainTab] = React.useState<MainTab>('unassigned');
  const [queueFilter, setQueueFilter] = React.useState<QueueFilter>('all');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('oldest');
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<NoticeState>(null);

  const reload = React.useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setLoadError('Your session is unavailable. Please sign in again.');
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const list = await listMyTickets(accessToken);
      setTickets(list);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'We could not load tickets.'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const queueFiltered = React.useMemo(() => {
    if (queueFilter === 'mine' && appUser) {
      return tickets.filter((t) => t.assignedToId === appUser.id);
    }
    return tickets;
  }, [tickets, queueFilter, appUser]);

  // Mutually exclusive tab groups
  const unassigned = React.useMemo(
    () => queueFiltered.filter((t) => t.assignedToId === null && t.status === 'OPEN'),
    [queueFiltered],
  );
  const assigned = React.useMemo(
    () => queueFiltered.filter((t) => t.assignedToId !== null && t.status === 'OPEN'),
    [queueFiltered],
  );
  const inProgress = React.useMemo(
    () => queueFiltered.filter((t) => t.status === 'IN_PROGRESS'),
    [queueFiltered],
  );
  const done = React.useMemo(
    () => queueFiltered.filter((t) => DONE_STATUSES.has(t.status)),
    [queueFiltered],
  );

  // Summary counts always based on all tickets (not queue filtered)
  const summaryUnassigned = tickets.filter((t) => t.assignedToId === null && t.status === 'OPEN').length;
  const summaryAssigned   = tickets.filter((t) => t.assignedToId !== null && t.status === 'OPEN').length;
  const summaryInProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const summaryDone       = tickets.filter((t) => DONE_STATUSES.has(t.status)).length;

  const handleView = React.useCallback(
    (code: string) => { router.push(`/admin/tickets/${code}`); },
    [router],
  );

  const currentCount =
    mainTab === 'unassigned' ? unassigned.length
    : mainTab === 'assigned' ? assigned.length
    : mainTab === 'in_progress' ? inProgress.length
    : done.length;

  const renderContent = () => {
    if (loading) {
      return (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
          Loading tickets…
        </p>
      );
    }

    if (mainTab === 'done') {
      const groups = DONE_STATUS_ORDER
        .map((status) => ({
          status,
          tickets: sortByDate(done.filter((t) => t.status === status), sortOrder),
        }))
        .filter((g) => g.tickets.length > 0);

      if (groups.length === 0) {
        return (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
            No completed tickets.
          </p>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {groups.map(({ status, tickets: t }) => (
            <TicketSection
              key={status}
              label={DONE_STATUS_LABELS[status] ?? status}
              color={DONE_STATUS_COLOR[status] ?? 'var(--border)'}
              tickets={t}
              onView={handleView}
            />
          ))}
        </div>
      );
    }

    const base = mainTab === 'unassigned' ? unassigned : mainTab === 'assigned' ? assigned : inProgress;
    const groups = PRIORITY_ORDER
      .map((priority) => ({
        priority,
        tickets: sortByDate(base.filter((t) => t.priority === priority), sortOrder),
      }))
      .filter((g) => g.tickets.length > 0);

    if (groups.length === 0) {
      const emptyMsg: Record<Exclude<MainTab, 'done'>, string> = {
        unassigned: queueFilter === 'mine' ? 'No unassigned tickets in your queue.' : 'No tickets awaiting assignment.',
        assigned:   queueFilter === 'mine' ? 'No tickets assigned to you.' : 'No tickets waiting for action.',
        in_progress: queueFilter === 'mine' ? 'No tickets in progress for you.' : 'No tickets currently in progress.',
      };
      return (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>
          {emptyMsg[mainTab as Exclude<MainTab, 'done'>]}
        </p>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {groups.map(({ priority, tickets: t }) => (
          <TicketSection
            key={priority}
            label={PRIORITY_LABELS[priority]}
            color={PRIORITY_COLOR[priority]}
            tickets={t}
            onView={handleView}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div>
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
          Admin Console
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 900,
            lineHeight: 1.1,
            color: 'var(--text-h)',
          }}
        >
          Ticket Management
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
          View all campus support tickets and assign them to ticket managers.
        </p>
      </div>

      {notice && (
        <Alert variant={notice.variant} title={notice.title} dismissible onDismiss={() => setNotice(null)}>
          {notice.message}
        </Alert>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {(
          [
            { label: 'Unassigned',   count: summaryUnassigned,  color: 'var(--orange-400)' },
            { label: 'Assigned',     count: summaryAssigned,    color: 'var(--blue-400)' },
            { label: 'In Progress',  count: summaryInProgress,  color: 'var(--yellow-500)' },
            { label: 'Done',         count: summaryDone,        color: 'var(--green-400)' },
          ] as const
        ).map(({ label, count, color }) => (
          <Card key={label}>
            <p
              style={{
                margin: '0 0 8px',
                color: 'var(--text-muted)',
                fontSize: 11,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {label}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 30,
                fontWeight: 800,
                color,
              }}
            >
              {count}
            </p>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Queue filter + main nav tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <Tabs
            variant="pill"
            tabs={[
              { label: 'All Tickets', value: 'all',  badge: tickets.length },
              { label: 'My Queue',    value: 'mine', badge: appUser ? tickets.filter((t) => t.assignedToId === appUser.id).length : 0 },
            ]}
            value={queueFilter}
            onChange={(v) => setQueueFilter(v as QueueFilter)}
          />
        </div>

        <Tabs
          variant="pill"
          tabs={[
            { label: 'Unassigned',  value: 'unassigned',  badge: unassigned.length },
            { label: 'Assigned',    value: 'assigned',    badge: assigned.length },
            { label: 'In Progress', value: 'in_progress', badge: inProgress.length },
            { label: 'Done',        value: 'done',        badge: done.length },
          ]}
          value={mainTab}
          onChange={(v) => { setMainTab(v as MainTab); }}
        />

        {loadError && (
          <Alert variant="error" title="Load failed">
            {loadError}
          </Alert>
        )}

        {/* Sort toggle — only shown when there are tickets to sort */}
        {!loading && currentCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSortOrder((s) => (s === 'oldest' ? 'newest' : 'oldest'))}
            >
              {sortOrder === 'oldest' ? '↑ Oldest first' : '↓ Newest first'}
            </Button>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}

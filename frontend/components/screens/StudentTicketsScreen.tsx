'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TicketPlus } from 'lucide-react';

import { useAuth } from '@/components/providers/AuthProvider';
import {
  Alert,
  Button,
  Card,
  Chip,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Textarea,
} from '@/components/ui';
import { createTicket, getErrorMessage, listMyTickets } from '@/lib/api-client';
import type { CreateTicketRequest, TicketCategory, TicketPriority, TicketStatus, TicketSummaryResponse } from '@/lib/api-types';

type NoticeState = {
  variant: 'error' | 'success' | 'warning' | 'info' | 'neutral';
  title: string;
  message: string;
} | null;

type StatusFilter = TicketStatus | 'ALL';

const INITIAL_FORM: CreateTicketRequest & { contactNote: string } = {
  title: '',
  description: '',
  category: '' as TicketCategory,
  priority: '' as TicketPriority,
  contactNote: '',
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  ELECTRICAL: 'Electrical',
  NETWORK: 'Network',
  EQUIPMENT: 'Equipment',
  FURNITURE: 'Furniture',
  CLEANLINESS: 'Cleanliness',
  FACILITY_DAMAGE: 'Facility Damage',
  ACCESS_SECURITY: 'Access / Security',
  OTHER: 'Other',
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

function statusChipColor(status: TicketStatus): 'blue' | 'yellow' | 'green' | 'neutral' | 'red' {
  switch (status) {
    case 'OPEN': return 'blue';
    case 'IN_PROGRESS': return 'yellow';
    case 'RESOLVED': return 'green';
    case 'CLOSED': return 'neutral';
    case 'REJECTED': return 'red';
  }
}

function priorityChipColor(priority: TicketPriority): 'neutral' | 'blue' | 'orange' | 'red' {
  switch (priority) {
    case 'LOW': return 'neutral';
    case 'MEDIUM': return 'blue';
    case 'HIGH': return 'orange';
    case 'URGENT': return 'red';
  }
}

function formatDate(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat('en-LK', { year: 'numeric', month: 'short', day: '2-digit' }).format(parsed);
}

export function StudentTicketsScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const accessToken = session?.access_token ?? null;

  const [tickets, setTickets] = React.useState<TicketSummaryResponse[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('ALL');
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<NoticeState>(null);
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [submitting, setSubmitting] = React.useState(false);

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
      setLoadError(getErrorMessage(error, 'We could not load your tickets.'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setNotice({ variant: 'error', title: 'Session unavailable', message: 'Please sign in again.' });
      return;
    }

    if (!form.category) {
      setNotice({ variant: 'warning', title: 'Category required', message: 'Select a category before submitting.' });
      return;
    }

    if (!form.priority) {
      setNotice({ variant: 'warning', title: 'Priority required', message: 'Select a priority before submitting.' });
      return;
    }

    setSubmitting(true);
    try {
      await createTicket(accessToken, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        contactNote: form.contactNote.trim() || undefined,
      });
      setForm(INITIAL_FORM);
      await reload();
      setNotice({ variant: 'success', title: 'Ticket submitted', message: 'Your support ticket has been created.' });
    } catch (error) {
      setNotice({ variant: 'error', title: 'Submission failed', message: getErrorMessage(error, 'Could not create this ticket.') });
    } finally {
      setSubmitting(false);
    }
  }

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;

  const tabCounts: Record<StatusFilter, number> = {
    ALL: tickets.length,
    OPEN: openCount,
    IN_PROGRESS: inProgressCount,
    RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
    CLOSED: tickets.filter((t) => t.status === 'CLOSED').length,
    REJECTED: tickets.filter((t) => t.status === 'REJECTED').length,
  };

  const filtered = statusFilter === 'ALL' ? tickets : tickets.filter((t) => t.status === statusFilter);

  const statusTabs = (
    [
      { label: 'All', value: 'ALL' },
      { label: 'Open', value: 'OPEN' },
      { label: 'In Progress', value: 'IN_PROGRESS' },
      { label: 'Resolved', value: 'RESOLVED' },
      { label: 'Closed', value: 'CLOSED' },
      { label: 'Rejected', value: 'REJECTED' },
    ] satisfies { label: string; value: StatusFilter }[]
  ).map((tab) => ({ ...tab, badge: tabCounts[tab.value] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          Student Workspace
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
          Support Tickets
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
          Report campus issues and track their resolution.
        </p>
      </div>

      {notice && (
        <Alert variant={notice.variant} title={notice.title} dismissible onDismiss={() => setNotice(null)}>
          {notice.message}
        </Alert>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <Card>
          <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Open
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text-h)' }}>
            {openCount}
          </p>
        </Card>
        <Card>
          <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            In Progress
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text-h)' }}>
            {inProgressCount}
          </p>
        </Card>
      </div>

      <Card>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
          <Input
            id="ticket-title"
            name="ticket-title"
            label="Title"
            placeholder="Brief summary of the issue"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <Textarea
            id="ticket-description"
            name="ticket-description"
            label="Description"
            placeholder="Describe the issue in detail — location, when it started, what you observed"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            resize="none"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select
              id="ticket-category"
              name="ticket-category"
              label="Category"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as TicketCategory }))}
              placeholder="Select category"
              options={(Object.entries(CATEGORY_LABELS) as [TicketCategory, string][]).map(([value, label]) => ({ value, label }))}
            />
            <Select
              id="ticket-priority"
              name="ticket-priority"
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TicketPriority }))}
              placeholder="Select priority"
              options={(Object.entries(PRIORITY_LABELS) as [TicketPriority, string][]).map(([value, label]) => ({ value, label }))}
            />
          </div>
          <Input
            id="ticket-contact"
            name="ticket-contact"
            label="Contact Note"
            placeholder="Best way to reach you (optional)"
            value={form.contactNote}
            onChange={(e) => setForm((prev) => ({ ...prev, contactNote: e.target.value }))}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={submitting} iconLeft={<TicketPlus size={14} />}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Tabs
          variant="pill"
          tabs={statusTabs}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
        />

        <Card>
          {loadError && (
            <Alert variant="error" title="Load failed" style={{ marginBottom: 16 }}>
              {loadError}
            </Alert>
          )}
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Priority</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Created</TableHeader>
                  <TableHeader style={{ width: 80 }}>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && filtered.length === 0 && (
                  <TableRow hoverable={false}>
                    <TableCell colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                      {statusFilter === 'ALL' ? 'No tickets yet. Submit your first one above.' : `No ${statusFilter.toLowerCase().replace('_', ' ')} tickets.`}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                        {ticket.ticketCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>{ticket.title}</span>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: 13 }}>{CATEGORY_LABELS[ticket.category]}</span>
                    </TableCell>
                    <TableCell>
                      <Chip color={priorityChipColor(ticket.priority)} dot>
                        {PRIORITY_LABELS[ticket.priority]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color={statusChipColor(ticket.status)} dot>
                        {ticket.status.replace('_', ' ')}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(ticket.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => { router.push(`/students/tickets/${ticket.id}`); }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

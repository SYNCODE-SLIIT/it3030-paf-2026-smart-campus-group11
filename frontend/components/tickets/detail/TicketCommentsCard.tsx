import React from 'react';
import { Alert, Button, Card, Textarea } from '@/components/ui';
import type { TicketCommentResponse } from '@/lib/api-types';
import { formatDateTime } from './ticketDetailHelpers';

interface TicketCommentsCardProps {
  comments: TicketCommentResponse[];
  canComment: boolean;
  commentLockReason?: string;
  commentText: string;
  commentSubmitting: boolean;
  onCommentChange: (text: string) => void;
  onCommentSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formIdPrefix: string;
}

const SECTION_LABEL: React.CSSProperties = {
  margin: '0 0 14px',
  fontFamily: 'var(--font-display)',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--text-h)',
};

export function TicketCommentsCard({
  comments,
  canComment,
  commentLockReason,
  commentText,
  commentSubmitting,
  onCommentChange,
  onCommentSubmit,
  formIdPrefix,
}: TicketCommentsCardProps) {
  return (
    <Card>
      <p style={SECTION_LABEL}>
        Comments
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
          {comments.length}
        </span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!canComment && commentLockReason && (
          <Alert variant="info" title="Comments locked">{commentLockReason}</Alert>
        )}

        {comments.length === 0 && canComment && (
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>No comments yet.</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {comment.userEmail}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(comment.createdAt)}</span>
              {comment.isEdited && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>(edited)</span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-body)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {comment.commentText}
            </p>
          </div>
        ))}

        {canComment && (
          <form
            onSubmit={onCommentSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: comments.length > 0 ? 4 : 0 }}
          >
            <Textarea
              id={`${formIdPrefix}-comment`}
              name={`${formIdPrefix}-comment`}
              label="Add a comment"
              placeholder="Write your comment here…"
              value={commentText}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={3}
              resize="none"
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" loading={commentSubmitting} size="sm">Add Comment</Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}

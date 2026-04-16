'use client';

import React from 'react';

import { Alert, Button, Card, Divider, GlassPill, Input } from '@/components/ui';

type AlertState = {
  variant: 'error' | 'success' | 'warning' | 'info' | 'neutral';
  title: string;
  message: string;
} | null;

interface LoginFormCardProps {
  alert: AlertState;
  isPasswordLoading: boolean;
  isGoogleLoading: boolean;
  authConfigured: boolean;
  onPasswordSubmit: (email: string, password: string) => void;
  onGoogleSignIn: () => void;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94
           M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
           m-6.72-1.07a3 3 0 1 1-4.24-4.24
           M1 1l22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoginFormCard({
  alert,
  isPasswordLoading,
  isGoogleLoading,
  authConfigured,
  onPasswordSubmit,
  onGoogleSignIn,
}: LoginFormCardProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onPasswordSubmit(email, password);
  }

  return (
    <Card hoverable>
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 0,
            color: 'var(--text-h)',
            margin: '0 0 8px',
            lineHeight: 1.15,
          }}
        >
          Welcome Back
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>
          Sign in to your Smart Campus dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {alert && (
          <Alert variant={alert.variant} title={alert.title}>
            {alert.message}
          </Alert>
        )}

        <Input
          id="login-email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@university.edu"
          autoComplete="email"
          required
          disabled={!authConfigured}
        />

        <div style={{ position: 'relative' }}>
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={!authConfigured}
            style={{ paddingRight: 44 }}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 13,
              bottom: 0,
              height: 46,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 0,
            }}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16 }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!authConfigured}
            loading={isPasswordLoading}
          >
            Sign In
          </Button>
          <a
            href="#"
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              transition: 'color .15s',
            }}
          >
            Forgot Password?
          </a>
        </div>
      </form>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Divider label="or" />
        <Button
          variant="subtle"
          size="lg"
          fullWidth
          disabled={!authConfigured}
          loading={isGoogleLoading}
          onClick={onGoogleSignIn}
        >
          Sign in with Google
        </Button>
      </div>

      {!authConfigured && (
        <GlassPill style={{ padding: '10px 12px', marginTop: 16 }}>
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-body)', margin: 0 }}>
            Auth is unavailable until the Supabase public keys are configured.
          </p>
        </GlassPill>
      )}
    </Card>
  );
}

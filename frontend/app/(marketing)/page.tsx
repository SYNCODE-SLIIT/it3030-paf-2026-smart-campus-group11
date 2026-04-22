import { ArrowRight, BellRing, Building2, CalendarDays, ShieldCheck, Wrench } from 'lucide-react';
import { redirect } from 'next/navigation';

import { ButtonLink } from '@/components/marketing/ButtonLink';
import { Reveal } from '@/components/marketing/Reveal';
import { Card, Chip } from '@/components/ui';
import { getUserHomePath, needsStudentOnboarding, STUDENT_ONBOARDING_PATH } from '@/lib/auth-routing';
import { getServerAuthState } from '@/lib/server-auth';

const platformHighlights = [
  {
    title: 'Resource Discovery',
    description: 'Browse lecture halls, labs, equipment, and campus assets from one searchable catalogue.',
    icon: Building2,
  },
  {
    title: 'Booking Requests',
    description: 'Request spaces and shared resources with clearer availability, ownership, and approval flow.',
    icon: CalendarDays,
  },
  {
    title: 'Maintenance Reporting',
    description: 'Capture issues quickly and route them to the right support teams without email chains.',
    icon: Wrench,
  },
  {
    title: 'Role-Based Management',
    description: 'Give students, staff, managers, and admins the right level of access with less friction.',
    icon: ShieldCheck,
  },
];

const audience = [
  {
    title: 'Students',
    description: 'Find study spaces, request resources, and follow service updates without jumping between systems.',
  },
  {
    title: 'Academic Staff',
    description: 'Coordinate rooms, teaching spaces, and operational requests with better visibility.',
  },
  {
    title: 'Managers',
    description: 'Oversee approvals, catalogue quality, and campus workflows from a shared operational view.',
  },
  {
    title: 'Administrators',
    description: 'Maintain standards, users, and system-wide operations from a single management platform.',
  },
];

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '0 clamp(20px, 2.4vw, 36px)' }}>
      {children}
    </section>
  );
}

export default async function HomePage() {
  const authState = await getServerAuthState();

  if (authState.appUser) {
    if (needsStudentOnboarding(authState.appUser)) {
      redirect(STUDENT_ONBOARDING_PATH);
    }

    redirect(getUserHomePath(authState.appUser));
  }

  return (
    <div style={{ display: 'grid', gap: 96, paddingBottom: 88 }}>
      <SectionShell>
        <div
          style={{
            display: 'grid',
            gap: 28,
            alignItems: 'center',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            minHeight: 'calc(100vh - 180px)',
          }}
        >
          <Reveal style={{ display: 'grid', gap: 22 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Chip color="glass" dot>University Operations</Chip>
              <Chip color="blue">Resource Visibility</Chip>
              <Chip color="yellow">Booking Coordination</Chip>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(42px, 8vw, 76px)',
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: '-0.06em',
                  color: 'var(--text-h)',
                  maxWidth: 760,
                }}
              >
                Smart Campus Management Platform
              </h1>
              <p
                style={{
                  maxWidth: 660,
                  fontSize: 17,
                  lineHeight: 1.8,
                  color: 'var(--text-body)',
                }}
              >
                Discover campus resources, request bookings, report maintenance issues, and manage operations through
                one connected university platform built for real campus workflows.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <ButtonLink href="/resources" size="lg" variant="glass" iconRight={<ArrowRight size={16} />}>
                Explore Resources
              </ButtonLink>
              <ButtonLink href="/login" size="lg" variant="subtle">
                Sign In
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Card
              hoverable
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'grid', gap: 20 }}>
                <div
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: 'linear-gradient(180deg, rgba(238,202,68,.18), rgba(238,202,68,.05))',
                    border: '1px solid rgba(238,202,68,.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <BellRing size={18} color="var(--yellow-400)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-label)' }}>
                      Campus Coordination
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-h)', letterSpacing: '-0.04em' }}>
                    Built for daily campus decisions.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    'Central catalogue for spaces, equipment, and facilities',
                    'Clear request flows for booking and operational support',
                    'Shared visibility for managers and administrators',
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 16,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--yellow-400)',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: 'var(--text-body)', lineHeight: 1.7 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell>
        <Reveal style={{ display: 'grid', gap: 18, marginBottom: 26 }}>
          <Chip color="glass">Platform Highlights</Chip>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--text-h)' }}>
            Key workflows, one connected platform
          </h2>
          <p style={{ maxWidth: 720, color: 'var(--text-body)', lineHeight: 1.8 }}>
            Smart Campus combines resource visibility, request handling, and operational oversight in a structure that
            feels familiar to university teams.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {platformHighlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.06}>
                <Card hoverable style={{ height: '100%' }}>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'rgba(238,202,68,.12)',
                        color: 'var(--yellow-400)',
                        border: '1px solid rgba(238,202,68,.16)',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: 'var(--text-h)' }}>
                        {item.title}
                      </h3>
                      <p style={{ color: 'var(--text-body)', lineHeight: 1.8 }}>{item.description}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell>
        <div
          style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            alignItems: 'start',
          }}
        >
          <Reveal style={{ display: 'grid', gap: 16 }}>
            <Chip color="blue">Who It Serves</Chip>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--text-h)' }}>
              Designed for the people who keep campus moving
            </h2>
            <p style={{ color: 'var(--text-body)', lineHeight: 1.8, maxWidth: 520 }}>
              From day-to-day student requests to administrative oversight, the platform is structured around the real
              roles involved in campus operations.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {audience.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.05}>
                <Card hoverable style={{ height: '100%' }}>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-h)' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'var(--text-body)', lineHeight: 1.8 }}>{item.description}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <Reveal>
          <Card
            variant="dark"
            style={{
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(14,13,11,.96), rgba(28,26,20,.98))',
            }}
          >
            <div style={{ display: 'grid', gap: 18 }}>
              <Chip color="glass">Get Started</Chip>
              <div style={{ display: 'grid', gap: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.05em', color: '#fff' }}>
                  Bring campus requests, resources, and operations into one workflow.
                </h2>
                <p style={{ maxWidth: 760, color: 'rgba(255,255,255,.68)', lineHeight: 1.8 }}>
                  Explore the platform structure, review its features, and sign in to continue into the operational
                  workspace.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <ButtonLink href="/features" variant="glass" size="lg">
                  View Features
                </ButtonLink>
                <ButtonLink href="/login" variant="subtle" size="lg">
                  Sign In
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Reveal>
      </SectionShell>
    </div>
  );
}

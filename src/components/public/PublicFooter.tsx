import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../config/app.config';

export const PublicFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-navy-main)',
        color: '#ffffff',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-8)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-10)',
        }}
      >
        {/* Top Section: Brand Info & 5 Link Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-8)',
          }}
        >
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '18px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                }}
              >
                C
              </div>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>
                {APP_CONFIG.name}<span style={{ color: '#38bdf8' }}>3</span>
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-neutral-400)', maxWidth: '320px', lineHeight: 1.5 }}>
              Production-grade multi-tenant shipping & multi-courier SaaS platform for B2B and B2C logistics operations.
            </p>
          </div>

          {/* Column 1: PRODUCT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h5 style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PRODUCT
            </h5>
            <Link to="/features" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Features</Link>
            <Link to="/integrations" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Integrations</Link>
            <Link to="/tracking" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Tracking</Link>
            <Link to="/pricing" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Pricing</Link>
          </div>

          {/* Column 2: SOLUTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h5 style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SOLUTIONS
            </h5>
            <Link to="/features" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>B2C Shipping</Link>
            <Link to="/features" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>B2B Freight</Link>
            <Link to="/features" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>White-Label Portal</Link>
          </div>

          {/* Column 3: COMPANY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h5 style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              COMPANY
            </h5>
            <Link to="/about" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>About</Link>
            <Link to="/contact" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Contact</Link>
          </div>

          {/* Column 4: RESOURCES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h5 style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RESOURCES
            </h5>
            <Link to="/faq" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>FAQ</Link>
            <Link to="/faq" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Documentation</Link>
          </div>

          {/* Column 5: LEGAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h5 style={{ fontSize: 'var(--font-size-caption)', fontWeight: 'var(--font-weight-semibold)', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LEGAL
            </h5>
            <Link to="/faq" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Privacy</Link>
            <Link to="/faq" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-neutral-400)' }}>Terms</Link>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-neutral-400)',
          }}
        >
          <span>&copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</span>
          <span>Multi-Tenant Logistics SaaS Platform.</span>
        </div>
      </div>
    </footer>
  );
};

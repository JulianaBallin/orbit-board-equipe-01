import type { ReactNode } from 'react';
import type { Tone } from '../utils/labels';

export function LoadingState({ message = 'Carregando informações...' }: { message?: string }) {
  return <div className="state-box loading"><span className="spinner" />{message}</div>;
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Não foi possível carregar os dados.', message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-box error" role="alert">
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      {onRetry && <button className="button secondary" onClick={onRetry}>Tentar novamente</button>}
    </div>
  );
}

interface NotFoundStateProps {
  title: string;
  message: string;
  onBack: () => void;
  backLabel: string;
}

export function NotFoundState({ title, message, onBack, backLabel }: NotFoundStateProps) {
  return (
    <div className="state-box empty" role="status">
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button type="button" className="button secondary" onClick={onBack}>{backLabel}</button>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-box empty">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Notice({ type = 'success', children, onClose }: {
  type?: Tone;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className={`notice ${type}`}>
      <span>{children}</span>
      {onClose && <button onClick={onClose} aria-label="Fechar">×</button>}
    </div>
  );
}

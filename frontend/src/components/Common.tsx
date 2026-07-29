import type { ReactNode } from 'react';
import type { Tone } from '../utils/labels';
import { BadgeRoot, NoticeRoot, Spinner, Stat, StateBox } from './Common.styles';

export function LoadingState({ message = 'Carregando informações...' }: { message?: string }) {
  return <StateBox className="state-box loading" $kind="loading"><Spinner />{message}</StateBox>;
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Não foi possível carregar os dados.', message, onRetry }: ErrorStateProps) {
  return (
    <StateBox className="state-box error" $kind="error" role="alert">
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      {onRetry && <button className="button secondary" onClick={onRetry}>Tentar novamente</button>}
    </StateBox>
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
    <StateBox className="state-box empty" $kind="empty" role="status">
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button type="button" className="button secondary" onClick={onBack}>{backLabel}</button>
    </StateBox>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <StateBox className="state-box empty" $kind="empty">
      <strong>{title}</strong>
      <p>{description}</p>
    </StateBox>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <Stat className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Stat>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <BadgeRoot className={`badge ${tone}`} $tone={tone}>{children}</BadgeRoot>;
}

export function Notice({ type = 'success', children, onClose }: {
  type?: Tone;
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <NoticeRoot className={`notice ${type}`} $tone={type}>
      <span>{children}</span>
      {onClose && <button onClick={onClose} aria-label="Fechar">×</button>}
    </NoticeRoot>
  );
}

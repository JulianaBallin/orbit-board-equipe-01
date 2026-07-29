import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import type { Dashboard, WorkItemStatus } from '../types/api';
import { Page } from './DashboardPage.styles';
import { Badge, ErrorState, LoadingState, StatCard } from '../components/Common';
import { priorityLabel, priorityTone, statusLabel, statusTone } from '../utils/labels';

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await api.dashboard());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data && !error) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <Page className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Acompanhamento</span>
          <h2>Visão geral</h2>
          <p>Indicadores consolidados da operação do workspace.</p>
        </div>
        <button className="button secondary" onClick={load}>Atualizar</button>
      </div>

      <div className="stats-grid">
        <StatCard label="Projetos" value={data.totalProjects} detail={`${data.activeProjects} ativos`} />
        <StatCard label="Tarefas" value={data.totalTasks} detail="em todos os projetos" />
        <StatCard label="Concluídas" value={data.completedTasks} detail="entregas finalizadas" />
        <StatCard label="Atrasadas" value={data.overdueTasks} detail="exigem atenção" />
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Distribuição</span>
              <h3>Tarefas por status</h3>
            </div>
          </div>
          <div className="status-bars">
            {Object.entries(data.tasksByStatus).map(([status, count]) => {
              const percentage = data.totalTasks ? (count / data.totalTasks) * 100 : 0;
              return (
                <div className="status-row" key={status}>
                  <div><span>{statusLabel(status as WorkItemStatus)}</span><strong>{count}</strong></div>
                  <div className="bar-track"><span style={{ width: `${percentage}%` }} /></div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Atividade recente</span>
              <h3>Últimas tarefas</h3>
            </div>
          </div>
          <div className="compact-list">
            {data.recentTasks.map((task) => (
              <div className="compact-item" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.projectName} · {task.assigneeName || 'Sem responsável'}</span>
                </div>
                <div className="badge-group">
                  <Badge tone={priorityTone(task.priority)}>{priorityLabel(task.priority)}</Badge>
                  <Badge tone={statusTone(task.status)}>{statusLabel(task.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </Page>
  );
}

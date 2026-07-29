import { Switcher } from './TaskViewSwitcher.styles';

export type TaskViewMode = 'board' | 'table';

interface TaskViewSwitcherProps {
  value: TaskViewMode;
  onChange: (value: TaskViewMode) => void;
}

export default function TaskViewSwitcher({ value, onChange }: TaskViewSwitcherProps) {
  return (
    <Switcher role="group" aria-label="Visualização das tarefas">
      <button
        type="button"
        className={`button small ${value === 'board' ? 'primary' : 'secondary'}`}
        onClick={() => onChange('board')}
        aria-pressed={value === 'board'}
      >
        Quadro
      </button>
      <button
        type="button"
        className={`button small ${value === 'table' ? 'primary' : 'secondary'}`}
        onClick={() => onChange('table')}
        aria-pressed={value === 'table'}
      >
        Tabela
      </button>
    </Switcher>
  );
}

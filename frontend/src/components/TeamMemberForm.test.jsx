import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamMemberForm from './TeamMemberForm';

const memberWithCustomRole = {
  id: 'member-1',
  name: 'Renata Vasconcelos',
  role: 'Data Scientist',
  email: 'renata.vasconcelos@example.com'
};

describe('TeamMemberForm', () => {
  it('preserves a role outside the preset list when editing', () => {
    render(<TeamMemberForm editing={memberWithCustomRole} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Cargo')).toHaveValue('Data Scientist');
    expect(screen.getByRole('option', { name: 'Data Scientist' })).toBeInTheDocument();
  });

  it('submits the original role when the field is left untouched', async () => {
    const onSubmit = vi.fn();
    render(<TeamMemberForm editing={memberWithCustomRole} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Renata Vasconcelos',
      role: 'Data Scientist',
      email: 'renata.vasconcelos@example.com'
    });
  });

  it('still offers the preset list for a member with a known role', () => {
    render(
      <TeamMemberForm
        editing={{ ...memberWithCustomRole, role: 'Tech Lead' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Cargo')).toHaveValue('Tech Lead');
    expect(screen.getByRole('option', { name: 'Backend Developer' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Scrum Master' })).toBeInTheDocument();
  });
});

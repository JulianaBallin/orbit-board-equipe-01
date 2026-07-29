import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import TeamMemberForm from './TeamMemberForm';
import { makeMember } from '../../test/fixtures';

const memberWithCustomRole = makeMember({
  id: 'member-1',
  name: 'Renata Vasconcelos',
  role: 'Data Scientist',
  email: 'renata.vasconcelos@example.com'
});

describe('TeamMemberForm', () => {
  it('preserves a role outside the preset list when editing', () => {
    renderWithTheme(<TeamMemberForm editing={memberWithCustomRole} onSubmit={vi.fn()} onCancel={vi.fn()} busy={false} />);

    expect(screen.getByLabelText('Cargo')).toHaveValue('Data Scientist');
    expect(screen.getByRole('option', { name: 'Data Scientist' })).toBeInTheDocument();
  });

  it('submits the original role when the field is left untouched', async () => {
    const onSubmit = vi.fn();
    renderWithTheme(<TeamMemberForm editing={memberWithCustomRole} onSubmit={onSubmit} onCancel={vi.fn()} busy={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Renata Vasconcelos',
      role: 'Data Scientist',
      email: 'renata.vasconcelos@example.com'
    });
  });

  it('still offers the preset list for a member with a known role', () => {
    renderWithTheme(
      <TeamMemberForm
        editing={{ ...memberWithCustomRole, role: 'Tech Lead' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        busy={false}
      />,
    );

    expect(screen.getByLabelText('Cargo')).toHaveValue('Tech Lead');
    expect(screen.getByRole('option', { name: 'Backend Developer' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Scrum Master' })).toBeInTheDocument();
  });
});

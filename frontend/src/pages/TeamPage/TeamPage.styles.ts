import styled from 'styled-components';

export const Page = styled.section`
  .team-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(280px, 1fr));
    gap: 16px;
  }

  .member-card {
    display: flex;
    padding: 20px;
    align-items: flex-start;
    gap: 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadow.surface};
  }

  .member-body {
    min-width: 0;
    flex: 1;
  }

  .member-card .card-actions {
    margin-top: 14px;
  }

  .avatar {
    display: grid;
    width: 58px;
    height: 58px;
    place-items: center;
    border-radius: 18px;
    color: ${({ theme }) => theme.colors.textInverse};
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.action}, ${({ theme }) => theme.colors.status.success.text});
    font-weight: 900;
  }

  .member-card h3 {
    margin: 0 0 5px;
  }

  .member-card strong,
  .member-card a {
    display: block;
    font-size: .82rem;
  }

  .member-card strong {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  .member-card a {
    margin-top: 6px;
    color: ${({ theme }) => theme.colors.action};
  }

  @media (max-width: 760px) {
    .team-grid {
      grid-template-columns: 1fr;
    }
  }
`;

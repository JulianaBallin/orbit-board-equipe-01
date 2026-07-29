import styled from 'styled-components';

export const Page = styled.section`
  .cards-list {
    display: grid;
    gap: 14px;
  }

  .project-card {
    padding: 20px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadow.surface};
  }

  .project-card h3 {
    margin: 14px 0 7px;
  }

  .project-card p {
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.5;
  }

  .card-topline,
  .project-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: .78rem;
  }

  .project-meta {
    margin: 18px 0 10px;
  }

  .progress-track {
    height: 8px;
    overflow: hidden;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.action}, ${({ theme }) => theme.colors.status.success.text});
  }

  .project-card .card-actions {
    margin-top: 15px;
  }
`;

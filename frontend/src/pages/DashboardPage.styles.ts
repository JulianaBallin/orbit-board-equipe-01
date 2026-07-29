import styled from 'styled-components';

export const Page = styled.section`
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: .8fr 1.2fr;
    gap: 18px;
  }

  .panel {
    padding: 22px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadow.surface};
  }

  .panel-header h3 {
    margin: 3px 0 18px;
  }

  .status-bars {
    display: grid;
    gap: 16px;
  }

  .status-row > div:first-child {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: .88rem;
  }

  .bar-track {
    height: 8px;
    overflow: hidden;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  .bar-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.action}, ${({ theme }) => theme.colors.status.success.text});
  }

  .compact-item strong,
  .compact-item span {
    display: block;
  }

  .compact-item > div:first-child span {
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: .78rem;
  }

  .badge-group {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  @media (max-width: 1100px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
`;

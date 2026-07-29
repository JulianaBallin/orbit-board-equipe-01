import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../theme/tokens';

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

export function renderWithTheme(
  element: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(element, { wrapper: Wrapper, ...options });
}

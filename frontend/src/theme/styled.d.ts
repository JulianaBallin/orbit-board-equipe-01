import 'styled-components';
import type { SemanticTheme } from './tokens';

declare module 'styled-components' {
  export interface DefaultTheme extends SemanticTheme {}
}

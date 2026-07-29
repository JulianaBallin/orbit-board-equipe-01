const palette = {
  white: '#ffffff',
  navy950: '#111b32',
  navy900: '#172033',
  navy800: '#223253',
  slate700: '#34405a',
  slate600: '#526078',
  slate500: '#67728a',
  slate400: '#78849b',
  slate300: '#b9c5d8',
  slate200: '#dce2ed',
  slate100: '#edf0f5',
  slate50: '#f7f9fc',
  indigo600: '#405cc8',
  indigo500: '#4e65dc',
  indigo100: '#e5ecff',
  green700: '#187b61',
  green100: '#def6ed',
  amber700: '#96691e',
  amber100: '#fff3d4',
  red700: '#b42f3a',
  red100: '#ffe4e6',
} as const;

export const primitives = {
  palette,
  radius: { small: '8px', medium: '12px', large: '16px', pill: '999px' },
  shadow: {
    surface: '0 9px 24px rgba(28, 45, 82, .06)',
    overlay: '0 20px 45px rgba(28, 45, 82, .22)',
  },
  motion: { fast: '150ms ease' },
} as const;

export interface SemanticTheme {
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    surfaceElevated: string;
    text: string;
    textMuted: string;
    textInverse: string;
    border: string;
    action: string;
    actionHover: string;
    focus: string;
    overlay: string;
    sidebar: string;
    sidebarSurface: string;
    sidebarText: string;
    status: Record<'neutral' | 'info' | 'warning' | 'success' | 'danger', {
      background: string;
      text: string;
    }>;
  };
  radius: typeof primitives.radius;
  shadow: typeof primitives.shadow;
  motion: typeof primitives.motion;
}

export const lightTheme: SemanticTheme = {
  colors: {
    background: '#f4f7fb',
    surface: palette.white,
    surfaceMuted: palette.slate50,
    surfaceElevated: palette.white,
    text: palette.navy900,
    textMuted: palette.slate500,
    textInverse: palette.white,
    border: '#e4e9f2',
    action: palette.indigo500,
    actionHover: palette.indigo600,
    focus: 'rgba(78, 101, 220, .28)',
    overlay: 'rgba(17, 27, 50, .45)',
    sidebar: palette.navy950,
    sidebarSurface: '#1a2742',
    sidebarText: '#b9c5df',
    status: {
      neutral: { background: palette.slate100, text: '#596477' },
      info: { background: palette.indigo100, text: palette.indigo600 },
      warning: { background: palette.amber100, text: palette.amber700 },
      success: { background: palette.green100, text: palette.green700 },
      danger: { background: palette.red100, text: palette.red700 },
    },
  },
  radius: primitives.radius,
  shadow: primitives.shadow,
  motion: primitives.motion,
};

export const darkTheme: SemanticTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#0b1220',
    surface: '#162033',
    surfaceMuted: '#1b273b',
    surfaceElevated: '#1f2c43',
    text: '#eef2fb',
    textMuted: '#a9b4c8',
    border: '#2b3950',
    sidebar: '#090f1c',
    sidebarSurface: '#121c2d',
    sidebarText: '#c2cbe0',
    status: {
      neutral: { background: '#2a3548', text: '#d4dbea' },
      info: { background: '#243969', text: '#afc1ff' },
      warning: { background: '#4b3d22', text: '#f3cf82' },
      success: { background: '#193f36', text: '#82d9bd' },
      danger: { background: '#4c2730', text: '#ffabb4' },
    },
  },
};

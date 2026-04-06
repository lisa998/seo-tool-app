export const chartColors = {
  primary: '#A48677',
  primaryHover: '#8F6E61',
  primaryActive: '#6F5C54',
  accent: '#F46C53',
  success: '#7E9D7A',
  warning: '#D89A52',
  danger: '#C96455',
  info: '#8E9BA8',
  surfaceSoft: '#F3E8E2',
  divider: '#CDC3BC',
  dividerSoft: '#D9D8D7',
  text: '#1F1918',
  textSecondary: '#6F5C54',
} as const;

export const chartPalette = [
  chartColors.primary,
  chartColors.accent,
  chartColors.success,
  chartColors.primaryHover,
  chartColors.warning,
  chartColors.info,
  chartColors.danger,
];

export const chartTitleStyle = {
  style: {
    color: chartColors.text,
    fontSize: '16px',
    fontWeight: '600',
  },
};

export const axisLabelStyle = {
  style: {
    color: chartColors.textSecondary,
    fontSize: '12px',
  },
};

export const axisTitleStyle = {
  style: {
    color: chartColors.textSecondary,
    fontSize: '12px',
    fontWeight: '500',
  },
};

export const chartLegendStyle = {
  color: chartColors.textSecondary,
  fontWeight: '500',
};

export const tooltipTheme = {
  backgroundColor: withOpacity(chartColors.surfaceSoft, 0.96),
  borderColor: chartColors.divider,
  shadow: false,
  style: {
    color: chartColors.text,
  },
};

const defaultBarSeriesTheme = {
  color: chartColors.primary,
  borderColor: withOpacity(chartColors.primaryActive, 0.85),
};

const barSeriesThemeByTitle: Record<string, { color: string; borderColor: string }> = {
  流量來源國家: {
    color: chartColors.success,
    borderColor: withOpacity(chartColors.success, 0.92),
  },
  'Top 關鍵字': {
    color: chartColors.warning,
    borderColor: withOpacity(chartColors.warning, 0.92),
  },
  '搜尋量趨勢（12 個月）': {
    color: chartColors.warning,
    borderColor: withOpacity(chartColors.warning, 0.92),
  },
};

export function getBarSeriesTheme(title: string) {
  return barSeriesThemeByTitle[title] ?? defaultBarSeriesTheme;
}

export function withOpacity(hex: string, opacity: number) {
  const normalized = hex.replace('#', '');
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  const red = parseInt(fullHex.slice(0, 2), 16);
  const green = parseInt(fullHex.slice(2, 4), 16);
  const blue = parseInt(fullHex.slice(4, 6), 16);
  const alpha = Math.max(0, Math.min(1, opacity));

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

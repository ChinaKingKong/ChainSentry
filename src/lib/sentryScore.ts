import type { Token } from '../types/token';

/** 将 A–D 风险档映射为 0–100 Sentry 分数（越高越稳） */
export function riskToSentryScore(risk: Token['risk_score']): number {
  switch (risk) {
    case 'A':
      return 92;
    case 'B':
      return 72;
    case 'C':
      return 48;
    case 'D':
      return 24;
    default:
      return 50;
  }
}

export function sentryScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-secondary';
  if (score >= 45) return 'bg-tertiary-container';
  return 'bg-error';
}

export function sentryScoreTextColor(score: number): string {
  if (score >= 70) return 'text-secondary';
  if (score >= 45) return 'text-tertiary-container';
  return 'text-error';
}

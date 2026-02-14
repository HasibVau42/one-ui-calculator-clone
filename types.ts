
export type Theme = 'dark' | 'light';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type ButtonType = 'number' | 'operator' | 'function' | 'action';

export interface CalcButton {
  label: string;
  value: string;
  type: ButtonType;
  span?: number;
}

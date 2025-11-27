// Types para o FinMind

export type PlanType = 'essencial' | 'inteligente' | 'supremo';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: PlanType;
  salary?: number;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

export interface FinancialData {
  salary: number;
  debts: Debt[];
  goals: Goal[];
}

export interface SmartPurchaseInput {
  itemName: string;
  itemPrice: number;
  salary: number;
  totalDebts: number;
  totalGoals: number;
  estimatedBalance: number;
}

export interface SmartPurchaseResult {
  recommendation: 'pode-comprar' | 'melhor-esperar' | 'nao-recomendado';
  paymentSuggestion: string;
  reason: string;
}

export interface FinancialAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  monthlyPlan: string;
}

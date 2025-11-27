// Utilitários para localStorage e lógica de negócio

import { User, Debt, Goal, FinancialData, SmartPurchaseInput, SmartPurchaseResult, FinancialAnalysis } from './types';

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'finmind_users',
  CURRENT_USER: 'finmind_current_user',
  FINANCIAL_DATA: 'finmind_financial_data',
};

// User Management
export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const findUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email === email);
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const updateCurrentUser = (updates: Partial<User>): void => {
  const current = getCurrentUser();
  if (!current) return;
  
  const updated = { ...current, ...updates };
  setCurrentUser(updated);
  
  // Update in users list
  const users = getUsers();
  const index = users.findIndex(u => u.id === current.id);
  if (index !== -1) {
    users[index] = updated;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Financial Data Management
export const getFinancialData = (): FinancialData => {
  if (typeof window === 'undefined') return { salary: 0, debts: [], goals: [] };
  const user = getCurrentUser();
  if (!user) return { salary: 0, debts: [], goals: [] };
  
  const key = `${STORAGE_KEYS.FINANCIAL_DATA}_${user.id}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : { salary: user.salary || 0, debts: [], goals: [] };
};

export const saveFinancialData = (data: FinancialData): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const key = `${STORAGE_KEYS.FINANCIAL_DATA}_${user.id}`;
  localStorage.setItem(key, JSON.stringify(data));
};

// Debt Management
export const addDebt = (debt: Omit<Debt, 'id'>): void => {
  const data = getFinancialData();
  const newDebt: Debt = {
    ...debt,
    id: Date.now().toString(),
  };
  data.debts.push(newDebt);
  saveFinancialData(data);
};

export const updateDebt = (id: string, updates: Partial<Debt>): void => {
  const data = getFinancialData();
  const index = data.debts.findIndex(d => d.id === id);
  if (index !== -1) {
    data.debts[index] = { ...data.debts[index], ...updates };
    saveFinancialData(data);
  }
};

export const deleteDebt = (id: string): void => {
  const data = getFinancialData();
  data.debts = data.debts.filter(d => d.id !== id);
  saveFinancialData(data);
};

export const markDebtAsPaid = (id: string): void => {
  updateDebt(id, { isPaid: true, paidAt: new Date().toISOString() });
};

// Goal Management
export const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>): void => {
  const data = getFinancialData();
  const newGoal: Goal = {
    ...goal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  data.goals.push(newGoal);
  saveFinancialData(data);
};

export const updateGoal = (id: string, updates: Partial<Goal>): void => {
  const data = getFinancialData();
  const index = data.goals.findIndex(g => g.id === id);
  if (index !== -1) {
    data.goals[index] = { ...data.goals[index], ...updates };
    saveFinancialData(data);
  }
};

export const deleteGoal = (id: string): void => {
  const data = getFinancialData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveFinancialData(data);
};

// Debt Alerts
export const getDebtStatus = (debt: Debt): 'paid' | 'overdue' | 'due-soon' | 'ok' => {
  if (debt.isPaid) return 'paid';
  
  const today = new Date();
  const dueDate = new Date(debt.dueDate);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'due-soon';
  return 'ok';
};

// Goal Calculations
export const calculateGoalProgress = (goal: Goal): number => {
  return (goal.currentAmount / goal.targetAmount) * 100;
};

export const calculateMonthsToGoal = (goal: Goal, monthlySavings: number): number => {
  const remaining = goal.targetAmount - goal.currentAmount;
  if (monthlySavings <= 0) return Infinity;
  return Math.ceil(remaining / monthlySavings);
};

export const calculateMonthlySavingsNeeded = (goal: Goal, targetMonths: number): number => {
  const remaining = goal.targetAmount - goal.currentAmount;
  return remaining / targetMonths;
};

// Smart Purchase AI (Simulated)
export const analyzeSmartPurchase = (input: SmartPurchaseInput): SmartPurchaseResult => {
  const { itemPrice, salary, totalDebts, estimatedBalance } = input;
  
  const debtRatio = totalDebts / salary;
  const priceToSalaryRatio = itemPrice / salary;
  const balanceAfterPurchase = estimatedBalance - itemPrice;
  
  // Lógica simplificada de IA
  if (debtRatio > 0.5) {
    return {
      recommendation: 'nao-recomendado',
      paymentSuggestion: 'Foque em quitar suas dívidas primeiro',
      reason: 'Suas dívidas representam mais de 50% do seu salário. Priorize quitá-las antes de novas compras.',
    };
  }
  
  if (balanceAfterPurchase < salary * 0.2) {
    return {
      recommendation: 'nao-recomendado',
      paymentSuggestion: 'Aguarde até ter mais reserva financeira',
      reason: 'Esta compra deixaria você com menos de 20% do salário disponível. Mantenha uma reserva de emergência.',
    };
  }
  
  if (priceToSalaryRatio > 0.3) {
    return {
      recommendation: 'melhor-esperar',
      paymentSuggestion: 'Considere parcelar em 2-3x no crédito',
      reason: 'O valor representa mais de 30% do seu salário. Se possível, aguarde mais um mês ou parcele.',
    };
  }
  
  if (priceToSalaryRatio > 0.15) {
    return {
      recommendation: 'pode-comprar',
      paymentSuggestion: 'Débito ou 2x no crédito sem juros',
      reason: 'Você tem condições de fazer esta compra, mas evite comprometer muito do seu orçamento mensal.',
    };
  }
  
  return {
    recommendation: 'pode-comprar',
    paymentSuggestion: 'Débito à vista',
    reason: 'Ótima escolha! O valor está dentro do seu orçamento e não comprometerá suas finanças.',
  };
};

// Financial Analysis AI (Simulated - Supremo only)
export const generateFinancialAnalysis = (): FinancialAnalysis => {
  const data = getFinancialData();
  const user = getCurrentUser();
  
  if (!user) {
    return {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      monthlyPlan: '',
    };
  }
  
  const totalDebts = data.debts.filter(d => !d.isPaid).reduce((sum, d) => sum + d.amount, 0);
  const totalGoals = data.goals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0);
  const debtRatio = totalDebts / data.salary;
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  // Análise de pontos fortes
  if (data.goals.length > 0) {
    strengths.push('Você tem metas financeiras definidas, o que demonstra planejamento');
  }
  if (debtRatio < 0.3) {
    strengths.push('Suas dívidas estão sob controle (menos de 30% do salário)');
  }
  if (data.debts.filter(d => getDebtStatus(d) === 'paid').length > 0) {
    strengths.push('Você tem histórico de pagamentos em dia');
  }
  
  // Análise de pontos fracos
  if (debtRatio > 0.5) {
    weaknesses.push('Nível de endividamento alto (mais de 50% do salário)');
  }
  if (data.debts.filter(d => getDebtStatus(d) === 'overdue').length > 0) {
    weaknesses.push('Existem dívidas atrasadas que precisam de atenção imediata');
  }
  if (data.goals.length === 0) {
    weaknesses.push('Falta de metas financeiras de longo prazo');
  }
  
  // Recomendações
  if (debtRatio > 0.4) {
    recommendations.push('Priorize quitar as dívidas com juros mais altos primeiro (método avalanche)');
  }
  if (data.goals.length === 0) {
    recommendations.push('Crie uma meta de reserva de emergência (6 meses de despesas)');
  }
  recommendations.push('Destine pelo menos 10% do salário para poupança/investimentos');
  
  // Plano mensal
  const monthlyPlan = `
Mês 1-2: Organize todas as dívidas e priorize as atrasadas.
Mês 3-4: Reduza gastos supérfluos em 20% e direcione para quitação de dívidas.
Mês 5-6: Inicie reserva de emergência com 10% do salário mensal.
  `.trim();
  
  return {
    strengths: strengths.length > 0 ? strengths : ['Você está começando sua jornada financeira'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Ainda não há dados suficientes para análise completa'],
    recommendations,
    monthlyPlan,
  };
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format date
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

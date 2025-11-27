'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, getFinancialData, getDebtStatus, formatCurrency } from '@/lib/finmind-utils';
import { Wallet, TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [user, setUser] = useState(getCurrentUser());
  const [data, setData] = useState(getFinancialData());

  useEffect(() => {
    setUser(getCurrentUser());
    setData(getFinancialData());
  }, []);

  if (!user) return null;

  const activeDebts = data.debts.filter(d => !d.isPaid);
  const totalDebts = activeDebts.reduce((sum, d) => sum + d.amount, 0);
  const overdueDebts = activeDebts.filter(d => getDebtStatus(d) === 'overdue');
  const dueSoonDebts = activeDebts.filter(d => getDebtStatus(d) === 'due-soon');

  const totalGoalsTarget = data.goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalsCurrent = data.goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalsProgress = totalGoalsTarget > 0 ? (totalGoalsCurrent / totalGoalsTarget) * 100 : 0;

  const estimatedBalance = data.salary - totalDebts;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Olá, {user.name}! 👋
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo da sua situação financeira
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Salário Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.salary)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dívidas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebts)}</p>
            <p className="text-xs text-gray-500 mt-1">{activeDebts.length} dívida(s)</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalGoalsCurrent)}</p>
            <p className="text-xs text-gray-500 mt-1">de {formatCurrency(totalGoalsTarget)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Saldo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${estimatedBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(estimatedBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(overdueDebts.length > 0 || dueSoonDebts.length > 0) && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-5 h-5" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueDebts.map(debt => (
              <div key={debt.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-red-900">{debt.name}</p>
                    <p className="text-sm text-red-600">Vencida - {formatCurrency(debt.amount)}</p>
                  </div>
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                    Atrasada
                  </span>
                </div>
              </div>
            ))}

            {dueSoonDebts.map(debt => (
              <div key={debt.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-orange-900">{debt.name}</p>
                    <p className="text-sm text-orange-600">Vence em breve - {formatCurrency(debt.amount)}</p>
                  </div>
                  <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">
                    Vencendo
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Minhas Dívidas</CardTitle>
          </CardHeader>
          <CardContent>
            {activeDebts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-gray-600">Você não tem dívidas ativas!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeDebts.slice(0, 3).map(debt => (
                  <div key={debt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{debt.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(debt.amount)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      getDebtStatus(debt) === 'overdue' ? 'bg-red-100 text-red-700' :
                      getDebtStatus(debt) === 'due-soon' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getDebtStatus(debt) === 'overdue' ? 'Atrasada' :
                       getDebtStatus(debt) === 'due-soon' ? 'Vencendo' : 'OK'}
                    </span>
                  </div>
                ))}
                <Link href="/dashboard/debts">
                  <Button variant="outline" className="w-full">
                    Ver todas as dívidas
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Minhas Metas</CardTitle>
          </CardHeader>
          <CardContent>
            {data.goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Você ainda não tem metas definidas</p>
                <Link href="/dashboard/goals">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                    Criar primeira meta
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.goals.slice(0, 3).map(goal => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-900">{goal.name}</p>
                        <p className="text-sm text-gray-600">{progress.toFixed(0)}%</p>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  );
                })}
                <Link href="/dashboard/goals">
                  <Button variant="outline" className="w-full">
                    Ver todas as metas
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

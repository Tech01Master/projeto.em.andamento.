'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, saveFinancialData, addDebt, addGoal } from '@/lib/finmind-utils';
import { ClipboardList, DollarSign, Target } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    salary: '',
    debts: [{ name: '', amount: '', dueDate: '' }],
    goals: [{ name: '', targetAmount: '', currentAmount: '' }],
  });

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleAddDebt = () => {
    setFormData({
      ...formData,
      debts: [...formData.debts, { name: '', amount: '', dueDate: '' }],
    });
  };

  const handleRemoveDebt = (index: number) => {
    setFormData({
      ...formData,
      debts: formData.debts.filter((_, i) => i !== index),
    });
  };

  const handleAddGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, { name: '', targetAmount: '', currentAmount: '' }],
    });
  };

  const handleRemoveGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index),
    });
  };

  const handleFinish = () => {
    // Salvar salário
    const salary = parseFloat(formData.salary) || 0;
    saveFinancialData({ salary, debts: [], goals: [] });

    // Adicionar dívidas
    formData.debts.forEach(debt => {
      if (debt.name && debt.amount && debt.dueDate) {
        addDebt({
          name: debt.name,
          amount: parseFloat(debt.amount),
          dueDate: debt.dueDate,
          isPaid: false,
        });
      }
    });

    // Adicionar metas
    formData.goals.forEach(goal => {
      if (goal.name && goal.targetAmount) {
        addGoal({
          name: goal.name,
          targetAmount: parseFloat(goal.targetAmount),
          currentAmount: parseFloat(goal.currentAmount) || 0,
        });
      }
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Configure seu perfil financeiro
          </h1>
          <p className="text-gray-600">
            Passo {step} de 3
          </p>
        </div>

        {step === 1 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Qual é o seu salário mensal?</CardTitle>
              <CardDescription>
                Isso nos ajudará a fazer recomendações personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salário mensal (R$)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="3000.00"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="h-12 text-lg"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                disabled={!formData.salary}
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Você tem dívidas atuais?</CardTitle>
              <CardDescription>
                Liste suas dívidas para melhor controle (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.debts.map((debt, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Dívida {index + 1}</span>
                    {formData.debts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDebt(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Nome da dívida"
                    value={debt.name}
                    onChange={(e) => {
                      const newDebts = [...formData.debts];
                      newDebts[index].name = e.target.value;
                      setFormData({ ...formData, debts: newDebts });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Valor (R$)"
                      value={debt.amount}
                      onChange={(e) => {
                        const newDebts = [...formData.debts];
                        newDebts[index].amount = e.target.value;
                        setFormData({ ...formData, debts: newDebts });
                      }}
                    />
                    <Input
                      type="date"
                      value={debt.dueDate}
                      onChange={(e) => {
                        const newDebts = [...formData.debts];
                        newDebts[index].dueDate = e.target.value;
                        setFormData({ ...formData, debts: newDebts });
                      }}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddDebt}
                className="w-full"
              >
                + Adicionar outra dívida
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Quais são suas metas financeiras?</CardTitle>
              <CardDescription>
                Defina objetivos para alcançar (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.goals.map((goal, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Meta {index + 1}</span>
                    {formData.goals.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGoal(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Nome da meta (ex: Viagem)"
                    value={goal.name}
                    onChange={(e) => {
                      const newGoals = [...formData.goals];
                      newGoals[index].name = e.target.value;
                      setFormData({ ...formData, goals: newGoals });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Valor total (R$)"
                      value={goal.targetAmount}
                      onChange={(e) => {
                        const newGoals = [...formData.goals];
                        newGoals[index].targetAmount = e.target.value;
                        setFormData({ ...formData, goals: newGoals });
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Já economizado (R$)"
                      value={goal.currentAmount}
                      onChange={(e) => {
                        const newGoals = [...formData.goals];
                        newGoals[index].currentAmount = e.target.value;
                        setFormData({ ...formData, goals: newGoals });
                      }}
                    />
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddGoal}
                className="w-full"
              >
                + Adicionar outra meta
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

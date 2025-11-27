'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getFinancialData, addGoal, updateGoal, deleteGoal, formatCurrency, calculateGoalProgress, calculateMonthsToGoal, calculateMonthlySavingsNeeded } from '@/lib/finmind-utils';
import { Goal } from '@/lib/types';
import { Plus, Pencil, Trash2, Target, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function GoalsPage() {
  const [data, setData] = useState(getFinancialData());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
  });

  const refreshData = () => {
    setData(getFinancialData());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
      });
    } else {
      addGoal({
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
      });
    }

    setFormData({ name: '', targetAmount: '', currentAmount: '' });
    setEditingGoal(null);
    setIsAddOpen(false);
    refreshData();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
    });
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteGoal(id);
      refreshData();
    }
  };

  const handleAddProgress = (goal: Goal) => {
    const amount = prompt('Quanto você quer adicionar à meta?');
    if (amount) {
      const newAmount = goal.currentAmount + parseFloat(amount);
      updateGoal(goal.id, { currentAmount: newAmount });
      refreshData();
    }
  };

  const totalTarget = data.goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = data.goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  // Estimate monthly savings (10% of salary)
  const monthlySavings = data.salary * 0.1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Metas</h1>
          <p className="text-gray-600 mt-1">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Viagem para Europa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor total (R$)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor já economizado (R$)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600">
                {editingGoal ? 'Salvar Alterações' : 'Adicionar Meta'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Progresso Total das Metas</p>
                <p className="text-3xl font-bold mt-1">{overallProgress.toFixed(1)}%</p>
              </div>
              <Target className="w-12 h-12 opacity-80" />
            </div>
            <div>
              <Progress value={overallProgress} className="h-3 bg-white/20" />
              <p className="text-sm mt-2 opacity-90">
                {formatCurrency(totalCurrent)} de {formatCurrency(totalTarget)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid gap-6">
        {data.goals.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">Você ainda não tem metas definidas</p>
              <p className="text-gray-500 text-sm">Comece criando sua primeira meta financeira!</p>
            </CardContent>
          </Card>
        ) : (
          data.goals.map(goal => {
            const progress = calculateGoalProgress(goal);
            const monthsToGoal = calculateMonthsToGoal(goal, monthlySavings);
            const monthlySavingsNeeded = calculateMonthlySavingsNeeded(goal, 12);
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <Card key={goal.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{goal.name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                        <span>•</span>
                        <span>Faltam: {formatCurrency(remaining)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progresso</span>
                      <span className="text-sm font-bold text-blue-600">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-gray-600 mt-2">
                      {formatCurrency(goal.currentAmount)} economizado
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tempo estimado</p>
                      <p className="text-lg font-bold text-blue-600">
                        {monthsToGoal === Infinity ? '∞' : `${monthsToGoal} meses`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Economizando {formatCurrency(monthlySavings)}/mês
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Para atingir em 1 ano</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(monthlySavingsNeeded)}/mês
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Economia necessária
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddProgress(goal)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Adicionar Progresso
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

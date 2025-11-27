'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getFinancialData, addDebt, updateDebt, deleteDebt, markDebtAsPaid, getDebtStatus, formatCurrency, formatDate } from '@/lib/finmind-utils';
import { Debt } from '@/lib/types';
import { Plus, Pencil, Trash2, Check, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DebtsPage() {
  const [data, setData] = useState(getFinancialData());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
  });

  const refreshData = () => {
    setData(getFinancialData());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDebt) {
      updateDebt(editingDebt.id, {
        name: formData.name,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
      });
    } else {
      addDebt({
        name: formData.name,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        isPaid: false,
      });
    }

    setFormData({ name: '', amount: '', dueDate: '' });
    setEditingDebt(null);
    setIsAddOpen(false);
    refreshData();
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name,
      amount: debt.amount.toString(),
      dueDate: debt.dueDate,
    });
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta dívida?')) {
      deleteDebt(id);
      refreshData();
    }
  };

  const handleMarkAsPaid = (id: string) => {
    markDebtAsPaid(id);
    refreshData();
  };

  const activeDebts = data.debts.filter(d => !d.isPaid);
  const paidDebts = data.debts.filter(d => d.isPaid);
  const totalActive = activeDebts.reduce((sum, d) => sum + d.amount, 0);

  // Chart data
  const chartData = activeDebts.map(debt => ({
    name: debt.name.length > 15 ? debt.name.substring(0, 15) + '...' : debt.name,
    valor: debt.amount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Dívidas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas dívidas e mantenha-se organizado</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Dívida
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDebt ? 'Editar Dívida' : 'Nova Dívida'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da dívida</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cartão de crédito"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                {editingDebt ? 'Salvar Alterações' : 'Adicionar Dívida'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-orange-600 text-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Total em Dívidas Ativas</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalActive)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">{activeDebts.length} dívida(s)</p>
              <p className="text-sm opacity-90">{paidDebts.length} paga(s)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {activeDebts.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Visão Geral das Dívidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="valor" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Active Debts */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Dívidas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {activeDebts.length === 0 ? (
            <div className="text-center py-12">
              <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Parabéns! Você não tem dívidas ativas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDebts.map(debt => {
                const status = getDebtStatus(debt);
                return (
                  <div
                    key={debt.id}
                    className={`p-4 rounded-lg border-2 ${
                      status === 'overdue' ? 'bg-red-50 border-red-200' :
                      status === 'due-soon' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{debt.name}</h3>
                          {status === 'overdue' && (
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Atrasada
                            </span>
                          )}
                          {status === 'due-soon' && (
                            <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Vencendo
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(debt.amount)}</p>
                        <p className="text-sm text-gray-600 mt-1">Vencimento: {formatDate(debt.dueDate)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(debt)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(debt.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleMarkAsPaid(debt.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como Paga
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paid Debts */}
      {paidDebts.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Dívidas Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paidDebts.map(debt => (
                <div key={debt.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{debt.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(debt.amount)}</p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

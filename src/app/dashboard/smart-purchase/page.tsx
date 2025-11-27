'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFinancialData, analyzeSmartPurchase, formatCurrency } from '@/lib/finmind-utils';
import { Sparkles, ShoppingCart, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function SmartPurchasePage() {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    const data = getFinancialData();
    const activeDebts = data.debts.filter(d => !d.isPaid);
    const totalDebts = activeDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalGoals = data.goals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0);
    const estimatedBalance = data.salary - totalDebts;

    const analysis = analyzeSmartPurchase({
      itemName,
      itemPrice: parseFloat(itemPrice),
      salary: data.salary,
      totalDebts,
      totalGoals,
      estimatedBalance,
    });

    setResult(analysis);
  };

  const getRecommendationIcon = () => {
    if (!result) return null;
    
    switch (result.recommendation) {
      case 'pode-comprar':
        return <CheckCircle className="w-16 h-16 text-emerald-500" />;
      case 'melhor-esperar':
        return <AlertCircle className="w-16 h-16 text-orange-500" />;
      case 'nao-recomendado':
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getRecommendationColor = () => {
    if (!result) return '';
    
    switch (result.recommendation) {
      case 'pode-comprar':
        return 'from-emerald-500 to-teal-600';
      case 'melhor-esperar':
        return 'from-orange-500 to-amber-600';
      case 'nao-recomendado':
        return 'from-red-500 to-rose-600';
    }
  };

  const getRecommendationText = () => {
    if (!result) return '';
    
    switch (result.recommendation) {
      case 'pode-comprar':
        return 'Pode Comprar! ✓';
      case 'melhor-esperar':
        return 'Melhor Esperar';
      case 'nao-recomendado':
        return 'Não Recomendado';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compra Inteligente</h1>
        <p className="text-gray-600">
          Nossa IA analisa sua situação financeira e recomenda se você deve fazer a compra
        </p>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Analisar Compra
          </CardTitle>
          <CardDescription>
            Informe o que você quer comprar e o valor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">O que você quer comprar?</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Ex: Notebook, Celular, Viagem..."
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemPrice">Qual o valor? (R$)</Label>
            <Input
              id="itemPrice"
              type="number"
              step="0.01"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="0.00"
              className="h-12"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!itemName || !itemPrice}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-lg font-medium"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Analisar com IA
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-0 shadow-2xl bg-gradient-to-br ${getRecommendationColor()} text-white animate-in fade-in duration-500`}>
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                {getRecommendationIcon()}
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-2">{getRecommendationText()}</h2>
                <p className="text-lg opacity-90">{itemName} - {formatCurrency(parseFloat(itemPrice))}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-sm opacity-80 mb-2">Forma de Pagamento Sugerida</p>
                  <p className="text-xl font-bold">{result.paymentSuggestion}</p>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm opacity-80 mb-2">Análise da IA</p>
                  <p className="text-base leading-relaxed">{result.reason}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <Sparkles className="w-12 h-12 text-purple-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Como funciona?
                </h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Nossa IA analisa seu salário, dívidas, metas e saldo disponível para recomendar 
                  se você deve fazer a compra e qual a melhor forma de pagamento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

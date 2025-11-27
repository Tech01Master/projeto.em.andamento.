'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers, updateCurrentUser, setCurrentUser } from '@/lib/finmind-utils';
import { PlanType } from '@/lib/types';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';

const plans = [
  {
    id: 'essencial' as PlanType,
    name: 'Essencial',
    price: 'Grátis',
    icon: Zap,
    color: 'from-gray-500 to-gray-600',
    features: [
      'Criação e edição de dívidas',
      'Alertas básicos (vencendo/atrasada)',
      'Gráfico de barras simples',
      'Metas básicas',
    ],
  },
  {
    id: 'inteligente' as PlanType,
    name: 'Inteligente',
    price: 'R$ 9,90',
    icon: Sparkles,
    color: 'from-blue-500 to-indigo-600',
    popular: true,
    features: [
      'Tudo do Essencial',
      'Gráficos detalhados',
      'Alertas inteligentes',
      'Planejamento de metas',
      'IA "Compra Inteligente"',
      'Recomendações de economia',
    ],
  },
  {
    id: 'supremo' as PlanType,
    name: 'Supremo',
    price: 'R$ 19,90',
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Tudo do Inteligente',
      'IA "Minha Real Situação Financeira"',
      'Relatórios mensais completos',
      'Gráficos de projeção',
      'Análises profundas',
      'Suporte prioritário',
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('essencial');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('userId');
    setUserId(id);
  }, [searchParams]);

  const handleSelectPlan = () => {
    if (!userId) return;

    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      user.plan = selectedPlan;
      setCurrentUser(user);
      router.push('/quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Escolha seu plano
          </h1>
          <p className="text-gray-600 text-lg">
            Selecione o plano ideal para suas necessidades financeiras
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                  isSelected ? 'ring-4 ring-emerald-500 shadow-2xl scale-105' : 'hover:scale-102'
                } ${plan.popular ? 'border-2 border-emerald-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Mais popular
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center shadow-lg mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-gray-900 mt-2">
                    {plan.price}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                      <span className="text-emerald-700 font-medium text-sm">
                        ✓ Plano selecionado
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleSelectPlan}
            size="lg"
            className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium shadow-lg"
          >
            Continuar com {plans.find(p => p.id === selectedPlan)?.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

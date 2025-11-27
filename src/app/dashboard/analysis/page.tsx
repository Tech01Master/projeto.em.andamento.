'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateFinancialAnalysis, getCurrentUser } from '@/lib/finmind-utils';
import { Brain, TrendingUp, TrendingDown, Lightbulb, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (currentUser?.plan !== 'supremo') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleGenerateAnalysis = () => {
    setLoading(true);
    
    // Simular delay de processamento da IA
    setTimeout(() => {
      const result = generateFinancialAnalysis();
      setAnalysis(result);
      setLoading(false);
    }, 2000);
  };

  if (!user || user.plan !== 'supremo') {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha Real Situação Financeira</h1>
        <p className="text-gray-600">
          Análise profunda com IA sobre sua saúde financeira
        </p>
      </div>

      {!analysis ? (
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              <Brain className="w-20 h-20 text-purple-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Pronto para descobrir sua real situação?
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Nossa IA analisará todos os seus dados financeiros e fornecerá insights 
                  profundos sobre pontos fortes, fracos e recomendações personalizadas.
                </p>
              </div>
              <Button
                onClick={handleGenerateAnalysis}
                disabled={loading}
                className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-lg font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-3" />
                    Gerar Análise Completa
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Strengths */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <TrendingUp className="w-6 h-6" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{strength}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <TrendingDown className="w-6 h-6" />
                Pontos de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{weakness}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Lightbulb className="w-6 h-6" />
                Recomendações Práticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border-l-4 border-blue-500">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">{recommendation}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Plano de Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed">
                  {analysis.monthlyPlan}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={handleGenerateAnalysis}
              variant="outline"
              className="h-12 px-6"
            >
              <Brain className="w-4 h-4 mr-2" />
              Gerar Nova Análise
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

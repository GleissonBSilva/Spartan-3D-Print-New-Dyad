"use client";

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  Printer,
  Package,
  Calendar,
  Download
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    monthly: Array<{ month: string; revenue: number; target: number }>;
    yearly: Array<{ year: string; revenue: number; growth: number }>;
  };
  users: {
    growth: Array<{ month: string; newUsers: number; churnUsers: number }>;
    demographics: Array<{ segment: string; count: number; percentage: number }>;
  };
  printing: {
    dailyOutput: Array<{ date: string; prints: number; filamentUsed: number }>;
    printerUtilization: Array<{ printer: string; hours: number; efficiency: number }>;
    materialUsage: Array<{ material: string; kg: number; cost: number }>;
  };
  financial: {
    cashFlow: Array<{ month: string; income: number; expenses: number; profit: number }>;
    expenseBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  };
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'printing' | 'financial'>('revenue');

  // Mock data - in production, this would come from API
  const analyticsData: AnalyticsData = useMemo(() => ({
    revenue: {
      monthly: [
        { month: 'Jan', revenue: 45000, target: 40000 },
        { month: 'Fev', revenue: 52000, target: 45000 },
        { month: 'Mar', revenue: 48000, target: 50000 },
        { month: 'Abr', revenue: 61000, target: 55000 },
        { month: 'Mai', revenue: 58000, target: 60000 },
        { month: 'Jun', revenue: 72000, target: 65000 },
      ],
      yearly: [
        { year: '2023', revenue: 450000, growth: 15 },
        { year: '2024', revenue: 520000, growth: 18 },
      ],
    },
    users: {
      growth: [
        { month: 'Jan', newUsers: 45, churnUsers: 8 },
        { month: 'Fev', newUsers: 52, churnUsers: 12 },
        { month: 'Mar', newUsers: 38, churnUsers: 10 },
        { month: 'Abr', newUsers: 65, churnUsers: 15 },
        { month: 'Mai', newUsers: 58, churnUsers: 11 },
        { month: 'Jun', newUsers: 72, churnUsers: 14 },
      ],
      demographics: [
        { segment: 'Hobbyistas', count: 234, percentage: 35 },
        { segment: 'Profissionais', count: 178, percentage: 27 },
        { segment: 'Empresas', count: 145, percentage: 22 },
        { segment: 'Educação', count: 89, percentage: 13 },
        { segment: 'Outros', count: 24, percentage: 3 },
      ],
    },
    printing: {
      dailyOutput: [
        { date: '01/06', prints: 12, filamentUsed: 2.5 },
        { date: '02/06', prints: 15, filamentUsed: 3.1 },
        { date: '03/06', prints: 10, filamentUsed: 2.0 },
        { date: '04/06', prints: 18, filamentUsed: 3.8 },
        { date: '05/06', prints: 14, filamentUsed: 2.9 },
        { date: '06/06', prints: 20, filamentUsed: 4.2 },
        { date: '07/06', prints: 16, filamentUsed: 3.3 },
      ],
      printerUtilization: [
        { printer: 'Ender 3 #1', hours: 180, efficiency: 85 },
        { printer: 'Ender 3 #2', hours: 165, efficiency: 78 },
        { printer: 'Prusa i3', hours: 190, efficiency: 92 },
        { printer: 'Creality CR-10', hours: 140, efficiency: 68 },
        { printer: 'Anycubic Kobra', hours: 175, efficiency: 83 },
      ],
      materialUsage: [
        { material: 'PLA', kg: 45.2, cost: 4294 },
        { material: 'PETG', kg: 28.5, cost: 3135 },
        { material: 'ABS', kg: 15.8, cost: 2067 },
        { material: 'TPU', kg: 8.3, cost: 1328 },
        { material: 'Resina', kg: 5.2, cost: 1560 },
      ],
    },
    financial: {
      cashFlow: [
        { month: 'Jan', income: 45000, expenses: 32000, profit: 13000 },
        { month: 'Fev', income: 52000, expenses: 35000, profit: 17000 },
        { month: 'Mar', income: 48000, expenses: 33000, profit: 15000 },
        { month: 'Abr', income: 61000, expenses: 38000, profit: 23000 },
        { month: 'Mai', income: 58000, expenses: 36000, profit: 22000 },
        { month: 'Jun', income: 72000, expenses: 40000, profit: 32000 },
      ],
      expenseBreakdown: [
        { category: 'Filamentos', amount: 12000, percentage: 30 },
        { category: 'Energia', amount: 8000, percentage: 20 },
        { category: 'Manutenção', amount: 6000, percentage: 15 },
        { category: 'Mão de Obra', amount: 10000, percentage: 25 },
        { category: 'Outros', amount: 4000, percentage: 10 },
      ],
    },
  }), []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateGrowth = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  const renderKPIs = () => {
    const currentRevenue = analyticsData.revenue.monthly[analyticsData.revenue.monthly.length - 1].revenue;
    const previousRevenue = analyticsData.revenue.monthly[analyticsData.revenue.monthly.length - 2].revenue;
    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);

    const currentUsers = analyticsData.users.growth.reduce((acc, curr) => acc + curr.newUsers, 0);
    const previousUsers = analyticsData.users.growth.slice(0, -1).reduce((acc, curr) => acc + curr.newUsers, 0);
    const userGrowth = calculateGrowth(currentUsers, previousUsers);

    const totalPrints = analyticsData.printing.dailyOutput.reduce((acc, curr) => acc + curr.prints, 0);
    const totalFilament = analyticsData.printing.dailyOutput.reduce((acc, curr) => acc + curr.filamentUsed, 0);

    const currentProfit = analyticsData.financial.cashFlow[analyticsData.financial.cashFlow.length - 1].profit;
    const previousProfit = analyticsData.financial.cashFlow[analyticsData.financial.cashFlow.length - 2].profit;
    const profitGrowth = calculateGrowth(currentProfit, previousProfit);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Receita Mensal</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentRevenue)}</p>
                <div className="flex items-center mt-2">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-400 mr-1" />
                  )}
                  <span className={`text-sm ${revenueGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Novos Usuários</p>
                <p className="text-2xl font-bold text-white">{currentUsers}</p>
                <div className="flex items-center mt-2">
                  {userGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-400 mr-1" />
                  )}
                  <span className={`text-sm ${userGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {userGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Impressões do Mês</p>
                <p className="text-2xl font-bold text-white">{totalPrints}</p>
                <div className="flex items-center mt-2">
                  <Package className="w-4 h-4 text-cyan-400 mr-1" />
                  <span className="text-sm text-cyan-400">{totalFilament.toFixed(1)} kg filamento</span>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Printer className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Lucro Líquido</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentProfit)}</p>
                <div className="flex items-center mt-2">
                  {profitGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-400 mr-1" />
                  )}
                  <span className={`text-sm ${profitGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {profitGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRevenueChart = () => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Receita Mensal vs Meta</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.revenue.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${value / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
              name="Receita Real"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.3}
              name="Meta"
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderUserGrowthChart = () => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Crescimento de Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.users.growth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="newUsers" fill="#6366f1" name="Novos Usuários" />
            <Bar dataKey="churnUsers" fill="#f43f5e" name="Churn" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderPrintingPerformance = () => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Desempenho de Impressão</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.printing.dailyOutput}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis yAxisId="left" stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="prints"
              stroke="#6366f1"
              strokeWidth={2}
              name="Impressões"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="filamentUsed"
              stroke="#22c55e"
              strokeWidth={2}
              name="Filamento (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderFinancialOverview = () => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.financial.cashFlow}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => `R$ ${value / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Receitas" />
            <Bar dataKey="expenses" fill="#f43f5e" name="Despesas" />
            <Bar dataKey="profit" fill="#6366f1" name="Lucro" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderMaterialUsagePie = () => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Uso de Materiais</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData.printing.materialUsage}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ material, percentage }) => `${material} (${percentage.toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="kg"
            >
              {analyticsData.printing.materialUsage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)} kg`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderExpenseBreakdown = () => (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Breakdown de Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData.financial.expenseBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) => `${category} (${percentage.toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {analyticsData.financial.expenseBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Analítico Avançado</h2>
          <p className="text-slate-400 mt-1">Métricas em tempo real do seu negócio de impressão 3D</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`cursor-pointer ${timeRange === '7d' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            onClick={() => setTimeRange('7d')}
          >
            7 dias
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer ${timeRange === '30d' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            onClick={() => setTimeRange('30d')}
          >
            30 dias
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer ${timeRange === '90d' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            onClick={() => setTimeRange('90d')}
          >
            90 dias
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer ${timeRange === '1y' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            onClick={() => setTimeRange('1y')}
          >
            1 ano
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      {renderKPIs()}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderRevenueChart()}
        {renderUserGrowthChart()}
        {renderPrintingPerformance()}
        {renderFinancialOverview()}
        {renderMaterialUsagePie()}
        {renderExpenseBreakdown()}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
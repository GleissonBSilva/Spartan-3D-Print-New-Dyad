export type UserRole = 'admin' | 'client' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  companyId?: string;
  companyName?: string;
  planId?: string;
  status: 'active' | 'trialing' | 'overdue' | 'canceled';
  mrr: number;
  joinedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  popular?: boolean;
  maxPrinters: number;
  maxProjects: number;
  maxFilaments: number;
  maxUsers: number;
  badge?: string;
  creditsAI?: number;
}

export interface MovimentacaoEstoque {
  id: string;
  filamentoId: string;
  tipo: 'consumo_producao' | 'estorno_cancelamento' | 'ajuste_manual' | 'entrada_compra';
  quantidadeGramas: number;
  projetoId?: string;
  data: string;
  motivo?: string;
}

export interface FilamentoEstoque {
  id: string;
  companyId?: string;
  tipo: 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'ASA' | 'RESINA' | 'NYLON' | 'PC';
  cor: string;
  corHex: string;
  marca: string;
  pesoTotalG: number;
  pesoRestanteG: number;
  precoKg: number;
  temperaturaBico?: string;
  temperaturaMesa?: string;
}

export interface Impressora3D {
  id: string;
  companyId?: string;
  nome: string;
  modelo: string;
  tipo: 'FDM' | 'Resina SLA';
  status: 'imprimindo' | 'disponivel' | 'manutencao' | 'desconectada';
  potenciaWatts: number;
  bicoMm: number;
  horasUso: number;
  limiteHorasManutencao?: number;
  projetoAtualId?: string;
  projetoAtual?: string;
  progressoPercentual?: number;
}

export interface ProjectMaterial {
  id: string;
  materialId?: string; // ID do filamento no estoque (se vinculado)
  materialName: string;
  color: string;
  colorHex?: string;
  filamentType: 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'ASA' | 'RESINA' | 'NYLON' | 'PC';
  weightGrams: number;
  costPerGram: number;
  totalCost: number;
}

export interface MaterialVariation {
  id: string;
  name: string;
  colorCount: number;
  materials: ProjectMaterial[];
  totalWeightGrams: number;
  materialsCost: number;
  energyCost: number;
  depreciationCost: number;
  laborCost: number;
  totalCost: number;
  suggestedPrice: number;
  estimatedProfit: number;
}

export interface ProjetoImpressao3D {
  id: string;
  companyId?: string;
  nomePeca: string;
  clienteNome: string;
  impressoraId?: string;
  impressoraNome?: string;
  pesoEstimadoG: number;
  tempoEstimadoHoras: number;
  materials: ProjectMaterial[];
  filamentoUtilizado?: string; // Descrição textual consolidada
  custoMaterial: number;
  custoEnergia: number;
  custoDepreciacao: number;
  custoMaoDeObra?: number;
  outrosCustos?: number;
  custoTotal: number;
  margemLucroPercentual?: number;
  precoCobrado: number;
  lucroLiquido: number;
  status: 'orcamento' | 'aprovado' | 'em_impressao' | 'concluido' | 'cancelado';
  estoqueBaixado?: boolean; // Flag de idempotência para controle de estoque
  dataCriacao: string;
  observacoes?: string;
}

export interface Invoice {
  id: string;
  companyId?: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  dueDate: string;
  paidAt?: string;
  method: 'pix' | 'credit_card' | 'boleto';
}

export interface SaaSMetrics {
  mrr: number;
  arr: number;
  activeClients: number;
  churnRate: number;
  ltv: number;
  revenueHistory: { month: string; revenue: number }[];
  planDistribution: { name: string; value: number; color: string }[];
}
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, FileCode, FileText, TrendingUp } from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { ProjectMaterial } from '@/types/saas';
import { PricingService, PricingCalculationResult } from '@/services/pricingService';
import { PieceDetailsForm } from './calculator/PieceDetailsForm';
import { MultiMaterialSelector } from './calculator/MultiMaterialSelector';
import { ProductionCostParams } from './calculator/ProductionCostParams';
import { PricingSummaryCard } from './calculator/PricingSummaryCard';
import { VariationsGrid } from './calculator/VariationsGrid';
import { GcodeAnalyzerModal } from './GcodeAnalyzerModal';
import { OrcamentoPdfModal } from './OrcamentoPdfModal';
import { toast } from 'sonner';

export const Calculadora3D: React.FC = () => {
  const { filamentos, impressoras, addProjeto } = useSaaSData();

  // Dados Gerais do Projeto
  const [nomePeca, setNomePeca] = useState('Luminária Voronoi Multicolor');
  const [clienteNome, setClienteNome] = useState('Mariana Silva');
  const [tempoHoras, setTempoHoras] = useState(8.5);
  const [selectedImpressoraId, setSelectedImpressoraId] = useState(impressoras[0]?.id || '');
  const [observacoes] = useState('');

  // Parâmetros Financeiros e Operacionais
  const [tarifaKwh, setTarifaKwh] = useState(0.85);
  const [depreciacaoHora, setDepreciacaoHora] = useState(0.50);
  const [taxaFalhaPorcento, setTaxaFalhaPorcento] = useState(10);
  const [custoMaoDeObra, setCustoMaoDeObra] = useState(15.0);
  const [outrosCustos] = useState(0.0);
  const [margemLucroPorcento, setMargemLucroPorcento] = useState(140);

  // Modais e Abas
  const [gcodeModal, setGcodeModal] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculadora' | 'variacoes'>('calculadora');

  // MATERIAIS SELECIONADOS (Até 4 cores/materiais)
  const [materials, setMaterials] = useState<ProjectMaterial[]>(() => {
    const f1 = filamentos[0] || { id: 'f1', tipo: 'PLA', cor: 'Preto Fosco', corHex: '#1e293b', precoKg: 95 };
    const f2 = filamentos[1] || { id: 'f2', tipo: 'PLA', cor: 'Branco Neve', corHex: '#f8fafc', precoKg: 105 };
    return [
      {
        id: 'mat_1',
        materialId: f1.id,
        materialName: `${f1.tipo} - ${f1.cor}`,
        color: f1.cor,
        colorHex: f1.corHex,
        filamentType: f1.tipo,
        weightGrams: 110,
        costPerGram: f1.precoKg / 1000,
        totalCost: Number((110 * (f1.precoKg / 1000)).toFixed(2)),
      },
      {
        id: 'mat_2',
        materialId: f2.id,
        materialName: `${f2.tipo} - ${f2.cor}`,
        color: f2.cor,
        colorHex: f2.corHex,
        filamentType: f2.tipo,
        weightGrams: 65,
        costPerGram: f2.precoKg / 1000,
        totalCost: Number((65 * (f2.precoKg / 1000)).toFixed(2)),
      },
    ];
  });

  const impressoraAtual = impressoras.find(i => i.id === selectedImpressoraId) || impressoras[0];

  // Cálculo de Preço via PricingService
  const calculationResult: PricingCalculationResult = useMemo(() => {
    return PricingService.calculateProjectPricing({
      materials,
      printTimeHours: tempoHoras,
      printerPowerWatts: impressoraAtual?.potenciaWatts || 350,
      kwhEnergyRate: tarifaKwh,
      depreciationHourlyRate: depreciacaoHora,
      failureRatePercent: taxaFalhaPorcento,
      laborCost: custoMaoDeObra,
      otherCosts: outrosCustos,
      profitMarginPercent: margemLucroPorcento,
    });
  }, [
    materials,
    tempoHoras,
    impressoraAtual,
    tarifaKwh,
    depreciacaoHora,
    taxaFalhaPorcento,
    custoMaoDeObra,
    outrosCustos,
    margemLucroPorcento,
  ]);

  // Simulação de Variações de 1 a 4 Cores
  const variations = useMemo(() => {
    return PricingService.generateMaterialVariations(materials, {
      printTimeHours: tempoHoras,
      printerPowerWatts: impressoraAtual?.potenciaWatts || 350,
      kwhEnergyRate: tarifaKwh,
      depreciationHourlyRate: depreciacaoHora,
      failureRatePercent: taxaFalhaPorcento,
      laborCost: custoMaoDeObra,
      otherCosts: outrosCustos,
      profitMarginPercent: margemLucroPorcento,
    });
  }, [
    materials,
    tempoHoras,
    impressoraAtual,
    tarifaKwh,
    depreciacaoHora,
    taxaFalhaPorcento,
    custoMaoDeObra,
    outrosCustos,
    margemLucroPorcento,
  ]);

  // Adicionar novo material (Máx 4)
  const handleAddMaterial = () => {
    if (materials.length >= 4) {
      toast.warning('Limite de até 4 materiais/cores por projeto atingido para esta simulação.');
      return;
    }

    const availableFil = filamentos[materials.length] || filamentos[0];
    const newMat: ProjectMaterial = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      materialId: availableFil?.id,
      materialName: `${availableFil?.tipo || 'PLA'} - ${availableFil?.cor || 'Cor'}`,
      color: availableFil?.cor || 'Padrão',
      colorHex: availableFil?.corHex || '#6366f1',
      filamentType: availableFil?.tipo || 'PLA',
      weightGrams: 30,
      costPerGram: (availableFil?.precoKg || 100) / 1000,
      totalCost: Number((30 * ((availableFil?.precoKg || 100) / 1000)).toFixed(2)),
    };

    setMaterials(prev => [...prev, newMat]);
    toast.success(`Material ${materials.length + 1} adicionado ao projeto.`);
  };

  // Remover material
  const handleRemoveMaterial = (matId: string) => {
    if (materials.length <= 1) {
      toast.error('O projeto precisa de pelo menos 1 material cadastrado.');
      return;
    }
    setMaterials(prev => prev.filter(m => m.id !== matId));
  };

  // Atualizar campo de um material
  const handleUpdateMaterial = (matId: string, field: 'materialId' | 'weightGrams', value: any) => {
    setMaterials(prev =>
      prev.map(m => {
        if (m.id === matId) {
          if (field === 'materialId') {
            const found = filamentos.find(f => f.id === value);
            if (found) {
              const costPerG = found.precoKg / 1000;
              return {
                ...m,
                materialId: found.id,
                materialName: `${found.tipo} - ${found.cor}`,
                color: found.cor,
                colorHex: found.corHex,
                filamentType: found.tipo,
                costPerGram: costPerG,
                totalCost: Number((m.weightGrams * costPerG).toFixed(2)),
              };
            }
          } else if (field === 'weightGrams') {
            const w = Math.max(1, Number(value) || 0);
            return {
              ...m,
              weightGrams: w,
              totalCost: Number((w * m.costPerGram).toFixed(2)),
            };
          }
        }
        return m;
      })
    );
  };

  // Aplicar dados do G-code importado
  const handleApplyGcodeData = (data: { nome: string; peso: number; tempo: number }) => {
    setNomePeca(data.nome);
    setTempoHoras(data.tempo);

    if (materials.length === 1) {
      setMaterials(prev => [
        {
          ...prev[0],
          weightGrams: data.peso,
          totalCost: Number((data.peso * prev[0].costPerGram).toFixed(2)),
        },
      ]);
    } else {
      const splitWeight = Math.round(data.peso / materials.length);
      setMaterials(prev =>
        prev.map(m => ({
          ...m,
          weightGrams: splitWeight,
          totalCost: Number((splitWeight * m.costPerGram).toFixed(2)),
        }))
      );
    }
    toast.success('Parâmetros de G-Code integrados à calculadora multimaterial!');
  };

  // Salvar Projeto
  const handleSalvarProjeto = (status: 'orcamento' | 'em_impressao') => {
    if (!nomePeca.trim()) {
      toast.error('Informe o nome da peça/projeto.');
      return;
    }

    const matSummary = materials.map(m => `${m.filamentType} ${m.color} (${m.weightGrams}g)`).join(' + ');

    addProjeto({
      nomePeca,
      clienteNome,
      impressoraId: impressoraAtual?.id,
      impressoraNome: impressoraAtual?.nome,
      pesoEstimadoG: calculationResult.totalWeightGrams,
      tempoEstimadoHoras: tempoHoras,
      materials,
      filamentoUtilizado: matSummary,
      custoMaterial: calculationResult.materialsWithFailureCost,
      custoEnergia: calculationResult.energyCost,
      custoDepreciacao: calculationResult.depreciationCost,
      custoMaoDeObra,
      outrosCustos,
      custoTotal: calculationResult.totalProductionCost,
      margemLucroPercentual: margemLucroPorcento,
      precoCobrado: calculationResult.suggestedPrice,
      lucroLiquido: calculationResult.estimatedProfit,
      status,
      observacoes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setActiveTab('calculadora')}
            className={`text-xs rounded-xl h-9 px-4 font-bold ${
              activeTab === 'calculadora'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4 mr-1.5" /> Calculadora & Multimaterial (Até 4 Cores)
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab('variacoes')}
            className={`text-xs rounded-xl h-9 px-4 font-bold ${
              activeTab === 'variacoes'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-1.5 text-amber-400" /> Simular Variações (1 a 4 Cores)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setGcodeModal(true)}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs rounded-xl h-9"
          >
            <FileCode className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            Importar G-Code / .3MF
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setPdfModal(true)}
            variant="outline"
            className="bg-slate-950 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/30 text-xs rounded-xl h-9"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Gerar Proposta PDF
          </Button>
        </div>
      </div>

      {activeTab === 'calculadora' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal dos Formulários */}
          <div className="lg:col-span-2 space-y-6">
            <PieceDetailsForm
              nomePeca={nomePeca}
              setNomePeca={setNomePeca}
              clienteNome={clienteNome}
              setClienteNome={setClienteNome}
              selectedImpressoraId={selectedImpressoraId}
              setSelectedImpressoraId={setSelectedImpressoraId}
              tempoHoras={tempoHoras}
              setTempoHoras={setTempoHoras}
              impressoras={impressoras}
            />

            <MultiMaterialSelector
              materials={materials}
              filamentos={filamentos}
              onAddMaterial={handleAddMaterial}
              onRemoveMaterial={handleRemoveMaterial}
              onUpdateMaterial={handleUpdateMaterial}
            />

            <ProductionCostParams
              tarifaKwh={tarifaKwh}
              setTarifaKwh={setTarifaKwh}
              depreciacaoHora={depreciacaoHora}
              setDepreciacaoHora={setDepreciacaoHora}
              taxaFalhaPorcento={taxaFalhaPorcento}
              setTaxaFalhaPorcento={setTaxaFalhaPorcento}
              custoMaoDeObra={custoMaoDeObra}
              setCustoMaoDeObra={setCustoMaoDeObra}
              margemLucroPorcento={margemLucroPorcento}
              setMargemLucroPorcento={setMargemLucroPorcento}
              marginRealPercent={calculationResult.marginRealPercent}
            />
          </div>

          {/* Coluna Lateral: Resumo de Custos e Ações */}
          <div>
            <PricingSummaryCard
              nomePeca={nomePeca}
              calculationResult={calculationResult}
              taxaFalhaPorcento={taxaFalhaPorcento}
              onSalvarOrcamento={() => handleSalvarProjeto('orcamento')}
              onAprovarProducao={() => handleSalvarProjeto('em_impressao')}
            />
          </div>
        </div>
      )}

      {/* ABA: SIMULADOR DE VARIAÇÕES (1 A 4 CORES) */}
      {activeTab === 'variacoes' && (
        <VariationsGrid
          nomePeca={nomePeca}
          variations={variations}
          onSelectVariation={(selectedMats, count) => {
            setMaterials(selectedMats);
            setActiveTab('calculadora');
            toast.success(`Configuração de ${count} cores carregada na calculadora principal!`);
          }}
        />
      )}

      {/* Modais Integrados */}
      <GcodeAnalyzerModal
        isOpen={gcodeModal}
        onClose={() => setGcodeModal(false)}
        onApplyData={handleApplyGcodeData}
      />

      <OrcamentoPdfModal
        isOpen={pdfModal}
        onClose={() => setPdfModal(false)}
        projeto={{
          nomePeca,
          clienteNome,
          materials,
          filamentoUtilizado: materials.map(m => `${m.filamentType} ${m.color} (${m.weightGrams}g)`).join(' + '),
          pesoEstimadoG: calculationResult.totalWeightGrams,
          tempoEstimadoHoras: tempoHoras,
          precoCobrado: calculationResult.suggestedPrice,
        }}
      />
    </div>
  );
};
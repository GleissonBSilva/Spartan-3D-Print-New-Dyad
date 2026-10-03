"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, FileCode, FileText, TrendingUp } from 'lucide-react';
import { useSaaSData } from '@/context/SaaSDataContext';
import { ProjectMaterial, ProjetoImpressao3D } from '@/types/saas';
import { PricingService, PricingCalculationResult } from '@/services/pricingService';
import { PieceDetailsForm } from './calculator/PieceDetailsForm';
import { MultiMaterialSelector } from './calculator/MultiMaterialSelector';
import { ProductionCostParams } from './calculator/ProductionCostParams';
import { PricingSummaryCard } from './calculator/PricingSummaryCard';
import { VariationsGrid } from './calculator/VariationsGrid';
import { GcodeAnalyzerModal } from './GcodeAnalyzerModal';
import { OrcamentoPdfModal } from './OrcamentoPdfModal';
import { toast } from 'sonner';
import { uploadModelFile } from '@/services/fileService';
import { useAuth } from '@/context/AuthContext';

export const Calculadora3D: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recalculateProject = location.state?.recalculateProject as ProjetoImpressao3D | undefined;
  const copyProject = location.state?.copyProject as ProjetoImpressao3D | undefined;
  const sourceProject = recalculateProject || copyProject;
  const { filamentos, impressoras, addProjeto, updateProjeto } = useSaaSData();
  const { user } = useAuth();

  // Dados Gerais do Projeto
  const [nomePeca, setNomePeca] = useState(sourceProject?.nomePeca || '');
  const [clienteNome, setClienteNome] = useState(recalculateProject ? recalculateProject.clienteNome : copyProject ? '' : '');
  const [tempoHoras, setTempoHoras] = useState(sourceProject?.tempoEstimadoHoras || 0);
  const [selectedImpressoraId, setSelectedImpressoraId] = useState(sourceProject?.impressoraId || impressoras[0]?.id || '');
  const [observacoes] = useState(sourceProject?.observacoes || '');

  // Parâmetros Financeiros e Operacionais
  const [tarifaKwh, setTarifaKwh] = useState(0.85);
  const [depreciacaoHora, setDepreciacaoHora] = useState(0.50);
  const [taxaFalhaPorcento, setTaxaFalhaPorcento] = useState(10);
  const [custoMaoDeObra, setCustoMaoDeObra] = useState(sourceProject?.custoMaoDeObra ?? 15.0);
  const [outrosCustos] = useState(sourceProject?.outrosCustos ?? 0.0);
  const [margemLucroPorcento, setMargemLucroPorcento] = useState(sourceProject?.margemLucroPercentual ?? 140);

  // Modais e Abas
  const [gcodeModal, setGcodeModal] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculadora' | 'variacoes'>('calculadora');

  // MATERIAIS SELECIONADOS (Até 4 cores/materiais)
  const [materials, setMaterials] = useState<ProjectMaterial[]>(sourceProject?.materials || []);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | undefined>(sourceProject?.arquivoPath);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [savingProject, setSavingProject] = useState(false);

  useEffect(() => {
    if (materials.length || !filamentos.length) return;
    const filament = filamentos[0];
    const costPerGram = filament.precoKg / 1000;
    setMaterials([{ id: crypto.randomUUID(), materialId: filament.id, materialName: `${filament.tipo} - ${filament.cor}`, color: filament.cor, colorHex: filament.corHex, filamentType: filament.tipo, weightGrams: 1, costPerGram, totalCost: Number(costPerGram.toFixed(2)) }]);
  }, [filamentos, materials.length]);
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
    if (!filamentos.length) {
      toast.error('Cadastre pelo menos um carretel no estoque antes de montar um orçamento.');
      return;
    }
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
  const handleApplyGcodeData = (data: { nome: string; peso: number; tempo: number; filePath?: string }) => {
    setNomePeca(data.nome);
    setTempoHoras(data.tempo);
    setUploadedFilePath(data.filePath);

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
  const handleSalvarProjeto = async (status: 'orcamento' | 'em_impressao') => {
    if (!nomePeca.trim()) {
      toast.error('Informe o nome da peça/projeto.');
      return;
    }
    if (!materials.length) {
      toast.error('Adicione um filamento real do seu estoque antes de salvar o orçamento.');
      return;
    }

    const matSummary = materials.map(m => `${m.filamentType} ${m.color} (${m.weightGrams}g)`).join(' + ');
    setSavingProject(true);
    try {
      if (imageFile && !user?.companyId) throw new Error('Sua conta não está vinculada a uma empresa.');
      const imagePath = imageFile && user?.companyId ? await uploadModelFile(imageFile, user.companyId) : undefined;
      const projectData = {
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
      status: recalculateProject?.status || status,
      observacoes,
      arquivoPath: uploadedFilePath || recalculateProject?.arquivoPath,
      imagemPath: imagePath || recalculateProject?.imagemPath,
      };
      const saved = recalculateProject
        ? await updateProjeto(recalculateProject.id, projectData)
        : addProjeto(projectData);
      if (saved) {
        setImageFile(null);
        if (recalculateProject) {
          toast.success('Custos e preço do projeto foram atualizados.');
          navigate('/cliente/projetos', { replace: true, state: null });
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível anexar a imagem ao projeto.');
    } finally {
      setSavingProject(false);
    }
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

      {recalculateProject && <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100"><strong>Recalculando projeto existente:</strong> {recalculateProject.nomePeca}. Ao salvar, o sistema atualiza os custos e o preço deste projeto sem criar uma cópia.</div>}
      {copyProject && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"><strong>Novo orçamento baseado em:</strong> {copyProject.nomePeca}. O projeto original será mantido; informe o cliente e ajuste os dados antes de salvar.</div>}

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
              imageFile={imageFile}
              setImageFile={setImageFile}
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
              saving={savingProject}
              recalculating={Boolean(recalculateProject)}
              copying={Boolean(copyProject)}
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

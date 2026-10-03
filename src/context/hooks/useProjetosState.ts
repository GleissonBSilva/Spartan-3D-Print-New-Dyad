import { useCallback, useEffect, useState } from 'react';
import { ProjetoImpressao3D, ProjectMaterial, Plan, Impressora3D } from '@/types/saas';
import { FeatureGatingService } from '@/services/featureGatingService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseProjetosStateProps {
  currentPlan: Plan;
  impressoras: Impressora3D[];
  refreshFilamentos: () => Promise<void>;
  refreshImpressoras: () => Promise<void>;
}

type ProjectRow = {
  id: string; part_name: string; customer_name: string; printer_id: string | null; materials: ProjectMaterial[];
  estimated_weight_g: number; estimated_hours: number; material_cost: number; energy_cost: number;
  depreciation_cost: number; labor_cost: number; other_cost: number; total_cost: number;
  margin_percent: number; charged_price: number; net_profit: number; status: ProjetoImpressao3D['status'];
  stock_deducted: boolean; notes: string | null; created_at: string;
  file_path: string | null;
  image_path: string | null;
  quantity: number; due_date: string | null;
};
const fromRow = (row: ProjectRow): ProjetoImpressao3D => ({
  id: row.id, nomePeca: row.part_name, clienteNome: row.customer_name, impressoraId: row.printer_id || undefined,
  pesoEstimadoG: Number(row.estimated_weight_g), tempoEstimadoHoras: Number(row.estimated_hours), quantidade: Number(row.quantity || 1), dataEntrega: row.due_date || undefined, materials: row.materials || [],
  custoMaterial: Number(row.material_cost), custoEnergia: Number(row.energy_cost), custoDepreciacao: Number(row.depreciation_cost),
  custoMaoDeObra: Number(row.labor_cost), outrosCustos: Number(row.other_cost), custoTotal: Number(row.total_cost),
  margemLucroPercentual: Number(row.margin_percent), precoCobrado: Number(row.charged_price), lucroLiquido: Number(row.net_profit),
  status: row.status, estoqueBaixado: row.stock_deducted, observacoes: row.notes || undefined,
  arquivoPath: row.file_path || undefined, imagemPath: row.image_path || undefined, dataCriacao: row.created_at.slice(0, 10),
});

export function useProjetosState({ currentPlan, impressoras, refreshFilamentos, refreshImpressoras }: UseProjetosStateProps) {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<ProjetoImpressao3D[]>([]);

  const refreshProjetos = useCallback(async () => {
    if (!user?.companyId || !supabase) { setProjetos([]); return; }
    const { data, error } = await supabase.from('spartan_projects').select('*').eq('company_id', user.companyId).order('created_at', { ascending: false });
    if (error) throw error;
    setProjetos((data as ProjectRow[]).map(fromRow));
  }, [user?.companyId]);

  useEffect(() => {
    void refreshProjetos().catch(error => toast.error(`Falha ao carregar projetos: ${error.message}`));
    if (!user?.companyId || !supabase) return;
    const channel = supabase.channel(`spartan-projects-${user.companyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spartan_projects', filter: `company_id=eq.${user.companyId}` }, () => {
        void refreshProjetos().catch(error => toast.error(`Falha ao sincronizar projetos: ${error.message}`));
      }).subscribe();
    const onFocus = () => { void refreshProjetos().catch(() => undefined); };
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('focus', onFocus); void supabase!.removeChannel(channel); };
  }, [refreshProjetos, user?.companyId]);

  const addProjeto = (proj: Omit<ProjetoImpressao3D, 'id' | 'dataCriacao' | 'estoqueBaixado'>): boolean => {
    const gate = FeatureGatingService.canAddProject(projetos.length, currentPlan);
    if (!gate.allowed) { toast.error(gate.status.message || 'Limite de projetos atingido.'); return false; }
    if (!user?.companyId || !supabase) { toast.error('Entre na conta para salvar o projeto.'); return false; }
    const startsProduction = proj.status === 'em_impressao';
    if (startsProduction && !proj.impressoraId) {
      toast.error('Selecione uma impressora antes de iniciar a produção.');
      return false;
    }
    if (proj.impressoraId) {
      const printer = impressoras.find(item => item.id === proj.impressoraId);
      if (!printer || printer.status === 'imprimindo' || printer.status === 'pausada' || printer.status === 'manutencao') {
        toast.error('Escolha uma impressora disponível antes de iniciar a produção.');
        return false;
      }
    }
    const productionStarted = startsProduction;
    void Promise.resolve(supabase.from('spartan_projects').insert({
      company_id: user.companyId, created_by: user.id, part_name: proj.nomePeca, customer_name: proj.clienteNome,
      printer_id: proj.impressoraId || null, materials: proj.materials, estimated_weight_g: proj.pesoEstimadoG,
      estimated_hours: proj.tempoEstimadoHoras, material_cost: proj.custoMaterial, energy_cost: proj.custoEnergia,
      depreciation_cost: proj.custoDepreciacao, labor_cost: proj.custoMaoDeObra || 0, other_cost: proj.outrosCustos || 0,
      total_cost: proj.custoTotal, margin_percent: proj.margemLucroPercentual || 0,
      charged_price: proj.precoCobrado, net_profit: proj.lucroLiquido, status: productionStarted ? 'orcamento' : proj.status,
      stock_deducted: false, notes: proj.observacoes || null, file_path: proj.arquivoPath || null,
      image_path: proj.imagemPath || null,
    }).select('*').single()).then(async ({ data, error }) => {
      if (error) throw error;
      const row = data as ProjectRow;
      if (productionStarted) {
        const { error: startError } = await supabase!.rpc('spartan_set_project_status', { p_project_id: row.id, p_status: proj.status });
        if (startError) throw startError;
        row.status = proj.status;
        row.stock_deducted = true;
      }
      const saved = fromRow(row);
      setProjetos(prev => [saved, ...prev]);
      if (productionStarted) await Promise.all([refreshFilamentos(), refreshImpressoras()]);
      toast.success(productionStarted ? `Projeto ${proj.nomePeca} salvo e produção iniciada.` : `Orçamento ${proj.nomePeca} salvo.`);
    }).catch(error => toast.error(`Não foi possível salvar o projeto: ${error.message}`));
    return true;
  };

  const updateProjetoStatus = (id: string, newStatus: ProjetoImpressao3D['status']) => {
    const project = projetos.find(item => item.id === id);
    if (!project || !supabase) return;
    const startsProduction = newStatus === 'em_impressao' && !project.estoqueBaixado;
    void (async () => {
      const { error } = await supabase!.rpc('spartan_set_project_status', { p_project_id: id, p_status: newStatus });
      if (error) throw error;
      await Promise.all([refreshFilamentos(), refreshImpressoras()]);
      setProjetos(prev => prev.map(item => item.id === id ? { ...item, status: newStatus, estoqueBaixado: startsProduction || (item.estoqueBaixado && newStatus !== 'cancelado') } : item));
      toast.success('Status do projeto atualizado.');
    })().catch(error => toast.error(`Não foi possível atualizar o projeto: ${error.message}`));
  };

  const updateProjeto = async (id: string, changes: Partial<ProjetoImpressao3D>): Promise<boolean> => {
    if (!user?.companyId || !supabase) { toast.error('Entre na conta para editar o projeto.'); return false; }
    const currentProject = projetos.find(project => project.id === id);
    const update = {
      ...(changes.nomePeca !== undefined ? { part_name: changes.nomePeca.trim() } : {}),
      ...(changes.clienteNome !== undefined ? { customer_name: changes.clienteNome.trim() } : {}),
      ...(changes.impressoraId !== undefined ? { printer_id: changes.impressoraId || null } : {}),
      ...(changes.quantidade !== undefined ? { quantity: changes.quantidade } : {}),
      ...(changes.dataEntrega !== undefined ? { due_date: changes.dataEntrega || null } : {}),
      ...(changes.materials !== undefined ? { materials: changes.materials } : {}),
      ...(changes.pesoEstimadoG !== undefined ? { estimated_weight_g: changes.pesoEstimadoG } : {}),
      ...(changes.tempoEstimadoHoras !== undefined ? { estimated_hours: changes.tempoEstimadoHoras } : {}),
      ...(changes.custoMaterial !== undefined ? { material_cost: changes.custoMaterial } : {}),
      ...(changes.custoEnergia !== undefined ? { energy_cost: changes.custoEnergia } : {}),
      ...(changes.custoDepreciacao !== undefined ? { depreciation_cost: changes.custoDepreciacao } : {}),
      ...(changes.custoMaoDeObra !== undefined ? { labor_cost: changes.custoMaoDeObra } : {}),
      ...(changes.outrosCustos !== undefined ? { other_cost: changes.outrosCustos } : {}),
      ...(changes.custoTotal !== undefined ? { total_cost: changes.custoTotal } : {}),
      ...(changes.margemLucroPercentual !== undefined ? { margin_percent: changes.margemLucroPercentual } : {}),
      ...(changes.precoCobrado !== undefined ? { charged_price: changes.precoCobrado } : {}),
      ...(changes.precoCobrado !== undefined ? { net_profit: Number((changes.precoCobrado - (changes.custoTotal ?? currentProject?.custoTotal ?? 0)).toFixed(2)) } : {}),
      ...(changes.observacoes !== undefined ? { notes: changes.observacoes || null } : {}),
      ...(changes.imagemPath !== undefined ? { image_path: changes.imagemPath || null } : {}),
    };
    if (!Object.keys(update).length) return true;
    try {
      const { data, error } = await supabase.from('spartan_projects').update(update)
        .eq('id', id).eq('company_id', user.companyId).select('*').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Sem permissão para editar este projeto.');
      const updated = fromRow(data as ProjectRow);
      setProjetos(prev => prev.map(item => item.id === id ? updated : item));
      toast.success('Projeto atualizado.');
      return true;
    } catch (error) {
      toast.error(`Não foi possível editar o projeto: ${error instanceof Error ? error.message : 'erro inesperado'}`);
      return false;
    }
  };

  const deleteProjeto = async (id: string): Promise<boolean> => {
    const project = projetos.find(item => item.id === id);
    if (!project || !user?.companyId || !supabase) return false;
    try {
      if (project.estoqueBaixado && (project.status === 'em_impressao' || project.status === 'aprovado')) {
        const { error: cancelError } = await supabase.rpc('spartan_set_project_status', { p_project_id: id, p_status: 'cancelado' });
        if (cancelError) throw cancelError;
      }
      const { data, error } = await supabase.from('spartan_projects').delete()
        .eq('id', id).eq('company_id', user.companyId).select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Sem permissão para excluir este projeto.');
      setProjetos(prev => prev.filter(item => item.id !== id));
      await Promise.all([refreshFilamentos(), refreshImpressoras()]);
      toast.success('Projeto excluído.');
      return true;
    } catch (error) {
      toast.error(`Não foi possível excluir o projeto: ${error instanceof Error ? error.message : 'erro inesperado'}`);
      return false;
    }
  };

  return { projetos, addProjeto, updateProjetoStatus, updateProjeto, deleteProjeto, refreshProjetos };
}

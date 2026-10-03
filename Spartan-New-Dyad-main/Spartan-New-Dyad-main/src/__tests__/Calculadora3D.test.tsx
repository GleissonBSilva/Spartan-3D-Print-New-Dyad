import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calculadora3D } from '../components/client/Calculadora3D';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock the contexts
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', companyName: 'Test Company' },
    updateUserProfile: jest.fn(),
  }),
}));

jest.mock('../context/SaaSDataContext', () => ({
  useSaaSData: () => ({
    filamentos: [
      { id: '1', tipo: 'PLA', cor: 'Preto', corHex: '#000000', precoKg: 95, pesoRestanteG: 1000 },
      { id: '2', tipo: 'PLA', cor: 'Branco', corHex: '#ffffff', precoKg: 105, pesoRestanteG: 1000 },
    ],
    impressoras: [
      { id: '1', nome: 'Ender 3', potenciaWatts: 350, status: 'imprimindo' },
    ],
    addProjeto: jest.fn(),
  }),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Calculadora3D', () => {
  it('renders the calculator component', () => {
    renderWithProviders(<Calculadora3D />);
    expect(screen.getByText(/Calculadora/i)).toBeInTheDocument();
  });

  it('displays initial values correctly', () => {
    renderWithProviders(<Calculadora3D />);
    expect(screen.getByDisplayValue('Luminária Voronoi Multicolor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mariana Silva')).toBeInTheDocument();
  });

  it('allows updating piece name', async () => {
    renderWithProviders(<Calculadora3D />);
    const input = screen.getByDisplayValue('Luminária Voronoi Multicolor');
    
    fireEvent.change(input, { target: { value: 'Nova Peça' } });
    
    await waitFor(() => {
      expect(input).toHaveValue('Nova Peça');
    });
  });

  it('displays pricing summary', () => {
    renderWithProviders(<Calculadora3D />);
    expect(screen.getByText(/Resumo de Custos/i)).toBeInTheDocument();
  });

  it('shows material selector with multiple materials', () => {
    renderWithProviders(<Calculadora3D />);
    expect(screen.getByText(/Multimaterial/i)).toBeInTheDocument();
  });
});
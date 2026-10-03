"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { RoleQuickSwitcher } from '@/components/layout/RoleQuickSwitcher';
import { useSaaSData } from '@/context/SaaSDataContext';
import { useAuth } from '@/context/AuthContext';

import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ProfitSimulatorSection } from '@/components/landing/ProfitSimulatorSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Index: React.FC = () => {
  const { plans } = useSaaSData();
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = (role: 'admin' | 'client') => {
    switchRole(role);
    navigate(role === 'admin' ? '/admin' : '/cliente');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      <PublicNavbar />
      
      <main className="flex-1">
        <HeroSection onDemoAccess={handleDemoAccess} />
        <FeaturesSection />
        <ProfitSimulatorSection />
        <PricingSection plans={plans} />
        <TestimonialsSection />
        <FaqSection />
      </main>

      <LandingFooter />
      <RoleQuickSwitcher />
    </div>
  );
};

export default Index;
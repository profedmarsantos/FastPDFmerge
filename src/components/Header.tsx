import React from 'react';
import appLogo from '../assets/images/logo.svg';

interface HeaderProps {
  onOpenDeployModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-30">
      <div className="w-full px-6 sm:px-10 h-14 flex items-center justify-between">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src={appLogo}
            alt="Logotipo Fast PDF Merge Educacional"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
          />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base tracking-tight text-neutral-900 leading-tight">
              Fast PDF Merge Educacional
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};



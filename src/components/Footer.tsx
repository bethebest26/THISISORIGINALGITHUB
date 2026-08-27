import React from 'react';
import { Globe } from 'lucide-react';

interface FooterProps {
  onCategoryClick?: (mainCategory: string, subCategory?: string) => void;
}

export default function Footer({ onCategoryClick }: FooterProps) {
  const handleCategoryClick = (e: React.MouseEvent, main: string, sub?: string) => {
    e.preventDefault();
    if (onCategoryClick) {
      onCategoryClick(main, sub);
    }
  };

  return (
    <footer className="bg-[#1c1d1f] text-gray-300 pt-8 pb-8 border-t border-gray-800 shrink-0 relative z-10 w-full mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-xl">
              B
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              BeTheBest
            </span>
          </div>
          <span className="text-sm">© 2026 BeTheBest | All Rights Reserved.</span>
        </div>

      </div>
    </footer>
  );
}

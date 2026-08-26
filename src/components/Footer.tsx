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
    <footer className="bg-[#1c1d1f] text-gray-300 pt-12 pb-8 border-t border-gray-800 shrink-0 relative z-10 w-full mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Banner */}
        <div className="flex flex-col items-center justify-center gap-6 pb-4">
          <h2 className="text-white font-bold text-xl text-center">
            Top companies choose BeTheBest to build in-demand career skills.
          </h2>
        </div>
        
        <hr className="border-gray-700 my-10" />

        {/* Main SEO Directory */}
        <div className="mb-10">
          <h3 className="text-white font-bold text-xl mb-8">Explore top Courses and Skills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
            {/* Column 1 */}
            <div className="space-y-6">
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Business")}
                >
                  Business
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Business", "Business Strategy")} className="hover:text-white transition-colors">Business Strategy</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Business", "Business Management")} className="hover:text-white transition-colors">Business Management</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Business", "Solopreneur")} className="hover:text-white transition-colors">Solopreneur</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Business", "Indie Hacker")} className="hover:text-white transition-colors">Indie Hacker</a></li>
                </ul>
              </div>
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Startup")}
                >
                  Startup
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Startup", "Lean Startup")} className="hover:text-white transition-colors">Lean Startup</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Startup", "Entrepreneurship")} className="hover:text-white transition-colors">Entrepreneurship</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Startup", "Fundraising")} className="hover:text-white transition-colors">Fundraising</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Startup", "Bootstrapping")} className="hover:text-white transition-colors">Bootstrapping</a></li>
                </ul>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Leadership")}
                >
                  Leadership
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Leadership", "Management")} className="hover:text-white transition-colors">Management</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Leadership", "Project Management")} className="hover:text-white transition-colors">Project Management</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Leadership", "Company Culture")} className="hover:text-white transition-colors">Company Culture</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Leadership", "CEO")} className="hover:text-white transition-colors">CEO</a></li>
                </ul>
              </div>
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Marketing")}
                >
                  Marketing
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Marketing", "Digital Marketing")} className="hover:text-white transition-colors">Digital Marketing</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Marketing", "SEO")} className="hover:text-white transition-colors">SEO</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Marketing", "Social Media Marketing")} className="hover:text-white transition-colors">Social Media Marketing</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Marketing", "Content Marketing")} className="hover:text-white transition-colors">Content Marketing</a></li>
                </ul>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Sales")}
                >
                  Sales
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Sales", "Business Development")} className="hover:text-white transition-colors">Business Development</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Sales", "Closing")} className="hover:text-white transition-colors">Closing</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Sales", "Negotiation")} className="hover:text-white transition-colors">Negotiation</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Sales", "Pitching")} className="hover:text-white transition-colors">Pitching</a></li>
                </ul>
              </div>
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Productivity")}
                >
                  Productivity
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Productivity", "Time Management")} className="hover:text-white transition-colors">Time Management</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Productivity", "Goal Setting")} className="hover:text-white transition-colors">Goal Setting</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Productivity", "Habit Creation")} className="hover:text-white transition-colors">Habit Creation</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Productivity", "Focus")} className="hover:text-white transition-colors">Focus</a></li>
                </ul>
              </div>
            </div>

            {/* Column 4 */}
            <div className="space-y-6">
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Growth")}
                >
                  Growth
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Growth", "Growth Hacking")} className="hover:text-white transition-colors">Growth Hacking</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Growth", "Conversion Rate Optimization")} className="hover:text-white transition-colors">Conversion Rate Optimization</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Growth", "User Retention")} className="hover:text-white transition-colors">User Retention</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Growth", "Viral Growth")} className="hover:text-white transition-colors">Viral Growth</a></li>
                </ul>
              </div>
              <div>
                <h4 
                  className="text-white font-bold mb-3 cursor-pointer hover:text-blue-400 transition-colors inline-block"
                  onClick={(e) => handleCategoryClick(e, "Attraction")}
                >
                  Attraction
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Attraction", "Dating")} className="hover:text-white transition-colors">Dating</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Attraction", "Relationships")} className="hover:text-white transition-colors">Relationships</a></li>
                  <li><a href="#" onClick={(e) => handleCategoryClick(e, "Attraction", "Social Presence")} className="hover:text-white transition-colors">Social Presence</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>



        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-700">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-xl">
              B
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              BeTheBest
            </span>
          </div>
          <span className="text-sm">© 2026 BeTheBest LLP | All Rights Reserved.</span>
        </div>

      </div>
    </footer>
  );
}

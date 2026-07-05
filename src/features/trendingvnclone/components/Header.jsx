import { useState } from 'react';
import { Menu, Globe, ChevronDown, User, Sparkles } from 'lucide-react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-lens-dark-blue text-white text-sm h-14 px-5 flex items-center justify-between relative select-none font-sans z-50">
      {/* Left: Brand Logo */}
      <div className="flex items-center space-x-3">
        <a href="#" className="flex items-center space-x-2">
          {/* Mock Lens Logo Icon */}
          <div className="w-6 h-6 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-950">
            <span className="text-[10px] font-bold text-cyan-400 font-sans">L</span>
          </div>
          <span className="font-sans font-extrabold text-[15px] tracking-wider text-white">
            LENS.ORG
          </span>
        </a>
      </div>

      {/* Middle/Right: Nav items on Desktop */}
      <nav className="hidden lg:flex items-center space-x-6">
        {/* Language Select */}
        <div className="flex items-center text-gray-300 hover:text-white cursor-pointer py-1 text-[13px]">
          <Globe className="w-3.5 h-3.5 mr-1" />
          <span>English - EN</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </div>

        {/* Dropdown Menus */}
        {['Our Apps', 'Pricing', 'About', 'Guest Work Area'].map((item) => (
          <div
            key={item}
            className="flex items-center text-gray-300 hover:text-white cursor-pointer py-1 text-[13px]"
          >
            <span>{item}</span>
            <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
          </div>
        ))}

        <div className="h-4 w-[1px] bg-gray-600 my-auto" />

        {/* Auth / Guest Area */}
        <div className="flex items-center space-x-4 text-[13px]">
          <a href="#" className="text-gray-300 hover:text-white">
            Register
          </a>
          <a
            href="#"
            className="text-gray-300 hover:text-white flex items-center space-x-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign in</span>
          </a>

          {/* User Status (Required replacement) */}
          <div className="flex items-center bg-cyan-950/80 text-cyan-400 border border-cyan-900 px-2.5 py-1 rounded text-[12px] font-semibold">
            <Sparkles className="w-3 h-3 mr-1" />
            <span>Signed in as Demo User</span>
          </div>

          <a href="#" className="text-gray-300 hover:text-white flex items-center">
            Support
            <ChevronDown className="w-3 h-3 ml-1" />
          </a>
        </div>
      </nav>

      {/* Mobile Burger Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden text-white hover:text-gray-300 p-1"
        aria-label="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-lens-dark-blue border-t border-gray-700 flex flex-col p-4 space-y-3 z-50 lg:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center text-gray-300 cursor-pointer text-[13px] justify-between border-b border-gray-800 pb-2">
            <span className="flex items-center"><Globe className="w-4 h-4 mr-2" /> Language</span>
            <span className="text-white">English - EN</span>
          </div>
          {['Our Apps', 'Pricing', 'About', 'Guest Work Area', 'Support'].map((item) => (
            <a key={item} href="#" className="text-gray-300 hover:text-white py-1.5 text-[13px] border-b border-gray-800/50 pb-2">
              {item}
            </a>
          ))}
          <div className="flex flex-col pt-2 space-y-2">
            <div className="flex items-center bg-cyan-950/80 text-cyan-400 border border-cyan-900 px-3 py-1.5 rounded text-[12px] font-semibold justify-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Signed in as Demo User</span>
            </div>
            <div className="flex justify-around text-[13px] pt-1">
              <a href="#" className="text-gray-300 hover:text-white">Register</a>
              <a href="#" className="text-gray-300 hover:text-white flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

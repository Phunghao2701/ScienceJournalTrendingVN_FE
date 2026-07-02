
export const Footer = () => {
  return (
    <footer className="bg-[#1F2F40] border-t border-[#15202C] text-[#9EA9B3] text-[13px] font-sans py-8 px-5 select-none w-full">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Left: Organization Info */}
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[14px] text-white tracking-wider">
              THE LENS
            </span>
            <span className="text-[11px] bg-slate-700/60 border border-slate-600 px-1.5 py-0.5 rounded text-gray-300 font-semibold select-none">
              Free & Open
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-[#818E9A]">
            The Lens is a project of <strong>Cambia</strong>, a global non-profit organization dedicated to democratizing science and technology. We integrate global patent and scholarly data to provide open discovery pipelines.
          </p>
        </div>

        {/* Right: Site Navigation Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-[12.8px] font-medium text-gray-300">
          {['About Us', 'Terms of Use', 'Privacy Policy', 'Data Sources', 'API Access', 'Contact Support'].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-white transition-colors cursor-pointer hover:underline"
            >
              {link}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto border-t border-slate-800/80 mt-6 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-[11px] text-[#72808E]">
        <p>© 2026 Lens.org. All rights reserved. Patents and scholarly records visual reference data.</p>
        <p>Serving 314M+ scholarly records and 150M+ patents globally.</p>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaDownload } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';

const PlokLogo = () => (
  <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 md:w-9 md:h-9">
    <rect width="100" height="100" rx="20" fill="#DC2626"/>
    <path d="M72 50L38 72L38 28L72 50Z" fill="#050505"/>
  </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaAlert, setShowPwaAlert] = useState(false);
  const navigate = useNavigate();
  const { showSearch } = useLayout();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);
    const isDismissed = localStorage.getItem('plok_pwa_dismissed') === 'true';

    if (isStandalone || isDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        if (!localStorage.getItem('plok_pwa_dismissed')) {
          setShowPwaAlert(true);
        }
      }, 4000);
    };

    const handleAppInstalled = () => {
      setShowPwaAlert(false);
      setDeferredPrompt(null);
      localStorage.setItem('plok_pwa_dismissed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('plok_pwa_dismissed', 'true');
      }
      setDeferredPrompt(null);
      setShowPwaAlert(false);
    }
  };

  const dismissPwa = () => {
    setShowPwaAlert(false);
    localStorage.setItem('plok_pwa_dismissed', 'true');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-red-600/40 selection:text-white">
      {showPwaAlert && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-[#111] border border-red-600/30 p-4 rounded-xl shadow-[0_20px_50px_rgba(220,38,38,0.2)] z-[9999] animate-fade-in flex items-start gap-4">
          <PlokLogo />
          <div className="flex-1">
            <h4 className="text-white font-black text-sm mb-1 uppercase tracking-wide">PlokStream App</h4>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed font-medium">Instal aplikasi untuk pengalaman menonton super cepat dan akses eksklusif langsung dari layar utama Anda.</p>
            <button onClick={handleInstallPwa} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded transition-all w-full active:scale-95">
              <FaDownload size={12} /> Instal Sekarang
            </button>
          </div>
          <button onClick={dismissPwa} className="text-slate-500 hover:text-white p-1 transition-colors"><FaTimes size={16} /></button>
        </div>
      )}

      <header 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ease-in-out ${
          isScrolled 
            ? 'bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' 
            : 'bg-gradient-to-b from-[#050505]/90 to-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-between gap-4 md:gap-8">
          <Link to="/" onClick={() => window.scrollTo(0,0)} className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 flex-shrink-0 z-50">
            <PlokLogo />
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white hidden sm:block uppercase">
              Plok<span className="text-red-600">Stream</span>
            </h1>
          </Link>
          
          {showSearch ? (
            <div className="flex-1 w-full max-w-3xl animate-fade-in z-50">
              <form onSubmit={handleSearchSubmit} className="relative group w-full">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari video premium..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 text-white rounded-md py-2.5 md:py-3 pl-11 pr-5 focus:outline-none focus:border-red-600/50 focus:bg-[#151515] focus:ring-2 focus:ring-red-600/20 transition-all placeholder-slate-500 text-sm md:text-base font-bold shadow-inner"
                />
              </form>
            </div>
          ) : (
            <div className="flex-1"></div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col pt-[70px] md:pt-[80px]">
        {children}
      </main>

      <footer className="bg-[#050505] border-t border-white/5 py-12 mt-auto flex flex-col items-center justify-center text-slate-500 relative z-40">
        <PlokLogo />
        <p className="mt-5 text-xs md:text-sm font-black tracking-widest uppercase text-slate-400">
          © {new Date().getFullYear()} PlokStream
        </p>
        <p className="text-[10px] md:text-xs mt-2 max-w-sm text-center leading-relaxed px-4 font-semibold">
          Platform VOD Premium Eksklusif
        </p>
      </footer>
    </div>
  );
};

export default Layout;
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, Sprout, Target, Eye, Heart } from 'lucide-react';
import logoIcon from '../assets/images/logos/coopromu-icon.webp';

interface DropdownItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  fullWidth?: boolean;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  isScrolled: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' as const },
  }),
};

function NavDropdown({ label, items, isScrolled }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const close = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(close, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown' && !isOpen) setIsOpen(true);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [close]);

  return (
    <div className="relative" ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          isScrolled ? 'text-slate-700 hover:text-green-700' : 'text-white hover:text-green-200'
        } ${isOpen ? (isScrolled ? 'text-green-700 bg-green-50' : 'text-white bg-white/15') : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} aria-hidden>
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 w-72 z-50"
            role="menu"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-40" />
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-200/60 overflow-hidden">
              <div className="grid grid-cols-2 gap-2 p-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.href + item.label}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={item.fullWidth ? 'col-span-2' : ''}
                  >
                    <button
                      onClick={() => {
                        close();
                        navigate(item.href);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); navigate(item.href); } }}
                      className={`group/item relative flex items-center gap-3 px-4 py-3.5 text-sm text-slate-700 hover:text-green-700 transition-colors overflow-hidden rounded-xl w-full text-left ${
                        item.fullWidth ? 'justify-center' : ''
                      }`}
                      role="menuitem"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-xl" />
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-center" />
                      {item.icon && (
                        <item.icon className="relative z-10 w-4 h-4 text-green-500 group-hover/item:text-green-600 transition-colors shrink-0" />
                      )}
                      <span className="relative z-10 font-medium">{item.label}</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileDropdown(null);
  }, [location.pathname]);

  const cooperativaItems: DropdownItem[] = [
    { label: 'Historia', href: '/cooperativa#historia', icon: Sprout },
    { label: 'Misión', href: '/cooperativa#mision', icon: Target },
    { label: 'Visión', href: '/cooperativa#vision', icon: Eye },
    { label: 'Valores', href: '/cooperativa#valores', icon: Heart, fullWidth: true },
  ];

  const navLinks: ({ label: string; href: string; items?: DropdownItem[] })[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Cooperativa', href: '', items: cooperativaItems },
    { label: 'Servicios', href: '/servicios' },
    { label: 'Productos', href: '/productos' },
    { label: 'Noticias', href: '/noticias' },
    { label: 'Trabaja con nosotros', href: '/trabaja-con-nosotros' },
    { label: 'Contáctenos', href: '/contacto' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg overflow-hidden ${isScrolled ? '' : 'bg-white/20'}`}>
              <img src={logoIcon} alt="COOPROMU" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold tracking-tight leading-tight ${isScrolled ? 'text-green-800' : 'text-white'}`}>
                COOPROMU
              </span>
              <span className={`text-[10px] leading-tight ${isScrolled ? 'text-green-600' : 'text-green-200'}`}>
                Cooperativa de Productores Municipales
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.items ? (
                <NavDropdown key={link.label} label={link.label} items={link.items} isScrolled={isScrolled} />
              ) : (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isScrolled
                      ? location.pathname === link.href
                        ? 'text-green-700 bg-green-50'
                        : 'text-slate-700 hover:text-green-700 hover:bg-green-50'
                      : location.pathname === link.href
                        ? 'text-white bg-white/20'
                        : 'text-white hover:text-green-200 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </button>
              )
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar men\u00FA' : 'Abrir men\u00FA'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-slate-700' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-700' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-green-100 shadow-2xl"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) =>
                link.items ? (
                  <div key={link.label}>
                    <button
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                        mobileDropdown === link.label
                          ? 'text-green-700 bg-green-50'
                          : 'text-slate-700 hover:bg-green-50/50'
                      }`}
                      onClick={() => setMobileDropdown(mobileDropdown === link.label ? null : link.label)}
                    >
                      <span>{link.label}</span>
                      <motion.span animate={{ rotate: mobileDropdown === link.label ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="w-4 h-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {mobileDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 mt-1 space-y-1 border-l-2 border-green-200 pl-3"
                        >
                          {link.items.map((item, i) => (
                            <motion.div
                              key={item.href + item.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <button
                                onClick={() => {
                                  navigate(item.href);
                                  setMobileMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2.5 text-sm text-slate-600 rounded-lg hover:bg-green-50 hover:text-green-700 hover:pl-5 transition-all"
                              >
                                {item.label}
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    key={link.href}
                    onClick={() => {
                      navigate(link.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      location.pathname === link.href
                        ? 'text-green-700 bg-green-50'
                        : 'text-slate-700 hover:bg-green-50/50 hover:text-green-700'
                    }`}
                  >
                    {link.label}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, Clock, Target, Eye, Flag, Heart, Wheat, Sprout, Beef, GraduationCap } from 'lucide-react';
import logoImg from '../assets/images/logos/teknycampo-icon.png';

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
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
};

function NavDropdown({ label, items, isScrolled }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          isScrolled ? 'text-slate-700 hover:text-green-700' : 'text-white hover:text-green-200'
        } ${isOpen ? (isScrolled ? 'text-green-700 bg-green-50' : 'text-white bg-white/15') : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
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
          >
            <div className="absolute -inset-0.5 bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-40" />
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-200/60 overflow-hidden">
              <div className="grid grid-cols-2 gap-2 p-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.href}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={item.fullWidth ? 'col-span-2' : ''}
                  >
                    <Link
                      to={item.href}
                      className={`group/item relative flex items-center gap-3 px-4 py-3.5 text-sm text-slate-700 hover:text-green-700 transition-colors overflow-hidden rounded-xl ${
                        item.fullWidth ? 'justify-center' : ''
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-xl" />
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 origin-center" />
                      {item.icon && (
                        <item.icon className="relative z-10 w-4 h-4 text-green-500 group-hover/item:text-green-600 transition-colors shrink-0" />
                      )}
                      <span className="relative z-10 font-medium">{item.label}</span>
                    </Link>
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileDropdown(null);
  }, [location.pathname]);

  const teknyItems: DropdownItem[] = [
    { label: 'Historia', href: '/#historia', icon: Clock },
    { label: 'Misión', href: '/#mision', icon: Target },
    { label: 'Visión', href: '/#vision', icon: Eye },
    { label: 'Objetivo General', href: '/#objetivos', icon: Flag },
    { label: 'Valores Corporativos', href: '/#valores', icon: Heart, fullWidth: true },
  ];

  const servicesItems: DropdownItem[] = [
    { label: 'Insumos Agropecuarios', href: '/servicios#insumos', icon: Wheat },
    { label: 'Soluciones Agrícolas', href: '/servicios#agricolas', icon: Sprout },
    { label: 'Soluciones Ganaderas', href: '/servicios#ganaderas', icon: Beef },
    { label: 'Capacitación y Acompañamiento', href: '/servicios#capacitacion', icon: GraduationCap },
  ];

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Tekny Campo', href: '', items: teknyItems },
    { label: 'Servicios', href: '', items: servicesItems },
    { label: 'Experiencia', href: '/productos' },
    { label: 'Noticias', href: '/noticias' },
    { label: 'Trabaja con Nosotros', href: '/trabaja-con-nosotros' },
    { label: 'Contacto', href: '/contacto' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg overflow-hidden ${isScrolled ? '' : 'bg-white/20'}`}>
              <img src={logoImg} alt="Tekny Campo" className="w-full h-full" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-green-800' : 'text-white'}`}>
              Tekny Campo
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.items ? (
                <NavDropdown key={link.label} label={link.label} items={link.items} isScrolled={isScrolled} />
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
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
                </Link>
              )
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
                      onClick={() =>
                        setMobileDropdown(mobileDropdown === link.label ? null : link.label)
                      }
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
                              key={item.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <Link
                                to={item.href}
                                className="block px-4 py-2.5 text-sm text-slate-600 rounded-lg hover:bg-green-50 hover:text-green-700 hover:pl-5 transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {item.label}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      location.pathname === link.href
                        ? 'text-green-700 bg-green-50'
                        : 'text-slate-700 hover:bg-green-50/50 hover:text-green-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

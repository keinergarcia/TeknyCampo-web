import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import logoImg from '../assets/images/logos/teknycampo-icon.png';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-700 rounded-lg overflow-hidden">
                <img src={logoImg} alt="Tekny Campo" className="w-full h-full" />
              </div>
              <span className="text-xl font-bold">Tekny Campo</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Trabajamos con compromiso, responsabilidad e innovación para fortalecer el sector rural colombiano, brindando soluciones integrales orientadas al desarrollo agrícola y ganadero.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors" aria-label="Facebook" title="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors" aria-label="Instagram" title="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors" aria-label="LinkedIn" title="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Inicio</Link>
              </li>
              <li>
                <Link to="/#historia" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Tekny Campo</Link>
              </li>
              <li>
                <Link to="/servicios" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Servicios</Link>
              </li>
              <li>
                <Link to="/productos" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Experiencia</Link>
              </li>
              <li>
                <Link to="/noticias" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Noticias</Link>
              </li>
              <li>
                <Link to="/contacto" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Contacto</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Servicios</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/servicios#insumos" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Insumos Agropecuarios</Link>
              </li>
              <li>
                <Link to="/servicios#agricolas" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Soluciones Agrícolas</Link>
              </li>
              <li>
                <Link to="/servicios#ganaderas" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Soluciones Ganaderas</Link>
              </li>
              <li>
                <Link to="/servicios#capacitacion" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Capacitación y Acompañamiento</Link>
              </li>
              <li>
                <Link to="/trabaja-con-nosotros" className="text-slate-400 hover:text-green-400 transition-colors text-sm">Trabaja con Nosotros</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">311 549 9784</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">Teknycampos@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-slate-400 text-sm">Ocaña, Norte de Santander, Colombia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Tekny Campo Soluciones Agropecuarias. "Tecnología al servicio del campo"
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
            aria-label="Volver arriba"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

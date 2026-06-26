import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { useScrollToHash } from './hooks/useScrollToHash';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Products from './components/Products';
import News from './components/News';
import WorkWithUs from './components/WorkWithUs';
import Contact from './components/Contact';
import Statistics from './components/Statistics';
import Indicators from './components/Indicators';
import Portfolio from './components/Portfolio';
import Community from './components/Community';

const CooperativaPage = lazy(() => import('./pages/CooperativaPage'));
const ServiciosPage = lazy(() => import('./pages/ServiciosPage'));
const ProductosPage = lazy(() => import('./pages/ProductosPage'));
const NoticiasPage = lazy(() => import('./pages/NoticiasPage'));
const NoticiaDetallePage = lazy(() => import('./pages/NoticiaDetallePage'));
const TrabajaConNosotrosPage = lazy(() => import('./pages/TrabajaConNosotrosPage'));
const ContactoPage = lazy(() => import('./pages/ContactoPage'));

function ScrollToHash() {
  useScrollToHash();
  return null;
}

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Statistics />
      <Services />
      <Products />
      <Indicators />
      <Portfolio />
      <Community />
      <News />
      <WorkWithUs />
      <Contact />
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-white">
        <button
          onClick={() => document.getElementById('main-content')?.focus()}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-green-700 focus:text-white focus:rounded-lg"
        >
          Saltar al contenido principal
        </button>
        <ScrollToHash />
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <MotionConfig reducedMotion="user">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cooperativa" element={<CooperativaPage />} />
                <Route path="/servicios" element={<ServiciosPage />} />
                <Route path="/productos" element={<ProductosPage />} />
                <Route path="/noticias" element={<NoticiasPage />} />
                <Route path="/noticias/:id" element={<NoticiaDetallePage />} />
                <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotrosPage />} />
                <Route path="/contacto" element={<ContactoPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          </MotionConfig>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;

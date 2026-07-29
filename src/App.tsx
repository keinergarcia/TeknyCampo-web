import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { SEO } from './components/SEO';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './components/admin/AdminLayout';

// Page-level lazy imports
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const WorkWithUsPage = lazy(() => import('./pages/WorkWithUsPage'));
const CapacitacionesPage = lazy(() => import('./pages/CapacitacionesPage'));
const AcercaDePage = lazy(() => import('./pages/AcercaDePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Home section lazy imports (below-the-fold)
const About = lazy(() => import('./components/About'));
const Services = lazy(() => import('./components/Services'));
const Products = lazy(() => import('./components/Products'));
const News = lazy(() => import('./components/News'));
const WorkWithUs = lazy(() => import('./components/WorkWithUs'));
const Contact = lazy(() => import('./components/Contact'));

const SectionFallback = () => <div className="h-64 animate-pulse bg-slate-50" />;
const Login = lazy(() => import('./pages/admin/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const UpdatePassword = lazy(() => import('./pages/admin/UpdatePassword').then(m => ({ default: m.UpdatePassword })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const ServiceList = lazy(() => import('./pages/admin/Services/ServiceList').then(m => ({ default: m.ServiceList })));
const ServiceForm = lazy(() => import('./pages/admin/Services/ServiceForm').then(m => ({ default: m.ServiceForm })));
const ExperienceList = lazy(() => import('./pages/admin/Experience/ExperienceList').then(m => ({ default: m.ExperienceList })));
const ExperienceForm = lazy(() => import('./pages/admin/Experience/ExperienceForm').then(m => ({ default: m.ExperienceForm })));
const EntityList = lazy(() => import('./pages/admin/Entities/EntityList').then(m => ({ default: m.EntityList })));
const EntityForm = lazy(() => import('./pages/admin/Entities/EntityForm').then(m => ({ default: m.EntityForm })));
const NewsList = lazy(() => import('./pages/admin/News/NewsList').then(m => ({ default: m.NewsList })));
const NewsForm = lazy(() => import('./pages/admin/News/NewsForm').then(m => ({ default: m.NewsForm })));
const TrainingList = lazy(() => import('./pages/admin/Trainings/TrainingList').then(m => ({ default: m.TrainingList })));
const TrainingForm = lazy(() => import('./pages/admin/Trainings/TrainingForm').then(m => ({ default: m.TrainingForm })));
const BenefitList = lazy(() => import('./pages/admin/Benefits/BenefitList').then(m => ({ default: m.BenefitList })));
const BenefitForm = lazy(() => import('./pages/admin/Benefits/BenefitForm').then(m => ({ default: m.BenefitForm })));
const JobList = lazy(() => import('./pages/admin/Jobs/JobList').then(m => ({ default: m.JobList })));
const JobForm = lazy(() => import('./pages/admin/Jobs/JobForm').then(m => ({ default: m.JobForm })));
const ApplicationList = lazy(() => import('./pages/admin/Applications/ApplicationList').then(m => ({ default: m.ApplicationList })));
const ApplicationForm = lazy(() => import('./pages/admin/Applications/ApplicationForm').then(m => ({ default: m.ApplicationForm })));
const ContactInfoForm = lazy(() => import('./pages/admin/ContactInfo/ContactInfoForm').then(m => ({ default: m.ContactInfoForm })));
const MessageDetail = lazy(() => import('./pages/admin/Messages/MessageDetail').then(m => ({ default: m.MessageDetail })));
const MessageList = lazy(() => import('./pages/admin/Messages/MessageList').then(m => ({ default: m.MessageList })));
const ContactInfoList = lazy(() => import('./pages/admin/ContactInfo/ContactInfoList').then(m => ({ default: m.ContactInfoList })));
const HeroStatsList = lazy(() => import('./pages/admin/Hero/HeroStatsList').then(m => ({ default: m.HeroStatsList })));
const HeroStatsForm = lazy(() => import('./pages/admin/Hero/HeroStatsForm').then(m => ({ default: m.HeroStatsForm })));
const AboutSectionList = lazy(() => import('./pages/admin/About/AboutSectionList').then(m => ({ default: m.AboutSectionList })));
const WhyChooseUsList = lazy(() => import('./pages/admin/WhyChooseUs/WhyChooseUsList').then(m => ({ default: m.WhyChooseUsList })));
const WhyChooseUsForm = lazy(() => import('./pages/admin/WhyChooseUs/WhyChooseUsForm').then(m => ({ default: m.WhyChooseUsForm })));
const SocialLinkList = lazy(() => import('./pages/admin/SocialLinks/SocialLinkList').then(m => ({ default: m.SocialLinkList })));
const SiteConfigPage = lazy(() => import('./pages/admin/SiteConfig/SiteConfigPage').then(m => ({ default: m.SiteConfigPage })));

function RedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      navigate(redirect, { replace: true });
    }
  }, [navigate]);
  return null;
}

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <RedirectHandler />
      <ScrollToHash />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tekny Campo Soluciones Agropecuarias',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: 'Soluciones agropecuarias innovadoras para el campo colombiano. Insumos, tecnología, capacitación y asistencia técnica.',
  address: { '@type': 'PostalAddress', addressCountry: 'CO' },
};

function Home() {
  return (
    <>
      <SEO
        title="Inicio"
        description="Tekny Campo Soluciones Agropecuarias — Tecnología al servicio del campo. Insumos, sistemas de riego, nutrición animal, asistencia técnica y capacitación para productores colombianos."
        jsonLd={organizationSchema}
      />
      <Hero />
      <Suspense fallback={<SectionFallback />}>
        <About />
        <Services />
        <Products />
        <News />
        <WorkWithUs />
        <Contact />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <div className="min-h-screen bg-white">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/servicios" element={<ServicesPage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/noticias" element={<NewsPage />} />
              <Route path="/capacitaciones" element={<CapacitacionesPage />} />
              <Route path="/acerca-de/:section" element={<AcercaDePage />} />
              <Route path="/trabaja-con-nosotros" element={<WorkWithUsPage />} />
              <Route path="/contacto" element={<ContactPage />} />
            </Route>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/update-password" element={<UpdatePassword />} />
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="services" element={<ServiceList />} />
              <Route path="services/new" element={<ServiceForm />} />
              <Route path="services/edit/:id" element={<ServiceForm />} />
              <Route path="experience" element={<ExperienceList />} />
              <Route path="experience/new" element={<ExperienceForm />} />
              <Route path="experience/edit/:id" element={<ExperienceForm />} />
              <Route path="entities" element={<EntityList />} />
              <Route path="entities/new" element={<EntityForm />} />
              <Route path="entities/edit/:id" element={<EntityForm />} />
              <Route path="news" element={<NewsList />} />
              <Route path="news/new" element={<NewsForm />} />
              <Route path="news/edit/:id" element={<NewsForm />} />
              <Route path="trainings" element={<TrainingList />} />
              <Route path="trainings/new" element={<TrainingForm />} />
              <Route path="trainings/edit/:id" element={<TrainingForm />} />
              <Route path="benefits" element={<BenefitList />} />
              <Route path="benefits/new" element={<BenefitForm />} />
              <Route path="benefits/edit/:id" element={<BenefitForm />} />
              <Route path="jobs" element={<JobList />} />
              <Route path="jobs/new" element={<JobForm />} />
              <Route path="jobs/edit/:id" element={<JobForm />} />
              <Route path="applications" element={<ApplicationList />} />
              <Route path="applications/:id" element={<ApplicationForm />} />
              <Route path="messages" element={<MessageList />} />
              <Route path="messages/:id" element={<MessageDetail />} />
              <Route path="contact-info" element={<ContactInfoList />} />
              <Route path="contact-info/new" element={<ContactInfoForm />} />
              <Route path="contact-info/edit/:id" element={<ContactInfoForm />} />
              <Route path="hero" element={<HeroStatsList />} />
              <Route path="hero/new" element={<HeroStatsForm />} />
              <Route path="hero/edit/:id" element={<HeroStatsForm />} />
              <Route path="about" element={<AboutSectionList />} />
              <Route path="why-choose-us" element={<WhyChooseUsList />} />
              <Route path="why-choose-us/new" element={<WhyChooseUsForm />} />
              <Route path="why-choose-us/edit/:id" element={<WhyChooseUsForm />} />
              <Route path="social-links" element={<SocialLinkList />} />
              <Route path="site-config" element={<SiteConfigPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;

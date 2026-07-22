import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getAboutSections, getWhyChooseUs } from '../lib/public';
import type { PublicAboutSection, PublicWhyChooseUs } from '../lib/public';

function SectionCard({ icon: Icon, title, children, delay = 0 }: {
  icon: React.ElementType; title: string; children: React.ReactNode; delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
    >
      <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-green-700" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <div className="text-slate-600 leading-relaxed">{children}</div>
    </motion.div>
  );
}

function renderContent(section: PublicAboutSection) {
  if (section.sectionKey === 'valores') {
    const items = section.content.split('\n').filter(Boolean);
    return (
      <ul className="space-y-2">
        {items.map((item, i) => {
          const colonIdx = item.indexOf(': ');
          if (colonIdx > 0) {
            const label = item.slice(0, colonIdx);
            const desc = item.slice(colonIdx + 2);
            return (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <span><strong>{label}:</strong> {desc}</span>
              </li>
            );
          }
          return (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    );
  }
  const paragraphs = section.content.split('\n\n').filter(Boolean);
  return paragraphs.map((p, i) => (
    <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
  ));
}

function AboutSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100 animate-pulse">
          <div className="w-14 h-14 bg-slate-200 rounded-xl mb-5" />
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
          </div>
        </div>
      ))}
      <div className="bg-green-800 rounded-2xl p-8 animate-pulse">
        <div className="h-6 bg-green-700/50 rounded w-2/3 mb-4" />
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-700/50 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-green-700/50 rounded w-1/2" />
                <div className="h-3 bg-green-700/50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const [aboutSections, setAboutSections] = useState<PublicAboutSection[]>([]);
  const [whyChoose, setWhyChoose] = useState<PublicWhyChooseUs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getAboutSections(), getWhyChooseUs()])
      .then(([sections, items]) => {
        if (!mounted) return;
        setAboutSections(sections);
        setWhyChoose(items);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const hasData = aboutSections.length > 0;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
            Sobre Nosotros
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Tekny Campo Soluciones Agropecuarias
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Trabajamos con compromiso, responsabilidad e innovación para fortalecer el sector rural colombiano,
            brindando soluciones integrales orientadas al desarrollo agrícola y ganadero.
          </p>
        </motion.div>

        {loading && <AboutSkeleton />}

        {!loading && hasData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {aboutSections.map((section, idx) => (
              <SectionCard
                key={section.id}
                icon={section.icon}
                title={section.title}
                delay={Math.min(idx * 0.1, 0.2)}
              >
                {renderContent(section)}
              </SectionCard>
            ))}
            {whyChoose.length > 0 && (
              <div className="bg-green-800 rounded-2xl p-8 text-white flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-4">¿Por qué elegirnos?</h3>
                <div className="space-y-4">
                  {whyChoose.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-green-200">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

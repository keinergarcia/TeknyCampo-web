import { useState } from 'react';
import { submitApplication } from '../lib/supabase';

interface JobFormData {
  nombre: string;
  email: string;
  telefono: string;
  cargo: string;
  mensaje: string;
}

export function useJobForm() {
  const [formData, setFormData] = useState<JobFormData>({
    nombre: '',
    email: '',
    telefono: '',
    cargo: '',
    mensaje: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const { error: err } = await submitApplication({ ...formData, archivo: file });
      if (err) throw err;
      setSubmitted(true);
    } catch {
      setError('Error al enviar la postulación. Intente nuevamente.');
    } finally {
      setSending(false);
    }
  };

  const jobOptions = [
    { value: 'ingeniero', label: 'Ingeniero Agrónomo' },
    { value: 'asesor', label: 'Asesor Técnico Comercial' },
    { value: 'nutricion', label: 'Especialista en Nutrición Animal' },
    { value: 'tecnico', label: 'Técnico de Campo' },
    { value: 'coordinador', label: 'Coordinador de Capacitación' },
    { value: 'analista', label: 'Analista de Calidad' },
    { value: 'otro', label: 'Otro' },
  ];

  return { formData, file, submitted, sending, error, jobOptions, handleChange, handleFileChange, handleSubmit };
}

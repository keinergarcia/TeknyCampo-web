import { useState } from 'react';
import { submitContact } from '../lib/supabase';

interface ContactFormData {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const { error: err } = await submitContact(formData);
      if (err) throw err;
      setSubmitted(true);
    } catch {
      setError('Error al enviar el mensaje. Intente nuevamente.');
    } finally {
      setSending(false);
    }
  };

  return { formData, submitted, sending, error, handleChange, handleSubmit };
}

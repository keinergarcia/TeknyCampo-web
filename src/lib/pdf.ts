import { jsPDF } from 'jspdf';

export function downloadApplicationPdf(application: {
  nombre: string;
  email: string;
  telefono: string;
  cedula: string | null;
  cargo: string;
  mensaje: string | null;
  cv_url: string | null;
  status: string;
  created_at: string;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Postulación - TeknyCampo', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(application.created_at).toLocaleDateString('es-CO')}`, 14, 30);

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.line(14, 33, pageWidth - 14, 33);

  let y = 42;
  const leftX = 14;
  const labelX = 60;
  const lineHeight = 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(application.nombre, labelX, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(application.email, labelX, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(application.telefono, labelX, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Cédula:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(application.cedula || 'No registrada', labelX, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Cargo de interés:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(application.cargo, labelX, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Estado:', leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(application.status, labelX, y);
  y += lineHeight * 1.5;

  if (application.mensaje) {
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.3);
    doc.line(leftX, y - 2, pageWidth - 14, y - 2);
    doc.setFont('helvetica', 'bold');
    doc.text('Mensaje:', leftX, y + 4);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(application.mensaje, pageWidth - 28);
    doc.text(lines, leftX, y + 12);
  }

  doc.save(`postulacion-${application.nombre.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}

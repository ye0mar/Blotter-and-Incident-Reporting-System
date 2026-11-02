import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, X, FileText } from 'lucide-react';
import { BlotterRecord } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Base64 image helper for crisp PDF generation
const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 120;
        canvas.height = img.naturalHeight || img.height || 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(url);
        }
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
};

export const downloadBlotterPDF = async (b: BlotterRecord) => {
  const typesText = b.incident_types && b.incident_types.length > 0 
    ? b.incident_types.join(', ') 
    : (b.incident_type || 'Blotter Incident');

  const staAnaLogoBase64 = await getBase64ImageFromUrl('/santa-ana-logo.png');
  const paterosLogoBase64 = await getBase64ImageFromUrl('/pateros-logo.png');

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = 'Arial, sans-serif';

  container.innerHTML = `
    <!-- Header Letterhead with Dual Logos -->
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
      <div style="width: 80px; text-align: left; flex-shrink: 0;">
        <img src="${staAnaLogoBase64}" style="width: 70px; height: 70px; object-fit: contain;" alt="Barangay Sta. Ana Logo" />
      </div>
      <div style="text-align: center; flex-grow: 1; padding: 0 12px;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; color: #475569;">Republic of the Philippines</p>
        <p style="margin: 2px 0; font-size: 11px; text-transform: uppercase; color: #475569;">Metro Manila — Municipality of Pateros</p>
        <h2 style="margin: 4px 0; font-size: 20px; color: #0d3461; text-transform: uppercase; font-weight: 800;">BARANGAY STA. ANA</h2>
        <p style="margin: 0; font-size: 10px; color: #64748b;">Office of the Punong Barangay / Lupong Tagapamayapa</p>
      </div>
      <div style="width: 80px; text-align: right; flex-shrink: 0;">
        <img src="${paterosLogoBase64}" style="width: 70px; height: 70px; object-fit: contain;" alt="Municipality of Pateros Logo" />
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; font-weight: 800;">
        OFFICIAL BARANGAY BLOTTER RECORD
      </h1>
      <p style="margin: 4px 0 0; font-size: 12px; color: #64748b; font-style: italic;">
        Record of Incident &amp; Formal Complaint Entry
      </p>
    </div>

    <!-- Metadata Grid -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; background: #f8fafc; border: 1px solid #cbd5e1;">
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b; font-weight: bold; width: 25%;">Blotter Entry No:</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold;">${b.blotter_id || 'PENDING SUBMISSION'}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b; font-weight: bold; width: 25%;">Date &amp; Time Reported:</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold;">${b.reported_at || new Date().toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b; font-weight: bold;">Incident Type:</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #1e40af; font-weight: bold;">${typesText}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b; font-weight: bold;">Current Status:</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold; text-transform: uppercase;">${b.status || 'Pending'}</td>
      </tr>
    </table>

    <!-- Parties Involved -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; color: #334155;">
            NAG-UULAT (COMPLAINANT)
          </div>
          <p style="margin: 4px 0;"><strong>Pangalan:</strong> ${b.complainant_name || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Tirahan:</strong> ${b.complainant_address || 'Sta. Ana, Pateros'}</p>
          <p style="margin: 4px 0;"><strong>Telepono:</strong> ${b.complainant_phone || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Ugnayan:</strong> ${b.complainant_relation || 'Complainant'}</p>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; color: #334155;">
            IPINAGSUSUMBONG (RESPONDENT)
          </div>
          <p style="margin: 4px 0;"><strong>Pangalan:</strong> ${b.respondent_name || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Tirahan:</strong> ${b.respondent_address || 'Sta. Ana, Pateros'}</p>
          <p style="margin: 4px 0;"><strong>Telepono:</strong> ${b.respondent_phone || 'N/A'}</p>
        </td>
      </tr>
    </table>

    <!-- Narrative -->
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; color: #334155;">
      SALAYSAY NG PANGYAYARI (NARRATIVE OF INCIDENT)
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 6px 10px;"><strong>Lugar ng Pangyayari:</strong> ${b.incident_location || 'Barangay Sta. Ana, Pateros'}</td>
        <td style="padding: 6px 10px;"><strong>Petsa at Oras:</strong> ${b.incident_datetime || 'N/A'}</td>
      </tr>
    </table>
    <div style="border: 1px solid #cbd5e1; background: #fafafa; padding: 12px; font-style: italic; line-height: 1.5; margin-bottom: 20px; font-size: 12px; color: #1e293b; border-radius: 6px;">
      "${b.incident_description || 'Walang ibinigay na detalyadong salaysay.'}"
    </div>

    <!-- Actions & Notes -->
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; color: #334155;">
      AKSYON NG BARANGAY &amp; OPISYAL NA TALA
    </div>
    <div style="font-size: 11px; margin-bottom: 20px;">
      <p style="margin-bottom: 6px;"><strong>Mga Ginawang Aksyon:</strong></p>
      ${
        b.actions && b.actions.length > 0
          ? b.actions.map(act => `<span style="display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 4px; margin-right: 6px; margin-bottom: 4px;">✓ ${act}</span>`).join(' ')
          : '<span style="color: #94a3b8;">Walang naitalang aksyon</span>'
      }
    </div>

    ${
      b.attachments && b.attachments.length > 0
        ? `<div style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; color: #334155;">
            NAKALAKIP NA EBIDENSYA (${b.attachments.length})
           </div>
           <div style="font-size: 11px; margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px;">
             ${b.attachments.map(att => `
               <div style="margin-bottom: 6px;">
                 <strong>📁 ${att.file_name}</strong> ${att.file_size ? `(${att.file_size})` : ''}
               </div>
             `).join('')}
           </div>`
        : ''
    }

    <!-- Signatures -->
    <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-size: 11px;">
      <div style="width: 45%;">
        <div style="border-bottom: 1px solid #000; width: 220px; margin: 0 auto; height: 32px; line-height: 32px; font-weight: bold;">
          ${b.complainant_name || ''}
        </div>
        <div style="font-weight: bold; margin-top: 6px; text-transform: uppercase; color: #0f172a;">Lagda ng Nag-uulat</div>
        <div style="color: #64748b;">Complainant / Affiant</div>
      </div>
      <div style="width: 45%;">
        <div style="border-bottom: 1px solid #000; width: 220px; margin: 0 auto; height: 32px; line-height: 32px; font-weight: bold;">
          ${b.assigned_to_name || b.official_name || 'Barangay Official'}
        </div>
        <div style="font-weight: bold; margin-top: 6px; text-transform: uppercase; color: #0f172a;">Opisyal ng Barangay</div>
        <div style="color: #64748b;">Duty Desk Officer / Punong Barangay</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 2) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Barangay_Blotter_${b.blotter_id || 'Draft'}.pdf`);
  } catch (err) {
    console.error('Failed to export PDF:', err);
  } finally {
    document.body.removeChild(container);
  }
};

export const downloadBlotterDocument = (b: BlotterRecord) => {
  const typesText = b.incident_types && b.incident_types.length > 0 
    ? b.incident_types.join(', ') 
    : (b.incident_type || 'Blotter Incident');

  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Official Barangay Blotter Record - ${b.blotter_id || 'Draft'}</title>
<style>
  body { font-family: 'Times New Roman', Times, Georgia, serif; color: #1e293b; padding: 40px; margin: 0 auto; max-width: 800px; line-height: 1.5; background: #fff; }
  .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
  .header p { margin: 2px 0; font-size: 12px; text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: 0.5px; }
  .header h2 { margin: 6px 0; font-size: 20px; color: #0d3461; text-transform: uppercase; font-weight: 800; font-family: Arial, sans-serif; }
  .header h1 { margin: 12px 0 4px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1; }
  .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
  .meta-label { color: #64748b; font-weight: bold; width: 25%; }
  .meta-val { color: #0f172a; font-weight: bold; }
  .section-title { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; color: #334155; }
  .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 12px; }
  .grid-table td { width: 50%; vertical-align: top; padding: 10px; border: 1px solid #e2e8f0; }
  .narrative-box { border: 1px solid #cbd5e1; background: #fafafa; padding: 15px; font-style: italic; line-height: 1.6; margin-bottom: 20px; white-space: pre-wrap; font-size: 13px; }
  .actions-box { font-family: Arial, sans-serif; font-size: 12px; margin-bottom: 25px; }
  .action-badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 4px; margin-right: 6px; margin-bottom: 6px; }
</style>
</head>
<body>
  <div class="header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px;">
    <img src="/santa-ana-logo.png" style="width: 70px; height: 70px; object-fit: contain; flex-shrink: 0;" alt="Barangay Sta. Ana Logo">
    <div style="text-align: center; padding: 0 10px;">
      <p style="margin: 2px 0; font-size: 11px; text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: 0.5px; font-weight: 600;">Republic of the Philippines</p>
      <p style="margin: 2px 0; font-size: 11px; text-transform: uppercase; font-family: Arial, sans-serif; color: #475569;">Metro Manila — Municipality of Pateros</p>
      <h2 style="margin: 4px 0; font-size: 18px; color: #0d3461; text-transform: uppercase; font-weight: 800; font-family: Arial, sans-serif;">BARANGAY STA. ANA</h2>
      <p style="margin: 2px 0; font-size: 10px; color: #64748b; font-family: Arial, sans-serif;">Office of the Punong Barangay / Lupong Tagapamayapa</p>
    </div>
    <img src="/pateros-logo.png" style="width: 70px; height: 70px; object-fit: contain; flex-shrink: 0;" alt="Pateros Logo" onError="this.src='/pateros-logo.svg'">
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Blotter Entry No:</td>
      <td class="meta-val">${b.blotter_id || 'PENDING SUBMISSION'}</td>
      <td class="meta-label">Date &amp; Time Reported:</td>
      <td class="meta-val">${b.reported_at || new Date().toLocaleString()}</td>
    </tr>
    <tr>
      <td class="meta-label">Incident Type:</td>
      <td class="meta-val">${typesText}</td>
      <td class="meta-label">Current Status:</td>
      <td class="meta-val" style="text-transform: uppercase;">${b.status || 'Pending'}</td>
    </tr>
  </table>

  <table class="grid-table">
    <tr>
      <td>
        <div class="section-title">NAG-UULAT (COMPLAINANT)</div>
        <p><strong>Pangalan:</strong> ${b.complainant_name || 'N/A'}</p>
        <p><strong>Tirahan:</strong> ${b.complainant_address || 'Sta. Ana, Pateros'}</p>
        <p><strong>Telepono:</strong> ${b.complainant_phone || 'N/A'}</p>
        <p><strong>Ugnayan:</strong> ${b.complainant_relation || 'Complainant'}</p>
      </td>
      <td>
        <div class="section-title">IPINAGSUSUMBONG (RESPONDENT)</div>
        <p><strong>Pangalan:</strong> ${b.respondent_name || 'N/A'}</p>
        <p><strong>Tirahan:</strong> ${b.respondent_address || 'Sta. Ana, Pateros'}</p>
        <p><strong>Telepono:</strong> ${b.respondent_phone || 'N/A'}</p>
      </td>
    </tr>
  </table>

  <div class="section-title">SALAYSAY NG PANGYAYARI (NARRATIVE OF INCIDENT)</div>
  <table class="meta-table" style="margin-bottom: 8px;">
    <tr>
      <td class="meta-label">Lugar ng Pangyayari:</td>
      <td class="meta-val">${b.incident_location || 'Barangay Sta. Ana, Pateros'}</td>
      <td class="meta-label">Petsa at Oras:</td>
      <td class="meta-val">${b.incident_datetime || 'N/A'}</td>
    </tr>
  </table>
  <div class="narrative-box">
    "${b.incident_description || 'Walang ibinigay na detalyadong salaysay.'}"
  </div>

  <div class="section-title">AKSYON NG BARANGAY &amp; OPISYAL NA TALA</div>
  <div class="actions-box">
    <p style="margin-bottom: 8px;"><strong>Mga Ginawang Aksyon:</strong></p>
    ${
      b.actions && b.actions.length > 0
        ? b.actions.map(act => `<span class="action-badge">✓ ${act}</span>`).join(' ')
        : '<span style="color: #94a3b8;">Walang naitalang aksyon</span>'
    }
  </div>

  <table style="width: 100%; margin-top: 45px; font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
    <tr>
      <td style="width: 50%; padding: 20px;">
        <div style="border-bottom: 1px solid #000; width: 220px; margin: 0 auto; height: 32px; line-height: 32px;">
          ${b.complainant_name || ''}
        </div>
        <div style="font-weight: bold; margin-top: 6px; text-transform: uppercase;">Lagda ng Nag-uulat</div>
        <div style="color: #64748b;">Complainant / Affiant</div>
      </td>
      <td style="width: 50%; padding: 20px;">
        <div style="border-bottom: 1px solid #000; width: 220px; margin: 0 auto; height: 32px; line-height: 32px;">
          ${b.assigned_to_name || b.official_name || 'Barangay Official'}
        </div>
        <div style="font-weight: bold; margin-top: 6px; text-transform: uppercase;">Opisyal ng Barangay</div>
        <div style="color: #64748b;">Duty Desk Officer / Punong Barangay</div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Barangay_Blotter_${b.blotter_id || 'Draft'}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const PrintDossierModal: React.FC = () => {
  const { dossierBlotter, setDossierBlotter } = useApp();

  if (!dossierBlotter) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    downloadBlotterDocument(dossierBlotter);
  };

  const handleDownloadPdf = () => {
    downloadBlotterPDF(dossierBlotter);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Header Controls (Matches image_f1813966.png) */}
        <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-slate-200/80 gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A] bg-[#EFF6FF] border border-[#DBEAFE] px-3 py-1.5 rounded-lg" style={{ fontFamily: "'Urbanist', 'Quicksand', sans-serif" }}>
              OFFICIAL BLOTTER RECORD
            </span>
            <span className="text-xs text-[#64748B] font-mono font-medium">Case #{dossierBlotter.blotter_id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDoc}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#1E40AF] text-xs font-semibold rounded-full border border-[#93C5FD] transition-all cursor-pointer shadow-xs hover:-translate-y-0.5"
              title="Download Document (.doc)"
            >
              <Download className="w-4 h-4 text-[#1E40AF]" />
              <span>Download (.doc)</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C8CF8] hover:bg-[#6366F1] text-white text-xs font-semibold rounded-full transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
              title="Download PDF Document"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-full transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
            <button
              onClick={() => setDossierBlotter(null)}
              className="p-2 text-[#94A3B8] hover:text-[#475569] hover:bg-slate-100 rounded-full transition-colors cursor-pointer ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="space-y-6 text-slate-900 font-serif">
          
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-between gap-3 sm:gap-6 mb-2 px-2 sm:px-6 mx-auto max-w-2xl">
              <img 
                src="/santa-ana-logo.png" 
                alt="Barangay Sta. Ana Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
              />
              <div className="text-center font-sans flex-1">
                <p className="text-xs tracking-wider uppercase text-slate-600 font-semibold">Republic of the Philippines</p>
                <p className="text-xs uppercase text-slate-700 font-medium">Metro Manila — Municipality of Pateros</p>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0d3461] uppercase tracking-wide">
                  BARANGAY STA. ANA
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">Office of the Punong Barangay / Lupong Tagapamayapa</p>
              </div>
              <img 
                src="/pateros-logo.png" 
                alt="Municipality of Pateros Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/pateros-logo.svg';
                }}
              />
            </div>
            <div className="mt-4 pt-2 border-t border-slate-200">
              <h1 className="text-lg font-black uppercase tracking-widest text-slate-900">
                OFFICIAL BARANGAY BLOTTER RECORD
              </h1>
              <div className="flex justify-center mt-4 mb-2">
                <img src="/assets/aistudio/image_93ce2a4d.png" alt="Barangay Asset" className="max-w-xs h-auto" />
              </div>
              <p className="text-xs text-slate-500 font-sans italic mt-0.5">
                Record of Incident &amp; Formal Complaint Entry
              </p>
            </div>
          </div>

          {/* Record Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">Blotter Entry No:</span>{' '}
              <span className="font-bold text-slate-900">{dossierBlotter.blotter_id}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Date &amp; Time Reported:</span>{' '}
              <span className="font-semibold text-slate-900">{dossierBlotter.reported_at}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Incident Type:</span>{' '}
              <span className="font-bold text-blue-900">
                {dossierBlotter.incident_types && dossierBlotter.incident_types.length > 0 
                  ? dossierBlotter.incident_types.join(', ')
                  : dossierBlotter.incident_type
                }
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Current Status:</span>{' '}
              <span className="font-bold uppercase tracking-wide text-slate-800">
                {dossierBlotter.status}
              </span>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {/* Complainant */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1 mb-2.5">
                NAG-UULAT (COMPLAINANT)
              </h3>
              <div className="space-y-1.5 text-xs text-slate-800">
                <p><span className="text-slate-500 font-medium">Pangalan:</span> <span className="font-semibold">{dossierBlotter.complainant_name}</span></p>
                <p><span className="text-slate-500 font-medium">Tirahan:</span> {dossierBlotter.complainant_address || 'Sta. Ana, Pateros'}</p>
                <p><span className="text-slate-500 font-medium">Telepono:</span> {dossierBlotter.complainant_phone || 'N/A'}</p>
                <p><span className="text-slate-500 font-medium">Ugnayan:</span> {dossierBlotter.complainant_relation || 'Complainant'}</p>
              </div>
            </div>

            {/* Respondent */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1 mb-2.5">
                IPINAGSUSUMBONG (RESPONDENT)
              </h3>
              <div className="space-y-1.5 text-xs text-slate-800">
                <p><span className="text-slate-500 font-medium">Pangalan:</span> <span className="font-semibold">{dossierBlotter.respondent_name}</span></p>
                <p><span className="text-slate-500 font-medium">Tirahan:</span> {dossierBlotter.respondent_address || 'Sta. Ana, Pateros'}</p>
                <p><span className="text-slate-500 font-medium">Telepono:</span> {dossierBlotter.respondent_phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Incident Narrative */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1 mb-3">
              SALAYSAY NG PANGYAYARI (NARRATIVE OF INCIDENT)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3 text-slate-600 bg-slate-50 p-2.5 rounded-lg">
              <div><span className="font-semibold text-slate-800">Lugar:</span> {dossierBlotter.incident_location}</div>
              <div><span className="font-semibold text-slate-800">Petsa at Oras:</span> {dossierBlotter.incident_datetime}</div>
            </div>
            <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-line font-serif italic bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              "{dossierBlotter.incident_description}"
            </p>
          </div>

          {/* Barangay Action & Investigation Notes */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1 mb-3">
              AKSYON NG BARANGAY &amp; OPISYAL NA TALA
            </h3>
            
            <div className="space-y-2 mb-4">
              <div className="text-xs font-semibold text-slate-700">Mga Ginawang Aksyon:</div>
              <div className="flex flex-wrap gap-1.5">
                {dossierBlotter.actions && dossierBlotter.actions.length > 0 ? (
                  dossierBlotter.actions.map((act, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md border border-blue-100">
                      ✓ {act}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Walang naitalang aksyon</span>
                )}
              </div>
            </div>

            {dossierBlotter.notes && dossierBlotter.notes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700">Tala ng Pagsisiyasat (Investigation Notes):</div>
                {dossierBlotter.notes.map(note => (
                  <div key={note.id} className="text-xs text-slate-600 p-2.5 bg-slate-50 rounded-lg">
                    <span className="font-semibold text-slate-800">{note.noted_by_name} ({note.created_at}):</span> {note.notes}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attached Evidence & Photos Section */}
          {dossierBlotter.attachments && dossierBlotter.attachments.length > 0 && (
            <div className="p-5 rounded-xl border border-slate-200 bg-white font-sans">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-1 mb-3">
                NAKALAKIP NA EBIDENSYA / ATTACHED EVIDENCE ({dossierBlotter.attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dossierBlotter.attachments.map((att, idx) => (
                  <div key={att.id || idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {att.previewUrl || att.isImage ? (
                      <img
                        src={att.previewUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'}
                        alt={att.file_name}
                        className="w-14 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-900 truncate">{att.file_name}</div>
                      {att.file_size && <div className="text-[11px] text-slate-500">{att.file_size}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures Footer */}
          <div className="grid grid-cols-2 gap-8 pt-8 font-sans">
            <div className="text-center">
              <div className="border-b border-slate-900 mx-auto w-48 h-12 flex items-end justify-center pb-1">
                <span className="font-serif italic text-xs text-slate-700">{dossierBlotter.complainant_name}</span>
              </div>
              <p className="text-xs font-bold uppercase mt-1 text-slate-800">Lagda ng Nag-uulat</p>
              <p className="text-[11px] text-slate-500">Complainant / Affiant</p>
            </div>

            <div className="text-center">
              <div className="border-b border-slate-900 mx-auto w-48 h-12 flex items-end justify-center pb-1">
                <span className="font-serif italic text-xs text-slate-700">
                  {dossierBlotter.assigned_to_name || dossierBlotter.official_name || 'Kagawad Juan'}
                </span>
              </div>
              <p className="text-xs font-bold uppercase mt-1 text-slate-800">Opisyal ng Barangay</p>
              <p className="text-[11px] text-slate-500">Duty Desk Officer / Punong Barangay</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

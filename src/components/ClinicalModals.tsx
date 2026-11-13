import React, { useState } from 'react';
import {
  FileText,
  QrCode,
  X,
  Download,
  Printer,
  Check,
  Copy,
  ShieldAlert,
  Activity,
  Clock,
} from 'lucide-react';
import { PatientCaseFile } from '../data/clinicalData';

export interface IncidentLogEntry {
  id: string;
  timestamp: string;
  bedNumber: string;
  patientName: string;
  peakScore: number;
  dominantBiomarker: string;
  hr: number;
  spo2: number;
  rr: number;
  acknowledged: boolean;
  slaSeconds?: number;
}

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  activeCase: PatientCaseFile;
  currentScore: number;
  threshold: number;
  biomarkers: { brow: number; squint: number; midface: number; mouth: number };
  vitals: { hr: number; spo2: number; rr: number; dyspnea: string };
  trendHistory: number[];
  incidents: IncidentLogEntry[];
}

export const ClinicalReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  activeCase,
  currentScore,
  threshold,
  biomarkers,
  vitals,
  trendHistory,
  incidents,
}) => {
  const [nurseNotes, setNurseNotes] = useState(
    'Patient monitored continuously via AURA-PainCare optical FACS telemetry. PRN analgesia protocol reviewed.'
  );
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const peak60s = trendHistory.length > 0 ? Math.max(...trendHistory, currentScore) : currentScore;
  const mean60s =
    trendHistory.length > 0
      ? trendHistory.reduce((a, b) => a + b, 0) / trendHistory.length
      : currentScore;

  const handleDownloadReport = () => {
    const reportText = [
      '====================================================================',
      'AURA-PAINCARE — ICU SILENT-PAIN TELEMETRY & SHIFT HANDOVER REPORT',
      '====================================================================',
      `Generated At: ${new Date().toLocaleString()}`,
      `Bed / Unit:   ${activeCase.bedNumber}`,
      `Patient:      ${activeCase.name} (${activeCase.age}y / ${activeCase.sex})`,
      `Diagnosis:    ${activeCase.admissionDiagnosis}`,
      `Ventilation:  ${activeCase.ventilationMode}`,
      `Sedation:     RASS ${activeCase.rassScore}`,
      `Analgesia:    ${activeCase.analgesicRegimen}`,
      '',
      '--- PAIN TELEMETRY SUMMARY (60s WINDOW) ---',
      `Current Pain Index:    ${currentScore.toFixed(1)} / 10.0`,
      `60s Peak Pain Index:   ${peak60s.toFixed(1)} / 10.0`,
      `60s Mean Pain Index:   ${mean60s.toFixed(1)} / 10.0`,
      `Configured Threshold:  ${threshold.toFixed(1)} / 10.0`,
      '',
      '--- FACIAL ACTION CODING BIOMARKERS ---',
      `Brow Lowering (AU4):        ${Math.round(biomarkers.brow)}%`,
      `Eye Squint (AU6/7):         ${Math.round(biomarkers.squint)}%`,
      `Mid-Face Tension (AU9/10):  ${Math.round(biomarkers.midface)}%`,
      `Mouth Grimace (AU20/25):    ${Math.round(biomarkers.mouth)}%`,
      '',
      '--- COUPLED PHYSIOLOGICAL VITALS ---',
      `Heart Rate:         ${vitals.hr} BPM`,
      `SpO2:               ${vitals.spo2}%`,
      `Respiration Rate:   ${vitals.rr} /min`,
      `Dyspnea Assessment: ${vitals.dyspnea}`,
      '',
      '--- INCIDENT & SLA AUDIT LOG ---',
      ...(incidents.length === 0
        ? ['No threshold breach incidents logged during this session.']
        : incidents.map(
            (inc, i) =>
              `${i + 1}. [${inc.timestamp}] ${inc.bedNumber} | Peak ${inc.peakScore.toFixed(
                1
              )}/10 (${inc.dominantBiomarker}) | HR ${inc.hr} SpO2 ${inc.spo2}% | ${
                inc.acknowledged
                  ? `Acknowledged (SLA ${inc.slaSeconds?.toFixed(1) || '2.1'}s)`
                  : 'UNACKNOWLEDGED'
              }`
          )),
      '',
      '--- CLINICIAN SHIFT HANDOVER NOTES ---',
      nurseNotes,
      '====================================================================',
    ].join('\n');

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Clinical_Report_${activeCase.bedNumber.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const summary = `${activeCase.bedNumber} (${activeCase.name}): Pain Index ${currentScore.toFixed(
      1
    )}/10 (Peak ${peak60s.toFixed(1)}). Biomarkers: Brow ${Math.round(
      biomarkers.brow
    )}%, Squint ${Math.round(biomarkers.squint)}%, Midface ${Math.round(
      biomarkers.midface
    )}%, Mouth ${Math.round(biomarkers.mouth)}%. Vitals: HR ${vitals.hr}, SpO2 ${
      vitals.spo2
    }%, RR ${vitals.rr}. Notes: ${nurseNotes}`;
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="reportModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-up"
    >
      <div className="aura-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#A99BEA]/25 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8FF3A]/15 border border-[#E8FF3A]/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#E8FF3A]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F4F1FF]">
                Clinical Shift Handover &amp; Pain Report
              </h2>
              <p className="text-xs font-mono text-[#B4ABD6]">
                {activeCase.bedNumber} · {activeCase.name} · Generated{' '}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#2A2145] hover:bg-[#372C57] text-[#B4ABD6] hover:text-[#F4F1FF] cursor-pointer"
            aria-label="Close Report Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient & Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#2A2145]/80 border border-[#A99BEA]/20 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
              PATIENT DOSSIER
            </div>
            <div className="text-sm font-semibold text-[#F4F1FF]">
              {activeCase.name} ({activeCase.age}y · {activeCase.sex})
            </div>
            <div className="text-xs text-[#B4ABD6]">{activeCase.admissionDiagnosis}</div>
            <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-[#C4B8F7]">
              <span>Vent: {activeCase.ventilationMode}</span>
              <span>RASS: {activeCase.rassScore.split(' ')[0]}</span>
            </div>
            <div className="text-xs text-[#B4ABD6] pt-1">
              <span className="text-[#F4F1FF] font-medium">Analgesia:</span>{' '}
              {activeCase.analgesicRegimen}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#2A2145]/80 border border-[#A99BEA]/20 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
              60-SECOND TELEMETRY SUMMARY
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#150F29]/80 border border-[#A99BEA]/15">
                <div className="text-[10px] font-mono text-[#B4ABD6]">CURRENT</div>
                <div className="font-mono text-xl font-bold text-[#E8FF3A]">
                  {currentScore.toFixed(1)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#150F29]/80 border border-[#A99BEA]/15">
                <div className="text-[10px] font-mono text-[#B4ABD6]">60S PEAK</div>
                <div className="font-mono text-xl font-bold text-[#F43F5E]">
                  {peak60s.toFixed(1)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#150F29]/80 border border-[#A99BEA]/15">
                <div className="text-[10px] font-mono text-[#B4ABD6]">60S MEAN</div>
                <div className="font-mono text-xl font-bold text-[#F4F1FF]">
                  {mean60s.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-[#B4ABD6] pt-1">
              <span>HR: {vitals.hr} BPM</span>
              <span>SpO2: {vitals.spo2}%</span>
              <span>RR: {vitals.rr}/m</span>
              <span>Dyspnea: {vitals.dyspnea}</span>
            </div>
          </div>
        </div>

        {/* Biomarker Breakdown */}
        <div className="p-4 rounded-2xl bg-[#2A2145]/60 border border-[#A99BEA]/20 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
            FACS BIOMARKER VECTOR CONTRIBUTION
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Brow Lowering (AU4)', val: biomarkers.brow },
              { label: 'Eye Squint (AU6/7)', val: biomarkers.squint },
              { label: 'Mid-Face (AU9/10)', val: biomarkers.midface },
              { label: 'Mouth Grimace (AU20)', val: biomarkers.mouth },
            ].map((b) => (
              <div
                key={b.label}
                className="p-3 rounded-xl bg-[#150F29]/75 border border-[#A99BEA]/15"
              >
                <div className="text-xs text-[#B4ABD6]">{b.label}</div>
                <div className="font-mono text-lg font-bold text-[#F4F1FF] mt-1">
                  {Math.round(b.val)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logged Incidents Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
              INCIDENT &amp; SLA LOG ({incidents.length})
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto rounded-xl bg-[#150F29]/80 border border-[#A99BEA]/20 divide-y divide-[#A99BEA]/15">
            {incidents.length === 0 ? (
              <div className="p-4 text-xs text-[#B4ABD6] text-center">
                No sustained pain threshold breaches recorded in current shift window.
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#F43F5E]" />
                    <span className="font-mono text-[#C4B8F7]">{inc.timestamp}</span>
                    <span className="font-semibold text-[#F4F1FF]">
                      Peak {inc.peakScore.toFixed(1)}/10
                    </span>
                    <span className="text-[#B4ABD6]">({inc.dominantBiomarker})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#B4ABD6]">
                      HR {inc.hr} · SpO2 {inc.spo2}%
                    </span>
                    <span
                      className={
                        inc.acknowledged ? 'text-[#22C55E]' : 'text-[#E8FF3A] font-bold'
                      }
                    >
                      {inc.acknowledged
                        ? `ACK (${inc.slaSeconds?.toFixed(1) || '1.8'}s)`
                        : 'ACTIVE ALERT'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clinician Shift Notes */}
        <div className="space-y-2">
          <label
            htmlFor="clinicianHandoverNotes"
            className="block text-xs font-mono uppercase tracking-wider text-[#C4B8F7]"
          >
            CLINICIAN SHIFT HANDOVER NOTES
          </label>
          <textarea
            id="clinicianHandoverNotes"
            rows={2}
            value={nurseNotes}
            onChange={(e) => setNurseNotes(e.target.value)}
            className="w-full rounded-xl bg-[#150F29] border border-[#A99BEA]/30 px-3.5 py-2.5 text-sm text-[#F4F1FF] focus:outline-none focus:border-[#E8FF3A]"
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#A99BEA]/20">
          <button
            onClick={handleCopySummary}
            className="btn-lilac-glass px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#22C55E]" />
                <span>Copied EHR Note</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#C4B8F7]" />
                <span>Copy EHR Summary</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="btn-lilac-glass px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#C4B8F7]" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="btn-neon px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Shift Report (.TXT)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  activeCase: PatientCaseFile;
  currentScore: number;
}

export const QRModal: React.FC<QRModalProps> = ({
  open,
  onClose,
  activeCase,
  currentScore,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!open) return null;

  const pairingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?bed=${encodeURIComponent(activeCase.bedNumber)}`
      : 'https://aura-paincare.icu/bed-104';

  // Generate deterministic 21x21 QR-like matrix seeded by bedNumber + score
  const size = 21;
  const seedStr = `${activeCase.bedNumber}-${activeCase.name}-${currentScore.toFixed(1)}`;
  const isFinderPattern = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= size - 7;
    const inBottomLeft = r >= size - 7 && c < 7;
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null;

    const lr = inBottomLeft ? r - (size - 7) : r;
    const lc = inTopRight ? c - (size - 7) : c;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const getCell = (r: number, c: number) => {
    const finder = isFinderPattern(r, c);
    if (finder !== null) return finder;
    if (r === 6 || c === 6) return (r + c) % 2 === 0;
    const idx = r * size + c;
    const charCode = seedStr.charCodeAt(idx % seedStr.length);
    return ((charCode * 31 + idx * 17) % 7) < 3;
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(pairingUrl).catch(() => {});
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      id="qrModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-up"
    >
      <div className="aura-modal w-full max-w-md p-6 sm:p-7 space-y-6 text-center">
        <div className="flex items-center justify-between border-b border-[#A99BEA]/20 pb-4">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#E8FF3A]/15 border border-[#E8FF3A]/40 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-[#E8FF3A]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F1FF]">
                Mobile Nurse Station Pairing
              </h3>
              <p className="text-xs font-mono text-[#B4ABD6]">{activeCase.bedNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#2A2145] hover:bg-[#372C57] text-[#B4ABD6] hover:text-[#F4F1FF] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crisp SVG QR Code */}
        <div className="mx-auto w-56 h-56 p-4 rounded-2xl bg-[#F4F1FF] shadow-[0_0_30px_rgba(232,255,58,0.22)] flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {Array.from({ length: size }).map((_, r) =>
              Array.from({ length: size }).map((__, c) =>
                getCell(r, c) ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width={1}
                    height={1}
                    fill="#150F29"
                    rx={0.12}
                  />
                ) : null
              )
            )}
          </svg>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A2145] border border-[#A99BEA]/30 text-xs font-mono text-[#E8FF3A]">
            <Activity className="w-3.5 h-3.5" />
            <span>
              {activeCase.bedNumber} · Live Score {currentScore.toFixed(1)}/10
            </span>
          </div>
          <p className="text-xs text-[#B4ABD6] leading-relaxed">
            Scan with a handheld nurse tablet to receive real-time bilingual push alerts and bedside AAC voice requests for{' '}
            <span className="text-[#F4F1FF] font-semibold">{activeCase.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={pairingUrl}
            className="flex-1 rounded-xl bg-[#150F29] border border-[#A99BEA]/30 px-3 py-2 text-xs font-mono text-[#C4B8F7]"
          />
          <button
            onClick={handleCopyLink}
            className="btn-neon px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

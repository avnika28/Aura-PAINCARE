import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Stethoscope,
  Pill,
  AlertCircle,
  Sliders,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { PATIENT_CASE_FILES, PatientCaseFile } from '../data/clinicalData';

interface PatientsTabProps {
  activeCaseId: string;
  onSelectPatientCase: (patientCase: PatientCaseFile) => void;
  lang: 'en' | 'hi' | 'both';
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  activeCaseId,
  onSelectPatientCase,
  lang,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeCaseId || PATIENT_CASE_FILES[0].id);
  const [query, setQuery] = useState('');

  const filteredCases = PATIENT_CASE_FILES.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.bedNumber.toLowerCase().includes(q) ||
      c.admissionDiagnosis.toLowerCase().includes(q)
    );
  });

  const activeDossier =
    PATIENT_CASE_FILES.find((c) => c.id === selectedId) || PATIENT_CASE_FILES[0];

  return (
    <div id="tab-patients" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
      {/* Left 5 Columns: 10 Case Files Directory */}
      <div className="lg:col-span-5 aura-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#A99BEA]/20 pb-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
              ICU CLINICAL DOSSIERS (10)
            </div>
            <h2 className="text-lg font-bold text-[#F4F1FF]">
              Non-Verbal Patient Case Files
            </h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#B4ABD6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by patient, bed, or diagnosis..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1E1638] border border-[#A99BEA]/30 text-xs text-[#F4F1FF] placeholder-[#B4ABD6] focus:outline-none focus:border-[#C4B8F7]"
          />
        </div>

        {/* Scrollable List of 10 Patient Cases */}
        <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
          {filteredCases.map((file) => {
            const isSelected = file.id === activeDossier.id;
            const isLoadedInMonitor = file.id === activeCaseId;
            return (
              <button
                key={file.id}
                onClick={() => setSelectedId(file.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2A2145] border-[#E8FF3A] shadow-[0_0_20px_rgba(232,255,58,0.18)]'
                    : 'bg-[#1E1638]/80 border-[#A99BEA]/20 hover:border-[#C4B8F7]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#C4B8F7]">
                    {file.bedNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isLoadedInMonitor && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E8FF3A] text-[#150F29]">
                        MONITORED
                      </span>
                    )}
                    <span className="font-mono text-xs text-[#B4ABD6]">
                      Thr {file.recommendedThreshold.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="text-base font-bold text-[#F4F1FF] mt-1">
                  {file.name}{' '}
                  <span className="text-xs font-normal text-[#B4ABD6]">
                    ({file.age}y · {file.sex})
                  </span>
                </div>
                <div className="text-xs text-[#B4ABD6] line-clamp-1 mt-0.5">
                  {file.admissionDiagnosis}
                </div>
                {lang !== 'en' && (
                  <div className="font-hindi text-[11px] text-[#C4B8F7] mt-0.5">
                    {file.admissionDiagnosisHi}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 7 Columns: Active Patient Case File Inspection */}
      <div className="lg:col-span-7 aura-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#A99BEA]/20 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1E1638] border border-[#E8FF3A]/50 flex items-center justify-center font-mono text-xl font-bold text-[#E8FF3A]">
              {activeDossier.initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1E1638] border border-[#A99BEA]/30 text-[#C4B8F7]">
                  {activeDossier.bedNumber}
                </span>
                <span className="text-xs font-mono text-[#B4ABD6]">
                  {activeDossier.age} yrs · {activeDossier.sex}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F4F1FF] mt-1">
                {activeDossier.name}
              </h2>
              {lang !== 'en' && (
                <p className="font-hindi text-sm text-[#C4B8F7]">
                  {activeDossier.admissionDiagnosisHi}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onSelectPatientCase(activeDossier)}
            className="btn-neon px-5 py-3 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Load into Live Monitor →</span>
          </button>
        </div>

        {/* Clinical Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#1E1638]/85 border border-[#A99BEA]/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C4B8F7]">
              <Stethoscope className="w-4 h-4 text-[#E8FF3A]" />
              <span>PRIMARY ICU DIAGNOSIS</span>
            </div>
            <p className="text-sm font-semibold text-[#F4F1FF]">
              {activeDossier.admissionDiagnosis}
            </p>
            <p className="text-xs text-[#B4ABD6]">
              Non-Verbal Etiology: {activeDossier.nonVerbalReason}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E1638]/85 border border-[#A99BEA]/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C4B8F7]">
              <Activity className="w-4 h-4 text-[#E8FF3A]" />
              <span>VENTILATION &amp; SEDATION</span>
            </div>
            <p className="text-sm font-semibold text-[#F4F1FF]">
              {activeDossier.ventilationMode}
            </p>
            <p className="text-xs text-[#B4ABD6]">
              RASS: {activeDossier.rassScore} · Baseline CPOT: {activeDossier.cpotBaseline}/8
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E1638]/85 border border-[#A99BEA]/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C4B8F7]">
              <Pill className="w-4 h-4 text-[#E8FF3A]" />
              <span>ACTIVE ANALGESIC PROTOCOL</span>
            </div>
            <p className="text-sm font-semibold text-[#F4F1FF]">
              {activeDossier.analgesicRegimen}
            </p>
            <p className="text-xs text-[#F43F5E] inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Allergies: {activeDossier.allergies}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E1638]/85 border border-[#A99BEA]/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C4B8F7]">
              <Sliders className="w-4 h-4 text-[#E8FF3A]" />
              <span>CALIBRATED ALARM PRESET</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-[#E8FF3A]">
                {activeDossier.recommendedThreshold.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#B4ABD6]">/ 10.0 Threshold</span>
            </div>
            <p className="text-xs text-[#B4ABD6]">
              Base Vitals: HR {activeDossier.baseVitals.hr} · SpO2{' '}
              {activeDossier.baseVitals.spo2}% · RR {activeDossier.baseVitals.rr}/m
            </p>
          </div>
        </div>

        {/* FACS Biomarker Signature & Clinical Notes */}
        <div className="p-5 rounded-2xl bg-[#1E1638] border border-[#A99BEA]/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E8FF3A]">
            <FileCheck2 className="w-4 h-4" />
            <span>PATIENT-SPECIFIC FACS BIOMARKER SIGNATURE &amp; DIRECTIVES</span>
          </div>
          <p className="text-sm text-[#F4F1FF] font-medium leading-relaxed">
            {activeDossier.keyBiomarkerSignature}
          </p>
          <p className="text-xs text-[#B4ABD6] leading-relaxed border-t border-[#A99BEA]/15 pt-3">
            {activeDossier.clinicalNotes}
          </p>
        </div>
      </div>
    </div>
  );
};

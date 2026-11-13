import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  HeartPulse,
  Search,
  Wind,
  Volume2,
} from 'lucide-react';
import { WardBed } from '../data/clinicalData';
import { MedicalAudioAlarm } from '../services/MedicalAudioAlarm';

interface ICUWardTabProps {
  beds: WardBed[];
  activeBedId: string;
  onSelectBedForMonitor: (bed: WardBed) => void;
  onAcknowledgeBed: (bedId: string) => void;
  lang: 'en' | 'hi' | 'both';
}

type WardFilter = 'all' | 'critical' | 'moderate' | 'stable' | 'ventilated';

export const ICUWardTab: React.FC<ICUWardTabProps> = ({
  beds,
  activeBedId,
  onSelectBedForMonitor,
  onAcknowledgeBed,
  lang,
}) => {
  const [filter, setFilter] = useState<WardFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getSeverityMeta = (score: number) => {
    if (score >= 8) {
      return {
        label: 'CRITICAL',
        color: '#F43F5E',
        bg: 'rgba(244, 63, 94, 0.15)',
        cardClass: 'aura-card-critical',
      };
    }
    if (score >= 6) {
      return {
        label: 'SEVERE',
        color: '#FB923C',
        bg: 'rgba(251, 146, 60, 0.15)',
        cardClass: 'aura-card-severe',
      };
    }
    if (score >= 3) {
      return {
        label: 'MODERATE',
        color: '#FBBF24',
        bg: 'rgba(251, 191, 36, 0.15)',
        cardClass: '',
      };
    }
    return {
      label: 'STABLE',
      color: '#22C55E',
      bg: 'rgba(34, 197, 94, 0.15)',
      cardClass: '',
    };
  };

  const filteredBeds = beds
    .filter((b) => {
      if (filter === 'critical') return b.painScore >= 6;
      if (filter === 'moderate') return b.painScore >= 3 && b.painScore < 6;
      if (filter === 'stable') return b.painScore < 3;
      if (filter === 'ventilated') return b.ventilated;
      return true;
    })
    .filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.bedNumber.toLowerCase().includes(q) ||
        b.patientName.toLowerCase().includes(q) ||
        b.diagnosis.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.painScore - a.painScore);

  const criticalCount = beds.filter((b) => b.painScore >= 6).length;
  const moderateCount = beds.filter((b) => b.painScore >= 3 && b.painScore < 6).length;
  const stableCount = beds.filter((b) => b.painScore < 3).length;

  return (
    <div id="tab-ward" className="space-y-6 animate-fade-up">
      {/* Top Ward Filter & Acuity Summary Bar */}
      <div className="aura-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
            CENTRAL ICU TELEMETRY MATRIX · 10 BEDS
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F4F1FF]">
            Ward Acuity &amp; Silent-Pain Triage
          </h2>
          {lang !== 'en' && (
            <p className="font-hindi text-xs text-[#B4ABD6]">
              सभी १० आईसीयू बेड की लाइव दर्द सूचकांक निगरानी (दर्द की तीव्रता के अनुसार क्रमबद्ध)
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#B4ABD6] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="wardSearchInput"
              type="text"
              placeholder="Search bed or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full bg-[#1E1638] border border-[#A99BEA]/30 text-xs text-[#F4F1FF] placeholder-[#B4ABD6] focus:outline-none focus:border-[#C4B8F7]"
            />
          </div>

          {/* Interactive Filter Chips */}
          {(
            [
              { id: 'all', label: `All Beds (${beds.length})` },
              { id: 'critical', label: `Severe / Critical (${criticalCount})` },
              { id: 'moderate', label: `Moderate (${moderateCount})` },
              { id: 'stable', label: `Stable (${stableCount})` },
              { id: 'ventilated', label: 'Ventilated (MV)' },
            ] as { id: WardFilter; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filter === item.id
                  ? 'bg-[#E8FF3A] text-[#150F29] font-bold shadow-[0_0_16px_rgba(232,255,58,0.35)]'
                  : 'bg-[#1E1638] text-[#A99BEA] border border-[#A99BEA]/25 hover:text-[#F4F1FF]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 10-Bed Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBeds.map((bed) => {
          const sev = getSeverityMeta(bed.painScore);
          const isCurrent = bed.id === activeBedId;

          // Build SVG sparkline points
          const pts = bed.history
            .map((val, i) => {
              const x = (i / Math.max(1, bed.history.length - 1)) * 120;
              const y = 32 - (Math.min(10, Math.max(0, val)) / 10) * 28;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <div
              key={bed.id}
              className={`aura-card aura-card-interactive p-5 flex flex-col justify-between gap-4 ${
                sev.cardClass
              } ${isCurrent ? 'ring-2 ring-[#E8FF3A]' : ''}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#C4B8F7]">
                      {bed.bedNumber}
                    </span>
                    {lang !== 'en' && (
                      <span className="font-hindi text-xs text-[#B4ABD6]">
                        / {bed.bedHindi}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E8FF3A] text-[#150F29]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#F4F1FF] mt-0.5">
                    {bed.patientName}{' '}
                    <span className="text-xs font-mono font-normal text-[#B4ABD6]">
                      ({bed.age}y/{bed.gender})
                    </span>
                  </h3>
                  <p className="text-xs text-[#B4ABD6] mt-0.5">{bed.diagnosis}</p>
                  {lang !== 'en' && (
                    <p className="font-hindi text-[11px] text-[#B4ABD6]/85">
                      {bed.diagnosisHi}
                    </p>
                  )}
                </div>

                {/* Severity Pill */}
                <span
                  style={{
                    backgroundColor: sev.bg,
                    color: sev.color,
                    borderColor: sev.color,
                  }}
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold border shrink-0"
                >
                  {sev.label} {bed.painScore.toFixed(1)}/10
                </span>
              </div>

              {/* Score + Sparkline Strip */}
              <div className="p-3.5 rounded-2xl bg-[#1E1638]/85 border border-[#A99BEA]/20 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#B4ABD6]">
                    PAIN INDEX
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-mono text-3xl font-bold"
                      style={{ color: bed.painScore >= 6 ? '#E8FF3A' : sev.color }}
                    >
                      {bed.painScore.toFixed(1)}
                    </span>
                    <span className="font-mono text-xs text-[#B4ABD6]">
                      / 10 (Thr {bed.threshold.toFixed(1)})
                    </span>
                  </div>
                </div>

                {/* 60s Trend Sparkline */}
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#B4ABD6] mb-1">
                    60S TREND
                  </div>
                  <svg width="120" height="34" className="overflow-visible">
                    <polyline
                      fill="none"
                      stroke={sev.color}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pts}
                    />
                  </svg>
                </div>
              </div>

              {/* 4 Mini Biomarker Channels */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Brow', val: bed.biomarkers.brow },
                  { label: 'Squint', val: bed.biomarkers.squint },
                  { label: 'Midface', val: bed.biomarkers.midface },
                  { label: 'Mouth', val: bed.biomarkers.mouth },
                ].map((bm) => (
                  <div
                    key={bm.label}
                    className="p-2 rounded-xl bg-[#150F29]/75 border border-[#A99BEA]/15"
                  >
                    <div className="text-[10px] text-[#B4ABD6]">{bm.label}</div>
                    <div className="font-mono text-xs font-bold text-[#F4F1FF] mt-0.5">
                      {Math.round(bm.val)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Vitals & Dyspnea Row */}
              <div className="flex items-center justify-between text-xs font-mono text-[#B4ABD6] pt-1 border-t border-[#A99BEA]/15">
                <span className="inline-flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-[#F43F5E]" />
                  <strong className="text-[#F4F1FF]">{bed.hr}</strong> BPM
                </span>
                <span>
                  SpO2 <strong className="text-[#F4F1FF]">{bed.spo2}%</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-[#C4B8F7]" />
                  RR <strong className="text-[#F4F1FF]">{bed.rr}</strong>/m
                </span>
                <span
                  className={
                    bed.dyspneaRisk === 'High'
                      ? 'text-[#F43F5E] font-bold'
                      : bed.dyspneaRisk === 'Moderate'
                      ? 'text-[#FBBF24]'
                      : 'text-[#22C55E]'
                  }
                >
                  Dyspnea: {bed.dyspneaRisk}
                </span>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => onSelectBedForMonitor(bed)}
                  className="flex-1 btn-neon py-2.5 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Monitor Bed</span>
                </button>

                {bed.painScore >= bed.threshold ? (
                  <button
                    onClick={() => {
                      MedicalAudioAlarm.speakSingleCard(
                        `Alert acknowledged for ${bed.bedNumber}, patient ${bed.patientName}.`,
                        `${bed.bedHindi} का दर्द अलर्ट स्वीकार किया गया।`
                      );
                      onAcknowledgeBed(bed.id);
                    }}
                    className="btn-lilac-glass py-2.5 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer text-[#E8FF3A]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8FF3A]" />
                    <span>{bed.acknowledged ? 'Acked' : 'Ack Alert'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      MedicalAudioAlarm.speakSingleCard(
                        `${bed.bedNumber}, patient ${bed.patientName}, status stable with pain score ${bed.painScore.toFixed(
                          1
                        )}.`,
                        `${bed.bedHindi}, मरीज़ की स्थिति स्थिर है, दर्द सूचकांक ${bed.painScore.toFixed(
                          1
                        )} है।`
                      )
                    }
                    className="btn-lilac-glass py-2.5 px-3 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    title="Speak status aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#C4B8F7]" />
                    <span>Audio</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Presentation,
  Volume2,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { PRESENTATION_SLIDES } from '../data/clinicalData';
import { MedicalAudioAlarm } from '../services/MedicalAudioAlarm';

interface PresentTabProps {
  onLaunchDemoFromDeck: () => void;
}

export const PresentTab: React.FC<PresentTabProps> = ({ onLaunchDemoFromDeck }) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const total = PRESENTATION_SLIDES.length;
  const slide = PRESENTATION_SLIDES[slideIdx];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setSlideIdx((prev) => (prev + 1) % total);
      } else if (e.key === 'ArrowLeft') {
        setSlideIdx((prev) => (prev - 1 + total) % total);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total]);

  const handleNarrateSlide = () => {
    MedicalAudioAlarm.unlock();
    MedicalAudioAlarm.speakWithDelay(
      `${slide.title} ${slide.titleHighlight}. ${slide.subtitle} ${slide.clinicalTakeaway}`,
      '',
      'en'
    );
  };

  return (
    <div id="tab-present" className="space-y-6 animate-fade-up">
      {/* Top Deck Bar */}
      <div className="aura-card p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8FF3A]/15 border border-[#E8FF3A]/40 flex items-center justify-center">
            <Presentation className="w-5 h-5 text-[#E8FF3A]" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#C4B8F7]">
              CLINICAL ARCHITECTURE BRIEFING · SLIDE {slide.slideNumber} OF {total}
            </div>
            <div className="text-sm font-bold text-[#F4F1FF]">
              AURA-PainCare ICU System Overview
            </div>
          </div>
        </div>

        {/* Slide Dots + Audio Narration */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.slideNumber}
                onClick={() => setSlideIdx(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === slideIdx
                    ? 'w-8 bg-[#E8FF3A]'
                    : 'w-2.5 bg-[#2A2145] hover:bg-[#A99BEA]'
                }`}
                aria-label={`Slide ${s.slideNumber}`}
              />
            ))}
          </div>

          <button
            onClick={handleNarrateSlide}
            className="btn-lilac-glass px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#E8FF3A]" />
            <span>Narrate Slide</span>
          </button>

          <button
            onClick={onLaunchDemoFromDeck}
            className="btn-neon px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Live Alarm Demo</span>
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="aura-card p-7 sm:p-10 lg:p-12 space-y-8 relative overflow-hidden">
        <div className="space-y-3 max-w-3xl">
          <div className="font-mono text-xs font-bold tracking-wider uppercase text-[#E8FF3A]">
            {slide.kicker}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight leading-[1.12] text-[#F4F1FF]">
            {slide.title}{' '}
            <span className="text-[#E8FF3A]">{slide.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-[#B4ABD6] leading-relaxed pt-1">
            {slide.subtitle}
          </p>
        </div>

        {/* 3 Quantitative Proof Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {slide.metrics.map((m) => (
            <div
              key={m.label}
              className="p-5 rounded-2xl bg-[#1E1638]/90 border border-[#A99BEA]/30 space-y-1"
            >
              <div className="font-mono text-3xl sm:text-4xl font-bold text-[#E8FF3A]">
                {m.value}
              </div>
              <div className="text-sm font-bold text-[#F4F1FF]">{m.label}</div>
              <div className="text-xs text-[#B4ABD6]">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* 2 Key Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slide.bullets.map((b) => (
            <div
              key={b.heading}
              className="p-5 rounded-2xl bg-[#150F29]/75 border border-[#A99BEA]/20 space-y-2"
            >
              <div className="flex items-center gap-2 text-base font-bold text-[#F4F1FF]">
                <CheckCircle2 className="w-4 h-4 text-[#E8FF3A] shrink-0" />
                <span>{b.heading}</span>
              </div>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        {/* Bottom Clinical Takeaway & Prev/Next Controls */}
        <div className="pt-4 border-t border-[#A99BEA]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm font-semibold text-[#C4B8F7]">
            Clinical Takeaway:{' '}
            <span className="text-[#F4F1FF]">{slide.clinicalTakeaway}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSlideIdx((prev) => (prev - 1 + total) % total)}
              className="btn-lilac-glass px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setSlideIdx((prev) => (prev + 1) % total)}
              className="btn-neon px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

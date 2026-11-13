import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  BellRing,
  Cpu,
  Eye,
  HeartPulse,
  LayoutGrid,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Volume2,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { MedicalAudioAlarm } from '../services/MedicalAudioAlarm';

interface HeroOverlayProps {
  visible: boolean;
  onEnterMonitor: () => void;
  onTryInstantDemo: () => void;
  lang: 'en' | 'hi' | 'both';
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  visible,
  onEnterMonitor,
  onTryInstantDemo,
  lang,
}) => {
  const [closing, setClosing] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) {
      setClosing(false);
      const timer = window.setTimeout(() => setRevealed(true), 220);
      return () => window.clearTimeout(timer);
    }
  }, [visible]);

  if (!visible && !closing) return null;

  const handleOpenMonitor = () => {
    MedicalAudioAlarm.unlock();
    setClosing(true);
    window.setTimeout(() => {
      onEnterMonitor();
      setClosing(false);
    }, 260);
  };

  const handleInstantDemo = () => {
    MedicalAudioAlarm.unlock();
    setClosing(true);
    window.setTimeout(() => {
      onTryInstantDemo();
      setClosing(false);
    }, 260);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({
      x: Math.max(-14, Math.min(14, nx * 24)),
      y: Math.max(-14, Math.min(14, ny * 24)),
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 60 && !revealed) {
      setRevealed(true);
    }
  };

  return (
    <div
      id="heroOverlay"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onScroll={handleScroll}
      className={`fixed inset-0 z-50 overflow-y-auto aura-bg-grid transition-opacity duration-300 ${
        closing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Minimal Hero Header */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2A2145] border border-[#A99BEA]/40 flex items-center justify-center shadow-[0_0_20px_rgba(232,255,58,0.18)]">
            <Activity className="w-5 h-5 text-[#E8FF3A]" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-[#F4F1FF]">
              AURA<span className="text-[#E8FF3A]">-PainCare</span>
            </span>
            <p className="text-[11px] text-[#B4ABD6] font-mono">
              NON-VERBAL ICU BIOMARKER MONITOR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleInstantDemo}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold btn-lilac-glass cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#E8FF3A]" />
            <span>Test Alarm Demo</span>
          </button>
          <button
            onClick={handleOpenMonitor}
            className="px-5 py-2.5 text-xs font-bold btn-neon cursor-pointer"
          >
            Enter Console →
          </button>
        </div>
      </div>

      {/* Main Above-the-Fold Split Hero */}
      <section className="max-w-[1360px] mx-auto px-6 sm:px-10 pt-6 pb-16 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline, Subhead, CTAs, 3 Stat Chips */}
        <div className="lg:col-span-7 space-y-7 animate-fade-up">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1E1638] border border-[#A99BEA]/30 text-xs text-[#C4B8F7]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8FF3A]" />
            <span>Continuous AI Facial Action &amp; Dyspnea Surveillance for Intensive Care</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] text-[#F4F1FF]">
              Pain that can&apos;t speak,
              <span className="block text-[#E8FF3A] mt-1 drop-shadow-[0_0_24px_rgba(232,255,58,0.28)]">
                now gets heard.
              </span>
            </h1>
            {lang !== 'en' && (
              <p className="font-hindi text-base sm:text-lg text-[#C4B8F7] pt-1">
                जो दर्द बोल नहीं सकता, अब सुना जाएगा — मूक आईसीयू मरीज़ों के लिए रियल-टाइम एआई दर्द निगरानी।
              </p>
            )}
          </div>

          <p className="text-base sm:text-lg text-[#B4ABD6] max-w-2xl leading-relaxed">
            Intubated, sedated, and post-stroke ICU patients suffer silent breakthrough pain without a way to press a call bell. AURA-PainCare reads 468 facial micro-expression landmarks and respiratory tension through any standard bedside camera—sounding an automatic bilingual English &amp; Hindi alert within seconds.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="openMonitorBtn"
              onClick={handleOpenMonitor}
              className="btn-neon px-7 py-4 text-sm sm:text-base font-bold inline-flex items-center gap-2.5 cursor-pointer"
            >
              <span>Open Live Monitor →</span>
            </button>

            <button
              id="tryDemoBtn"
              onClick={handleInstantDemo}
              className="btn-lilac-glass px-6 py-4 text-sm sm:text-base font-semibold inline-flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#E8FF3A] fill-[#E8FF3A]" />
              <span>▶ Try instant alarm demo</span>
            </button>
          </div>

          {/* 3 Stat Chips */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 max-w-xl">
            <div className="aura-card px-4 py-3.5 border border-[#A99BEA]/25">
              <div className="font-mono text-xl sm:text-2xl font-bold text-[#E8FF3A]">
                ₹0 hardware
              </div>
              <div className="text-xs text-[#B4ABD6] mt-0.5">
                Standard webcam or IP feed
              </div>
            </div>

            <div className="aura-card px-4 py-3.5 border border-[#A99BEA]/25">
              <div className="font-mono text-xl sm:text-2xl font-bold text-[#F4F1FF]">
                468 landmarks
              </div>
              <div className="text-xs text-[#B4ABD6] mt-0.5">
                Real-time FACS + optical engine
              </div>
            </div>

            <div className="aura-card px-4 py-3.5 border border-[#A99BEA]/25">
              <div className="font-mono text-xl sm:text-2xl font-bold text-[#22C55E]">
                &lt;10s response
              </div>
              <div className="text-xs text-[#B4ABD6] mt-0.5">
                Auto bilingual EN + हिं alarm
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Glowing Circular Face Illustration with Animated Lilac Mesh, Scan Line, Rotating Ring & 3 Floating Glass Cards */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] sm:min-h-[500px]">
          <div
            style={{
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
              transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="relative w-[340px] h-[340px] sm:w-[410px] sm:h-[410px] flex items-center justify-center"
          >
            {/* Ambient Violet & Neon Radial Halo */}
            <div className="absolute inset-0 rounded-full bg-radial from-[#A99BEA]/22 via-[#2A2145]/40 to-transparent blur-2xl pointer-events-none" />

            {/* Outer Rotating Dashed Ring */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none"
              viewBox="0 0 400 400"
            >
              <circle
                cx="200"
                cy="200"
                r="190"
                fill="none"
                stroke="#A99BEA"
                strokeOpacity="0.35"
                strokeWidth="1.5"
                strokeDasharray="8 10"
              />
              <circle
                cx="200"
                cy="200"
                r="174"
                fill="none"
                stroke="#E8FF3A"
                strokeOpacity="0.22"
                strokeWidth="1"
                strokeDasharray="3 14"
              />
            </svg>

            {/* Counter-Rotating Inner Ring */}
            <svg
              className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] animate-spin-reverse-slow pointer-events-none"
              viewBox="0 0 360 360"
            >
              <circle
                cx="180"
                cy="180"
                r="164"
                fill="none"
                stroke="#C4B8F7"
                strokeOpacity="0.25"
                strokeWidth="1.2"
                strokeDasharray="24 16 4 16"
              />
            </svg>

            {/* Main Circular Glass Biometric Sphere */}
            <div className="relative w-[290px] h-[290px] sm:w-[340px] sm:h-[340px] rounded-full bg-[#1E1638]/90 border border-[#C4B8F7]/40 shadow-[0_0_50px_rgba(169,155,234,0.22),inset_0_0_32px_rgba(169,155,234,0.16)] overflow-hidden flex items-center justify-center">
              {/* Animated 468-Landmark Lilac Face Mesh SVG */}
              <svg
                viewBox="0 0 300 320"
                className="w-[84%] h-[84%] drop-shadow-[0_0_12px_rgba(196,184,247,0.45)]"
              >
                <defs>
                  <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C4B8F7" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#A99BEA" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#E8FF3A" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Outer Cranial & Jaw Contour */}
                <path
                  d="M150 28 C95 28, 62 72, 64 134 C66 196, 94 256, 150 284 C206 256, 234 196, 236 134 C238 72, 205 28, 150 28 Z"
                  fill="rgba(42, 33, 69, 0.45)"
                  stroke="url(#meshGrad)"
                  strokeWidth="1.4"
                />

                {/* Tesselated Mesh Wireframe Lines */}
                <g stroke="#A99BEA" strokeOpacity="0.38" strokeWidth="0.9" fill="none">
                  {/* Vertical Symmetry & Meridian Axes */}
                  <path d="M150 28 L150 284" />
                  <path d="M150 28 Q115 150 150 284" />
                  <path d="M150 28 Q185 150 150 284" />
                  <path d="M150 28 Q85 145 150 284" />
                  <path d="M150 28 Q215 145 150 284" />

                  {/* Horizontal Anatomical Latitudes */}
                  <path d="M74 88 Q150 102 226 88" />
                  <path d="M64 126 Q150 138 236 126" />
                  <path d="M68 168 Q150 184 232 168" />
                  <path d="M82 212 Q150 232 218 212" />
                  <path d="M105 250 Q150 264 195 250" />

                  {/* Cross Triangulation */}
                  <path d="M92 94 L126 125 L150 108 L174 125 L208 94" />
                  <path d="M88 158 L124 176 L150 164 L176 176 L212 158" />
                  <path d="M104 214 L150 196 L196 214 L150 242 Z" />
                </g>

                {/* Active Pain Action Units (AU4 Brow Furrow & AU6/7 Orbital Squeeze) in Neon Yellow */}
                <g stroke="#E8FF3A" strokeWidth="1.8" fill="none">
                  {/* Furrowed Brows (AU4) */}
                  <path d="M90 108 Q118 96 141 112" />
                  <path d="M210 108 Q182 96 159 112" />
                  {/* Glabellar Stress Lines */}
                  <line x1="145" y1="94" x2="146" y2="114" />
                  <line x1="155" y1="94" x2="154" y2="114" />

                  {/* Orbital Squint Contours (AU6/7) */}
                  <path d="M94 126 Q115 116 134 126 Q115 134 94 126 Z" fill="rgba(232,255,58,0.12)" />
                  <path d="M166 126 Q185 116 206 126 Q185 134 166 126 Z" fill="rgba(232,255,58,0.12)" />

                  {/* Nasolabial Tension Triangles (AU9/10) */}
                  <path d="M134 158 L108 204" strokeDasharray="3 3" />
                  <path d="M166 158 L192 204" strokeDasharray="3 3" />

                  {/* Grimace Mouth Contour (AU20/25) */}
                  <path
                    d="M112 216 Q150 206 188 216 Q150 236 112 216 Z"
                    fill="rgba(244, 63, 94, 0.22)"
                    stroke="#FB923C"
                  />
                </g>

                {/* Landmark Nodes */}
                {[
                  [150, 28], [150, 65], [150, 108], [150, 145], [150, 178], [150, 216], [150, 256], [150, 284],
                  [90, 108], [116, 102], [141, 112], [159, 112], [184, 102], [210, 108],
                  [94, 126], [115, 124], [134, 126], [166, 126], [185, 124], [206, 126],
                  [132, 166], [168, 166], [112, 216], [188, 216], [86, 156], [214, 156],
                  [74, 126], [226, 126], [98, 246], [202, 246],
                ].map(([cx, cy], index) => (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={index >= 8 && index <= 23 ? 3 : 2.2}
                    fill={index >= 8 && index <= 23 ? '#E8FF3A' : '#C4B8F7'}
                  />
                ))}
              </svg>

              {/* Animated Neon Yellow Horizontal Scan Line */}
              <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8FF3A] to-transparent shadow-[0_0_16px_#E8FF3A] animate-scanline pointer-events-none" />
            </div>

            {/* Floating Glass Card 1: Pain Index 7.2/10 SEVERE */}
            <div
              style={{
                transform: `translate3d(${parallax.x * -0.6}px, ${parallax.y * -0.6}px, 0)`,
              }}
              className="aura-card absolute -top-3 -left-4 sm:-left-8 px-4 py-3 border border-[#FB923C]/60 shadow-[0_0_24px_rgba(251,146,60,0.25)]"
            >
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#B4ABD6]">
                PAIN INDEX · AU4/AU7
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-2xl font-bold text-[#E8FF3A]">7.2</span>
                <span className="font-mono text-xs text-[#B4ABD6]">/ 10</span>
                <span className="ml-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#FB923C]/20 text-[#FB923C] border border-[#FB923C]/50">
                  SEVERE
                </span>
              </div>
            </div>

            {/* Floating Glass Card 2: Bed 104 needs help */}
            <div
              style={{
                transform: `translate3d(${parallax.x * 0.7}px, ${parallax.y * -0.4}px, 0)`,
              }}
              className="aura-card absolute top-10 -right-4 sm:-right-8 px-4 py-3 border border-[#F43F5E]/60 shadow-[0_0_24px_rgba(244,63,94,0.28)]"
            >
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#F43F5E]" />
                <span className="font-mono text-xs font-bold text-[#F4F1FF]">
                  Bed 104 needs help
                </span>
              </div>
              <div className="font-hindi text-[11px] text-[#C4B8F7] mt-0.5">
                बेड १०४ · गंभीर दर्द अलर्ट
              </div>
            </div>

            {/* Floating Glass Card 3: Heart rate 112 BPM with animated ECG */}
            <div
              style={{
                transform: `translate3d(${parallax.x * -0.4}px, ${parallax.y * 0.7}px, 0)`,
              }}
              className="aura-card absolute -bottom-4 left-4 sm:left-6 right-4 sm:right-6 px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F43F5E]/15 border border-[#F43F5E]/40 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-[#F43F5E]" />
                </div>
                <div>
                  <div className="text-[11px] text-[#B4ABD6] font-mono">HEART RATE</div>
                  <div className="font-mono text-base font-bold text-[#F4F1FF]">
                    112 <span className="text-xs font-normal text-[#B4ABD6]">BPM</span>
                  </div>
                </div>
              </div>

              {/* Animated SVG ECG Strip */}
              <svg className="w-32 h-9 overflow-visible" viewBox="0 0 140 36">
                <path
                  d="M0 18 L22 18 L28 12 L34 24 L42 4 L48 32 L54 14 L62 18 L90 18 L96 11 L102 24 L110 5 L116 31 L122 15 L140 18"
                  fill="none"
                  stroke="#E8FF3A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 pb-6 flex items-center justify-center">
        <a
          href="#heroFeatures"
          className="inline-flex items-center gap-2 text-xs text-[#B4ABD6] hover:text-[#F4F1FF] transition-colors"
        >
          <span>Explore Clinical Architecture</span>
          <ChevronDown className="w-4 h-4 text-[#E8FF3A]" />
        </a>
      </div>

      {/* Below the Fold: 4 Feature Cards & 3-Step "How It Works" */}
      <section
        id="heroFeatures"
        className={`max-w-[1360px] mx-auto px-6 sm:px-10 py-14 space-y-16 transition-all duration-500 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* 4 Feature Cards */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
                CLINICAL CAPABILITIES
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F1FF] mt-1">
                Engineered for High-Acuity Intensive Care
              </h2>
            </div>
            <p className="text-sm text-[#B4ABD6] max-w-md">
              Built for charge nurses and intensivists in dimly lit ICU wards where split-second clarity prevents silent suffering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="aura-card aura-card-interactive p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#A99BEA]/15 border border-[#A99BEA]/35 flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#E8FF3A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F1FF]">
                468-Point Facial Biomarkers
              </h3>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">
                Tracks brow lowering (AU4), orbital tightening (AU6/7), nasolabial tension (AU9/10), and mouth stretch (AU20/25) with optical fallback.
              </p>
            </div>

            <div className="aura-card aura-card-interactive p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#A99BEA]/15 border border-[#A99BEA]/35 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-[#E8FF3A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F1FF]">
                Auto Bilingual Voice Alarms
              </h3>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">
                Triggers an automatic multi-harmonic chime and spoken English + Hindi alert after 1.5s of sustained pain above threshold—zero clicks needed.
              </p>
            </div>

            <div className="aura-card aura-card-interactive p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#A99BEA]/15 border border-[#A99BEA]/35 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-[#E8FF3A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F1FF]">
                10-Bed ICU Ward Triage
              </h3>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">
                Central nurse station matrix displaying 10 concurrent ICU beds with acuity filters, dyspnea detection, and 60s rolling trend sparklines.
              </p>
            </div>

            <div className="aura-card aura-card-interactive p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#A99BEA]/15 border border-[#A99BEA]/35 flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#E8FF3A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F1FF]">
                Body Pain Map &amp; Voice Board
              </h3>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">
                Interactive anatomical pain localization paired with an 8-card bilingual AAC voice board and live speech recognition for semi-verbal patients.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step "How It Works" */}
        <div className="aura-card p-7 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#A99BEA]/20 pb-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#E8FF3A]">
                WORKFLOW ARCHITECTURE
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F1FF] mt-1">
                How AURA-PainCare Works in 3 Steps
              </h2>
            </div>
            <button
              onClick={handleOpenMonitor}
              className="btn-neon px-6 py-3 text-xs sm:text-sm font-bold inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <span>Launch Live Monitor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#1E1638]/80 border border-[#A99BEA]/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#E8FF3A] px-2.5 py-1 rounded-full bg-[#E8FF3A]/10 border border-[#E8FF3A]/30">
                  STEP 01
                </span>
                <Cpu className="w-4 h-4 text-[#C4B8F7]" />
              </div>
              <h3 className="text-base font-bold text-[#F4F1FF]">
                Optical Landmark Acquisition
              </h3>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">
                Point any bedside webcam or ICU camera at the patient. MediaPipe FaceMesh + the optical fallback engine extract 468 3D points locally in the browser.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E1638]/80 border border-[#A99BEA]/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#E8FF3A] px-2.5 py-1 rounded-full bg-[#E8FF3A]/10 border border-[#E8FF3A]/30">
                  STEP 02
                </span>
                <Activity className="w-4 h-4 text-[#C4B8F7]" />
              </div>
              <h3 className="text-base font-bold text-[#F4F1FF]">
                Continuous 0–10 Biomarker Scoring
              </h3>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">
                Brow furrow, eye squint, mid-face tension, and mouth grimace combine into a calibrated 0–10 Pain Index alongside HR, SpO2, RR, and dyspnea risk.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E1638]/80 border border-[#A99BEA]/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#E8FF3A] px-2.5 py-1 rounded-full bg-[#E8FF3A]/10 border border-[#E8FF3A]/30">
                  STEP 03
                </span>
                <ShieldCheck className="w-4 h-4 text-[#C4B8F7]" />
              </div>
              <h3 className="text-base font-bold text-[#F4F1FF]">
                1.5s Sustained Alert &amp; SLA Audit
              </h3>
              <p className="text-sm text-[#B4ABD6] leading-relaxed">
                When pain exceeds the threshold for 1.5s, AURA sounds the clinical chime, speaks the English + Hindi alert, starts the SLA timer, and logs the incident.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

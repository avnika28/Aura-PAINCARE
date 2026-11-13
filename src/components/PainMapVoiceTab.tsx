import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Wind,
  Droplets,
  RefreshCw,
  GlassWater,
  ThermometerSnowflake,
  AlertCircle,
  HeartHandshake,
  Mic,
  MicOff,
  Volume2,
  MapPin,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  BODY_PAIN_ZONES,
  VOICE_BOARD_CARDS,
  BodyZone,
  VoiceBoardCard,
} from '../data/clinicalData';
import { MedicalAudioAlarm } from '../services/MedicalAudioAlarm';

interface PainMapVoiceTabProps {
  lang: 'en' | 'hi' | 'both';
  activePatientName: string;
  activeBedNumber: string;
  onTriggerSimulatedSpike?: (score: number, reason: string) => void;
}

interface LoggedBodyPain {
  id: string;
  zoneNameEn: string;
  zoneNameHi: string;
  intensity: number;
  time: string;
}

export const PainMapVoiceTab: React.FC<PainMapVoiceTabProps> = ({
  lang,
  activePatientName,
  activeBedNumber,
  onTriggerSimulatedSpike,
}) => {
  const [zoneIntensities, setZoneIntensities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    BODY_PAIN_ZONES.forEach((z) => {
      initial[z.id] = z.defaultIntensity;
    });
    return initial;
  });
  const [selectedZoneId, setSelectedZoneId] = useState<string>(BODY_PAIN_ZONES[0].id);
  const [loggedZones, setLoggedZones] = useState<LoggedBodyPain[]>([
    {
      id: 'init-1',
      zoneNameEn: 'Cranial / Forehead',
      zoneNameHi: 'सिर / माथा (क्रेनीओटॉमी)',
      intensity: 8,
      time: '14:20:10',
    },
    {
      id: 'init-2',
      zoneNameEn: 'Airway / ETT Cuff',
      zoneNameHi: 'गला / एंडोट्रेकियल ट्यूब',
      intensity: 7,
      time: '14:12:45',
    },
  ]);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [lastSpokenMessage, setLastSpokenMessage] = useState<{
    en: string;
    hi: string;
    time: string;
  } | null>(null);

  // Speech Recognition & Mic Level State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micStatus, setMicStatus] = useState<string>('Ready for bedside voice / groan detection');
  const [micLevel, setMicLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioAnimRef = useRef<number | null>(null);

  const selectedZone: BodyZone =
    BODY_PAIN_ZONES.find((z) => z.id === selectedZoneId) || BODY_PAIN_ZONES[0];

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const getSeverityColor = (val: number) => {
    if (val >= 8) return '#F43F5E';
    if (val >= 6) return '#FB923C';
    if (val >= 3) return '#FBBF24';
    return '#22C55E';
  };

  const handleZoneClick = (zone: BodyZone) => {
    MedicalAudioAlarm.unlock();
    setSelectedZoneId(zone.id);
    const intensity = zoneIntensities[zone.id] ?? zone.defaultIntensity;
    MedicalAudioAlarm.speakWithDelay(
      `${zone.nameEn} selected. Localized pain level ${intensity} out of 10.`,
      `${zone.nameHi} चुना गया। दर्द का स्तर ${intensity} है।`,
      lang
    );
  };

  const handleLogZonePain = () => {
    const intensity = zoneIntensities[selectedZone.id] ?? selectedZone.defaultIntensity;
    const entry: LoggedBodyPain = {
      id: `log-${Date.now()}`,
      zoneNameEn: selectedZone.nameEn,
      zoneNameHi: selectedZone.nameHi,
      intensity,
      time: new Date().toLocaleTimeString(),
    };
    setLoggedZones((prev) => [entry, ...prev.slice(0, 7)]);
    MedicalAudioAlarm.speakSingleCard(
      `Logged ${selectedZone.nameEn} pain at ${intensity} out of 10 for ${activeBedNumber}.`,
      `${activeBedNumber} के लिए ${selectedZone.nameHi} में दर्द स्तर ${intensity} दर्ज किया गया।`
    );
    if (intensity >= 7 && onTriggerSimulatedSpike) {
      onTriggerSimulatedSpike(intensity, `Anatomical Map: ${selectedZone.nameEn}`);
    }
  };

  const handleVoiceCardClick = (card: VoiceBoardCard) => {
    setActiveCardId(card.id);
    setLastSpokenMessage({
      en: card.speechEn,
      hi: card.speechHi,
      time: new Date().toLocaleTimeString(),
    });
    MedicalAudioAlarm.speakSingleCard(card.speechEn, card.speechHi);
    if (card.urgency === 'high' && onTriggerSimulatedSpike) {
      onTriggerSimulatedSpike(7.8, `AAC Patient Call: ${card.titleEn}`);
    }
    window.setTimeout(() => {
      setActiveCardId((prev) => (prev === card.id ? null : prev));
    }, 2400);
  };

  const startListening = async () => {
    MedicalAudioAlarm.unlock();
    setIsListening(true);
    setMicStatus('Listening for patient speech or vocalized distress...');

    // 1. Start Web Speech API if available
    const SpeechRec =
      (window as unknown as Record<string, any>).SpeechRecognition ||
      (window as unknown as Record<string, any>).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let combined = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            combined += event.results[i][0].transcript;
          }
          const cleaned = combined.trim();
          setTranscript(cleaned);

          const lower = cleaned.toLowerCase();
          const matchedCard = VOICE_BOARD_CARDS.find(
            (c) =>
              lower.includes(c.titleEn.toLowerCase().split(' ')[0]) ||
              (lower.includes('pain') && c.id === 'vb-pain') ||
              (lower.includes('दर्द') && c.id === 'vb-pain') ||
              (lower.includes('water') && c.id === 'vb-thirst') ||
              (lower.includes('thirst') && c.id === 'vb-thirst') ||
              (lower.includes('प्यास') && c.id === 'vb-thirst') ||
              (lower.includes('पानी') && c.id === 'vb-thirst') ||
              (lower.includes('breath') && c.id === 'vb-breath') ||
              (lower.includes('सांस') && c.id === 'vb-breath') ||
              (lower.includes('suction') && c.id === 'vb-suction') ||
              (lower.includes('cold') && c.id === 'vb-cold') ||
              (lower.includes('ठंड') && c.id === 'vb-cold') ||
              (lower.includes('turn') && c.id === 'vb-position')
          );

          if (matchedCard && event.results[event.results.length - 1].isFinal) {
            handleVoiceCardClick(matchedCard);
          }
        };

        recognition.onerror = () => {
          setMicStatus('Acoustic vocalization monitor active');
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // Fallback to acoustic analyzer
      }
    }

    // 2. Start acoustic microphone level meter for groans / non-verbal sounds
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = Math.min(100, Math.round((sum / data.length) * 1.8));
        setMicLevel(avg);
        audioAnimRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch {
      setMicStatus('Speech listener active (grant mic permission for decibel meter)');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setMicLevel(0);
    setMicStatus('Ready for bedside voice / groan detection');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (audioAnimRef.current) {
      cancelAnimationFrame(audioAnimRef.current);
      audioAnimRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
  };

  const renderCardIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5' };
    switch (iconName) {
      case 'Flame':
        return <Flame {...props} />;
      case 'Wind':
        return <Wind {...props} />;
      case 'Droplets':
        return <Droplets {...props} />;
      case 'RefreshCw':
        return <RefreshCw {...props} />;
      case 'GlassWater':
        return <GlassWater {...props} />;
      case 'ThermometerSnowflake':
        return <ThermometerSnowflake {...props} />;
      case 'AlertCircle':
        return <AlertCircle {...props} />;
      default:
        return <HeartHandshake {...props} />;
    }
  };

  return (
    <div id="tab-painmap" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
      {/* Left 5 Columns: Interactive Anatomical Body Pain Map */}
      <div className="lg:col-span-5 aura-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#A99BEA]/20 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
              ANATOMICAL NOCICEPTION MAP
            </div>
            <h2 className="text-xl font-bold text-[#F4F1FF] mt-0.5">
              Localized Body Pain Mapping
            </h2>
            {lang !== 'en' && (
              <p className="font-hindi text-xs text-[#B4ABD6] mt-0.5">
                शरीर के किस हिस्से में दर्द है, उसे चुनें और तीव्रता दर्ज करें
              </p>
            )}
          </div>
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#1E1638] border border-[#A99BEA]/30 text-[#E8FF3A]">
            {activeBedNumber}
          </span>
        </div>

        {/* SVG Body Silhouette + Clickable Hotspots */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-6 flex justify-center bg-[#1E1638]/85 rounded-2xl border border-[#A99BEA]/20 p-4">
            <svg viewBox="0 0 300 410" className="w-full max-w-[220px] h-auto select-none">
              {/* Anatomical Silhouette Outline */}
              <g
                fill="rgba(42, 33, 69, 0.75)"
                stroke="#A99BEA"
                strokeOpacity="0.45"
                strokeWidth="1.6"
              >
                {/* Head */}
                <circle cx="150" cy="52" r="28" />
                {/* Neck */}
                <rect x="138" y="80" width="24" height="22" rx="6" />
                {/* Torso */}
                <path d="M104 104 L196 104 L188 265 L112 265 Z" />
                {/* Left & Right Arms */}
                <path d="M104 106 L74 228 L94 234 L114 140 Z" />
                <path d="M196 106 L226 228 L206 234 L186 140 Z" />
                {/* Left & Right Legs */}
                <path d="M114 265 L108 388 L138 388 L146 265 Z" />
                <path d="M154 265 L162 388 L192 388 L186 265 Z" />
              </g>

              {/* Centerline & Rib / Abdominal Reference Grid */}
              <line
                x1="150"
                y1="24"
                x2="150"
                y2="265"
                stroke="#A99BEA"
                strokeOpacity="0.2"
                strokeDasharray="3 3"
              />

              {/* Interactive Anatomical Pain Nodes */}
              {BODY_PAIN_ZONES.map((zone) => {
                const val = zoneIntensities[zone.id] ?? zone.defaultIntensity;
                const color = getSeverityColor(val);
                const isSelected = zone.id === selectedZoneId;
                return (
                  <g
                    key={zone.id}
                    onClick={() => handleZoneClick(zone)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r={isSelected ? zone.r + 5 : zone.r}
                      fill={color}
                      fillOpacity={isSelected ? 0.38 : 0.22}
                      stroke={isSelected ? '#E8FF3A' : color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <circle cx={zone.cx} cy={zone.cy} r={5} fill={color} />
                    <text
                      x={zone.cx}
                      y={zone.cy - zone.r - 4}
                      textAnchor="middle"
                      fill="#F4F1FF"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="700"
                    >
                      {val}/10
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Zone Calibrator & Log Controls */}
          <div className="sm:col-span-6 space-y-4">
            <div className="p-4 rounded-2xl bg-[#1E1638] border border-[#A99BEA]/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#C4B8F7]">
                  SELECTED REGION
                </span>
                <MapPin className="w-4 h-4 text-[#E8FF3A]" />
              </div>
              <div className="text-base font-bold text-[#F4F1FF]">{selectedZone.nameEn}</div>
              {lang !== 'en' && (
                <div className="font-hindi text-xs text-[#C4B8F7]">{selectedZone.nameHi}</div>
              )}
              <p className="text-xs text-[#B4ABD6] leading-relaxed">
                {selectedZone.clinicalNote}
              </p>

              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#B4ABD6]">LOCAL INTENSITY</span>
                  <span
                    className="text-base font-bold"
                    style={{
                      color: getSeverityColor(zoneIntensities[selectedZone.id] ?? 5),
                    }}
                  >
                    {zoneIntensities[selectedZone.id] ?? 5} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={zoneIntensities[selectedZone.id] ?? 5}
                  onChange={(e) =>
                    setZoneIntensities((prev) => ({
                      ...prev,
                      [selectedZone.id]: Number(e.target.value),
                    }))
                  }
                  className="w-full aura-slider"
                />
              </div>

              <button
                onClick={handleLogZonePain}
                className="w-full mt-2 btn-neon py-2.5 px-4 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log &amp; Announce Region Pain</span>
              </button>
            </div>

            {/* Logged Anatomical Regions List */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#B4ABD6]">
                RECENT ANATOMICAL PAIN LOGS
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {loggedZones.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-2 rounded-xl bg-[#1E1638]/70 border border-[#A99BEA]/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#F4F1FF]">{item.zoneNameEn}</div>
                      {lang !== 'en' && (
                        <div className="font-hindi text-[11px] text-[#B4ABD6]">
                          {item.zoneNameHi}
                        </div>
                      )}
                    </div>
                    <div className="text-right font-mono">
                      <span
                        className="font-bold"
                        style={{ color: getSeverityColor(item.intensity) }}
                      >
                        {item.intensity}/10
                      </span>
                      <div className="text-[10px] text-[#B4ABD6]">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 7 Columns: 8-Card Bilingual AAC Voice Board + Speech Recognition */}
      <div className="lg:col-span-7 aura-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#A99BEA]/20 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
              BEDSIDE AAC COMMUNICATION &amp; SPEECH LISTENER
            </div>
            <h2 className="text-xl font-bold text-[#F4F1FF] mt-0.5">
              8-Card Patient Voice Board ({activePatientName})
            </h2>
            {lang !== 'en' && (
              <p className="font-hindi text-xs text-[#B4ABD6] mt-0.5">
                कार्ड दबाएं — सिस्टम अंग्रेजी और हिंदी में आपकी ज़रूरत बोलकर नर्स को बताएगा
              </p>
            )}
          </div>

          {/* Live Speech Recognition Toggle Button */}
          <button
            id="voiceRecognitionToggleBtn"
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
              isListening
                ? 'bg-[#F43F5E] text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : 'btn-neon'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Voice Listener</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Speech / Groan Listener</span>
              </>
            )}
          </button>
        </div>

        {/* Speech Recognition & Acoustic Vocalization Bar */}
        <div className="p-4 rounded-2xl bg-[#1E1638] border border-[#A99BEA]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C4B8F7]">
              <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-[#E8FF3A]' : 'text-[#B4ABD6]'}`} />
              <span>{micStatus}</span>
            </div>
            <div className="text-sm text-[#F4F1FF] font-medium">
              {transcript ? (
                <span>
                  Heard: &ldquo;<span className="text-[#E8FF3A]">{transcript}</span>&rdquo;
                </span>
              ) : (
                <span className="text-[#B4ABD6] text-xs">
                  Say keywords like &ldquo;Pain / दर्द&rdquo;, &ldquo;Water / पानी&rdquo;, &ldquo;Breath / सांस&rdquo;, or tap any card below.
                </span>
              )}
            </div>
          </div>

          {/* Acoustic Vocalization Meter */}
          <div className="w-full sm:w-44 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-[#B4ABD6]">
              <span>VOCALIZATION dB</span>
              <span className="text-[#E8FF3A]">{micLevel}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#150F29] overflow-hidden border border-[#A99BEA]/20">
              <div
                className="h-full transition-all duration-100 rounded-full"
                style={{
                  width: `${micLevel}%`,
                  backgroundColor: micLevel > 65 ? '#F43F5E' : '#E8FF3A',
                }}
              />
            </div>
          </div>
        </div>

        {/* 8-Card Voice Board Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {VOICE_BOARD_CARDS.map((card) => {
            const isSpeaking = activeCardId === card.id;
            const borderAccent =
              card.urgency === 'high'
                ? 'border-[#F43F5E]/45 hover:border-[#F43F5E]'
                : card.urgency === 'medium'
                ? 'border-[#FB923C]/40 hover:border-[#FB923C]'
                : 'border-[#A99BEA]/30 hover:border-[#C4B8F7]';

            return (
              <button
                key={card.id}
                onClick={() => handleVoiceCardClick(card)}
                className={`text-left p-4 rounded-2xl bg-[#1E1638]/90 border transition-all cursor-pointer flex flex-col justify-between min-h-[138px] ${borderAccent} ${
                  isSpeaking
                    ? 'ring-2 ring-[#E8FF3A] bg-[#2A2145] shadow-[0_0_24px_rgba(232,255,58,0.3)] -translate-y-1'
                    : 'hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      card.urgency === 'high'
                        ? 'bg-[#F43F5E]/15 text-[#F43F5E]'
                        : card.urgency === 'medium'
                        ? 'bg-[#FB923C]/15 text-[#FB923C]'
                        : 'bg-[#A99BEA]/15 text-[#E8FF3A]'
                    }`}
                  >
                    {renderCardIcon(card.iconName)}
                  </div>
                  <Volume2
                    className={`w-4 h-4 ${
                      isSpeaking ? 'text-[#E8FF3A]' : 'text-[#B4ABD6]'
                    }`}
                  />
                </div>

                <div className="mt-3 space-y-1">
                  <div className="text-base font-bold text-[#F4F1FF] leading-snug">
                    {card.titleEn}
                  </div>
                  {lang !== 'en' && (
                    <div className="font-hindi text-sm font-medium text-[#E8FF3A]">
                      {card.titleHi}
                    </div>
                  )}
                  <div className="text-[11px] text-[#B4ABD6] pt-0.5">
                    {card.subtitleEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Last Spoken Output Confirmation Banner */}
        {lastSpokenMessage && (
          <div className="p-4 rounded-2xl bg-[#2A2145] border border-[#E8FF3A]/45 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#E8FF3A]">
                <CheckCircle2 className="w-4 h-4" />
                <span>SPOKEN ALOUD AT {lastSpokenMessage.time}</span>
              </div>
              <div className="text-sm font-semibold text-[#F4F1FF]">
                &ldquo;{lastSpokenMessage.en}&rdquo;
              </div>
              {lang !== 'en' && (
                <div className="font-hindi text-xs text-[#C4B8F7]">
                  &ldquo;{lastSpokenMessage.hi}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

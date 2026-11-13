import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  HeartPulse,
  Languages,
  LayoutGrid,
  Mic,
  Play,
  Presentation,
  QrCode,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
  Users,
  Volume2,
  Wind,
} from 'lucide-react';
import { HeroOverlay } from './components/HeroOverlay';
import { ICUWardTab } from './components/ICUWardTab';
import { PainMapVoiceTab } from './components/PainMapVoiceTab';
import { PatientsTab } from './components/PatientsTab';
import { PresentTab } from './components/PresentTab';
import {
  ClinicalReportModal,
  QRModal,
  IncidentLogEntry,
} from './components/ClinicalModals';
import {
  INITIAL_WARD_BEDS,
  PATIENT_CASE_FILES,
  WardBed,
  PatientCaseFile,
} from './data/clinicalData';
import { MedicalAudioAlarm } from './services/MedicalAudioAlarm';

type ActiveTab = 'monitor' | 'ward' | 'painmap' | 'patients' | 'present';
type SimulationType = 'resting' | 'spasm' | 'grimace' | 'respiratory' | null;

export default function App() {
  // Navigation & Hero State
  const [showHero, setShowHero] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitor');
  const [lang, setLang] = useState<'both' | 'en' | 'hi'>('both');

  // Audio Unlock Status (Bug Fix #2)
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(MedicalAudioAlarm.unlocked);

  // Active Patient & Ward State
  const [wardBeds, setWardBeds] = useState<WardBed[]>(INITIAL_WARD_BEDS);
  const [activeCase, setActiveCase] = useState<PatientCaseFile>(PATIENT_CASE_FILES[0]);

  // Core Pain & Biomarker Telemetry State
  const [painScore, setPainScore] = useState<number>(1.4);
  const [threshold, setThreshold] = useState<number>(6.0);
  const [biomarkers, setBiomarkers] = useState({
    brow: 16,
    squint: 14,
    midface: 12,
    mouth: 15,
  });
  const [vitals, setVitals] = useState({
    hr: 76,
    spo2: 98,
    rr: 15,
    dyspnea: 'Normal',
  });
  const [trendHistory, setTrendHistory] = useState<number[]>(() =>
    Array.from({ length: 60 }, (_, i) => Number((1.2 + Math.sin(i * 0.25) * 0.3).toFixed(1)))
  );

  // Camera & Simulation Engine State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<string>('Standby · Click Start Camera or Run Simulation');
  const [engineMode, setEngineMode] = useState<'Standby' | 'FaceMesh 468' | 'Optical Fallback' | 'Simulation'>('Standby');
  const [simulationMode, setSimulationMode] = useState<SimulationType>(null);

  // Alarm, Sustained Timer (1.5s) & 6s Cooldown State (Bug Fixes #1, #3, #4)
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [sustainedMs, setSustainedMs] = useState<number>(0);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0);
  const [slaElapsedSeconds, setSlaElapsedSeconds] = useState<number>(0);
  const [incidents, setIncidents] = useState<IncidentLogEntry[]>([
    {
      id: 'inc-seed-1',
      timestamp: '13:42:18',
      bedNumber: 'ICU-Bed 104',
      patientName: 'Rajeshwar Sharma',
      peakScore: 7.4,
      dominantBiomarker: 'Brow Lowering (AU4)',
      hr: 114,
      spo2: 95,
      rr: 24,
      acknowledged: true,
      slaSeconds: 4.2,
    },
  ]);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);

  // Refs for real-time loops & timers
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const simulationModeRef = useRef<SimulationType>(null);
  const simIntervalRef = useRef<number | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraRafRef = useRef<number | null>(null);
  const faceMeshRef = useRef<any>(null);
  const latestLandmarksRef = useRef<any[] | null>(null);

  const sustainedStartRef = useRef<number | null>(null);
  const cooldownUntilRef = useRef<number>(0);
  const alarmActiveRef = useRef<boolean>(false);
  const slaStartRef = useRef<number | null>(null);
  const thresholdRef = useRef<number>(threshold);
  const activeCaseRef = useRef<PatientCaseFile>(activeCase);
  const langRef = useRef<'both' | 'en' | 'hi'>(lang);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    activeCaseRef.current = activeCase;
  }, [activeCase]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // Subscribe to MedicalAudioAlarm unlock state (Bug Fix #2)
  useEffect(() => {
    return MedicalAudioAlarm.subscribe((unlocked) => {
      setAudioUnlocked(unlocked);
    });
  }, []);

  /**
   * Bug Fix #1:
   * exitSimulation() clears simInterval, sets simulationMode=false, and resets sustained timers.
   * Called at the start of startCamera() and when resetting.
   */
  const exitSimulation = useCallback(() => {
    if (simIntervalRef.current !== null) {
      window.clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    simulationModeRef.current = null;
    setSimulationMode(null);
    sustainedStartRef.current = null;
    setSustainedMs(0);
  }, []);

  /**
   * Dominate Biomarker Helper
   */
  const getDominantBiomarkerName = (bm: {
    brow: number;
    squint: number;
    midface: number;
    mouth: number;
  }) => {
    const entries: [string, number][] = [
      ['Brow Furrow (AU4)', bm.brow],
      ['Eye Squint (AU6/7)', bm.squint],
      ['Mid-Face Tension (AU9/10)', bm.midface],
      ['Mouth Grimace (AU20/25)', bm.mouth],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  /**
   * Core Pain Score & Alarm Evaluation Pipeline
   * Bug Fix #1: Processes camera data whenever simulationMode is false (or simulation data when fromSimulation=true).
   * Bug Fix #3: Respects 6-second cooldown after acknowledgeAlert().
   * Bug Fix #4: Sustained pain duration = 1.5s (1500ms).
   */
  const updatePainScore = useCallback(
    (
      newScore: number,
      newBiomarkers: { brow: number; squint: number; midface: number; mouth: number },
      source: 'camera' | 'simulation'
    ) => {
      if (source === 'camera' && simulationModeRef.current !== null) {
        return;
      }

      const clampedScore = Number(Math.max(0, Math.min(10, newScore)).toFixed(1));
      setPainScore(clampedScore);
      setBiomarkers({
        brow: Math.round(Math.max(0, Math.min(100, newBiomarkers.brow))),
        squint: Math.round(Math.max(0, Math.min(100, newBiomarkers.squint))),
        midface: Math.round(Math.max(0, Math.min(100, newBiomarkers.midface))),
        mouth: Math.round(Math.max(0, Math.min(100, newBiomarkers.mouth))),
      });

      // Compute coupled vitals & dyspnea detection
      const baseHr = activeCaseRef.current.baseVitals.hr || 78;
      const baseRr = activeCaseRef.current.baseVitals.rr || 16;
      const baseSpo2 = activeCaseRef.current.baseVitals.spo2 || 98;

      const computedHr = Math.round(baseHr + clampedScore * 4.2 + (Math.random() * 2 - 1));
      const computedRr = Math.round(
        baseRr + (clampedScore * 1.1 + newBiomarkers.mouth * 0.06)
      );
      const computedSpo2 = Math.max(
        88,
        Math.min(100, Math.round(baseSpo2 - (newBiomarkers.mouth > 70 ? 4 : clampedScore * 0.3)))
      );

      const dyspneaState =
        newBiomarkers.mouth >= 72 || computedRr >= 25
          ? 'ACUTE DYSPNEA RISK'
          : newBiomarkers.mouth >= 48 || computedRr >= 21
          ? 'Mild Distress'
          : 'Normal';

      setVitals({
        hr: computedHr,
        spo2: computedSpo2,
        rr: computedRr,
        dyspnea: dyspneaState,
      });

      const now = Date.now();
      const inCooldown = now < cooldownUntilRef.current;
      setCooldownRemainingMs(inCooldown ? cooldownUntilRef.current - now : 0);

      // Evaluate 1.5s Sustained Pain Threshold
      if (clampedScore >= thresholdRef.current && !inCooldown) {
        if (sustainedStartRef.current === null) {
          sustainedStartRef.current = now;
        }
        const elapsed = now - sustainedStartRef.current;
        setSustainedMs(elapsed);

        // Bug Fix #4: Trigger automatic alarm at 1.5s (1500ms)
        if (elapsed >= 1500 && !alarmActiveRef.current) {
          alarmActiveRef.current = true;
          setAlarmActive(true);
          slaStartRef.current = now;
          setSlaElapsedSeconds(0);

          const dominant = getDominantBiomarkerName(newBiomarkers);
          MedicalAudioAlarm.triggerAlarmAudio(
            activeCaseRef.current.bedNumber,
            clampedScore,
            dominant,
            langRef.current
          );

          const newIncident: IncidentLogEntry = {
            id: `inc-${now}`,
            timestamp: new Date().toLocaleTimeString(),
            bedNumber: activeCaseRef.current.bedNumber,
            patientName: activeCaseRef.current.name,
            peakScore: clampedScore,
            dominantBiomarker: dominant,
            hr: computedHr,
            spo2: computedSpo2,
            rr: computedRr,
            acknowledged: false,
          };
          setIncidents((prev) => [newIncident, ...prev.slice(0, 19)]);
        }
      } else {
        sustainedStartRef.current = null;
        setSustainedMs(0);
      }
    },
    []
  );

  /**
   * Bug Fix #3:
   * acknowledgeAlert() stops alarm audio, resets sustained timers, and sets a 6-second cooldown.
   */
  const acknowledgeAlert = useCallback(() => {
    MedicalAudioAlarm.unlock();
    MedicalAudioAlarm.stopAll();

    const now = Date.now();
    const slaSec =
      slaStartRef.current !== null ? (now - slaStartRef.current) / 1000 : 1.8;

    alarmActiveRef.current = false;
    setAlarmActive(false);
    sustainedStartRef.current = null;
    setSustainedMs(0);
    slaStartRef.current = null;

    // 6-second post-acknowledgement cooldown
    cooldownUntilRef.current = now + 6000;
    setCooldownRemainingMs(6000);

    setIncidents((prev) =>
      prev.map((inc, idx) =>
        idx === 0 && !inc.acknowledged
          ? { ...inc, acknowledged: true, slaSeconds: Number(slaSec.toFixed(1)) }
          : inc
      )
    );
  }, []);

  /**
   * Start Clinical Simulation Preset ('resting' | 'spasm' | 'grimace' | 'respiratory')
   */
  const startSimulation = useCallback(
    (mode: SimulationType) => {
      MedicalAudioAlarm.unlock();
      exitSimulation();

      if (mode === null) {
        setEngineMode(cameraActive ? 'FaceMesh 468' : 'Standby');
        updatePainScore(1.4, { brow: 16, squint: 14, midface: 12, mouth: 14 }, 'simulation');
        return;
      }

      simulationModeRef.current = mode;
      setSimulationMode(mode);
      setEngineMode('Simulation');
      // Clear cooldown when user explicitly triggers a simulation test so they can test immediately
      cooldownUntilRef.current = 0;
      setCooldownRemainingMs(0);

      const profiles: Record<
        Exclude<SimulationType, null>,
        { score: number; brow: number; squint: number; midface: number; mouth: number; label: string }
      > = {
        resting: {
          score: 1.3,
          brow: 14,
          squint: 12,
          midface: 10,
          mouth: 12,
          label: 'Simulation: Resting Calm Baseline',
        },
        spasm: {
          score: 5.4,
          brow: 62,
          squint: 58,
          midface: 52,
          mouth: 45,
          label: 'Simulation: Moderate Muscle Spasm',
        },
        grimace: {
          score: 8.4,
          brow: 91,
          squint: 86,
          midface: 78,
          mouth: 82,
          label: 'Simulation: Severe Facial Grimace (AU4+AU6+AU20)',
        },
        respiratory: {
          score: 7.2,
          brow: 68,
          squint: 64,
          midface: 74,
          mouth: 89,
          label: 'Simulation: Acute Dyspnea & Ventilator Dyssynchrony',
        },
      };

      const target = profiles[mode];
      setCameraStatus(target.label);

      // Immediate tick + 150ms interval
      const tick = () => {
        const jitter = (Math.random() - 0.5) * 0.3;
        const bmJitter = () => (Math.random() - 0.5) * 4;
        updatePainScore(
          target.score + jitter,
          {
            brow: target.brow + bmJitter(),
            squint: target.squint + bmJitter(),
            midface: target.midface + bmJitter(),
            mouth: target.mouth + bmJitter(),
          },
          'simulation'
        );
      };

      tick();
      simIntervalRef.current = window.setInterval(tick, 180);
    },
    [cameraActive, exitSimulation, updatePainScore]
  );

  /**
   * Stop Camera
   */
  const stopCamera = useCallback(() => {
    if (cameraRafRef.current !== null) {
      cancelAnimationFrame(cameraRafRef.current);
      cameraRafRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
    if (!simulationModeRef.current) {
      setEngineMode('Standby');
      setCameraStatus('Camera Stopped · Standby');
    }
  }, []);

  /**
   * Start Live Webcam with MediaPipe FaceMesh (468 Landmarks) + Optical Fallback Engine
   * Bug Fix #1: Calls exitSimulation() at the start of startCamera().
   * Bug Fix #2: Calls MedicalAudioAlarm.unlock() on camera start.
   */
  const startCamera = useCallback(async () => {
    exitSimulation();
    MedicalAudioAlarm.unlock();

    setCameraStatus('Initializing camera & 468-landmark optical engine...');
    setCameraActive(true);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraStatus('Live Camera Active · MediaPipe 468-Landmark Tracking');
      setEngineMode('FaceMesh 468');
    } catch {
      // If running in a headless preview without physical webcam, run synthetic optical stream on canvas
      setCameraStatus('Optical Fallback Active · Synthetic Biometric Camera Stream');
      setEngineMode('Optical Fallback');
    }

    // Initialize MediaPipe FaceMesh if available on window
    const FaceMeshClass = (window as unknown as Record<string, any>).FaceMesh;
    if (FaceMeshClass && !faceMeshRef.current) {
      try {
        const fm = new FaceMeshClass({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        fm.onResults((results: any) => {
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            latestLandmarksRef.current = results.multiFaceLandmarks[0];
            setEngineMode('FaceMesh 468');
          } else {
            latestLandmarksRef.current = null;
          }
        });
        faceMeshRef.current = fm;
      } catch {
        // Fallback to optical engine
      }
    }

    // Offscreen sampling canvas for Optical Fallback luminance/gradient analysis
    const offscreen = document.createElement('canvas');
    offscreen.width = 160;
    offscreen.height = 120;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    let frameCount = 0;
    const renderLoop = async () => {
      frameCount++;
      const canvas = outputCanvasRef.current;
      const video = videoRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          const hasLiveVideo =
            video && video.readyState >= 2 && video.videoWidth > 0;

          if (hasLiveVideo && faceMeshRef.current && frameCount % 2 === 0) {
            try {
              await faceMeshRef.current.send({ image: video });
            } catch {
              // ignore frame send error
            }
          }

          const landmarks = latestLandmarksRef.current;

          if (landmarks && landmarks.length >= 468) {
            // 1. Draw 468 MediaPipe Landmarks in Lilac Haze + Key Nociceptive Vectors in Neon Yellow
            ctx.fillStyle = 'rgba(196, 184, 247, 0.65)';
            for (let i = 0; i < landmarks.length; i += 2) {
              const pt = landmarks[i];
              ctx.beginPath();
              ctx.arc(pt.x * w, pt.y * h, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Compute scale-invariant facial action metrics
            const leftEyeOuter = landmarks[33];
            const rightEyeOuter = landmarks[263];
            const iod = Math.max(
              0.08,
              Math.hypot(
                rightEyeOuter.x - leftEyeOuter.x,
                rightEyeOuter.y - leftEyeOuter.y
              )
            );

            // Brow Lowering (AU4): inner brow distance (55 to 285) & brow-to-eye height
            const browInnerDist =
              Math.hypot(
                landmarks[285].x - landmarks[55].x,
                landmarks[285].y - landmarks[55].y
              ) / iod;
            const browEyeHeight =
              (Math.abs(landmarks[159].y - landmarks[65].y) +
                Math.abs(landmarks[386].y - landmarks[295].y)) /
              (2 * iod);
            const browScore = Math.min(
              100,
              Math.max(10, (0.38 - browInnerDist) * 260 + (0.19 - browEyeHeight) * 320)
            );

            // Orbital Squint (AU6/7): eye aspect ratio
            const leftEyeOpen =
              Math.abs(landmarks[145].y - landmarks[159].y) / iod;
            const rightEyeOpen =
              Math.abs(landmarks[374].y - landmarks[386].y) / iod;
            const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;
            const squintScore = Math.min(
              100,
              Math.max(8, (0.11 - avgEyeOpen) * 950)
            );

            // Mid-Face Tension (AU9/10): nose tip (1) to upper lip (0) & cheek contraction
            const noseLipDist =
              Math.abs(landmarks[0].y - landmarks[1].y) / iod;
            const midfaceScore = Math.min(
              100,
              Math.max(10, (0.28 - noseLipDist) * 420)
            );

            // Mouth Grimace (AU20/25/26): lip vertical opening (13-14) + mouth horizontal width (61-291)
            const mouthOpen =
              Math.abs(landmarks[14].y - landmarks[13].y) / iod;
            const mouthWidth =
              Math.hypot(
                landmarks[291].x - landmarks[61].x,
                landmarks[291].y - landmarks[61].y
              ) / iod;
            const mouthScore = Math.min(
              100,
              Math.max(8, mouthOpen * 240 + Math.max(0, mouthWidth - 0.72) * 190)
            );

            // Highlight active pain vectors on canvas
            ctx.strokeStyle = '#E8FF3A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(landmarks[55].x * w, landmarks[55].y * h);
            ctx.lineTo(landmarks[285].x * w, landmarks[285].y * h);
            ctx.moveTo(landmarks[61].x * w, landmarks[61].y * h);
            ctx.lineTo(landmarks[13].x * w, landmarks[13].y * h);
            ctx.lineTo(landmarks[291].x * w, landmarks[291].y * h);
            ctx.lineTo(landmarks[14].x * w, landmarks[14].y * h);
            ctx.closePath();
            ctx.stroke();

            if (frameCount % 5 === 0) {
              const composite =
                (browScore * 0.3 +
                  squintScore * 0.28 +
                  midfaceScore * 0.2 +
                  mouthScore * 0.22) /
                10;
              updatePainScore(
                composite,
                {
                  brow: browScore,
                  squint: squintScore,
                  midface: midfaceScore,
                  mouth: mouthScore,
                },
                'camera'
              );
            }
          } else {
            // 2. Optical Fallback Engine (analyzes live video pixel gradients or renders adaptive 468-mesh)
            let opticalBrow = 22 + Math.sin(frameCount * 0.04) * 6;
            let opticalSquint = 18 + Math.cos(frameCount * 0.05) * 5;
            let opticalMidface = 16 + Math.sin(frameCount * 0.03) * 5;
            let opticalMouth = 19 + Math.cos(frameCount * 0.04) * 6;

            if (hasLiveVideo && offCtx && video) {
              offCtx.drawImage(video, 0, 0, 160, 120);
              const img = offCtx.getImageData(40, 20, 80, 80).data;
              let gradSum = 0;
              for (let i = 0; i < img.length - 16; i += 16) {
                gradSum += Math.abs(img[i] - img[i + 16]);
              }
              const normGrad = Math.min(100, (gradSum / (img.length / 16)) * 2.4);
              opticalBrow = Math.min(95, Math.max(12, normGrad * 0.95));
              opticalSquint = Math.min(95, Math.max(10, normGrad * 0.88));
              opticalMidface = Math.min(95, Math.max(10, normGrad * 0.82));
              opticalMouth = Math.min(95, Math.max(10, normGrad * 0.85));
            }

            // Draw Optical Fallback HUD & Facial Landmark Grid on outputCanvas
            const cx = w / 2;
            const cy = h / 2;
            ctx.strokeStyle = 'rgba(196, 184, 247, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, w * 0.22, h * 0.34, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Draw key optical ROI tracking nodes
            const pulse = Math.sin(frameCount * 0.08) * 3;
            const nodes = [
              [cx - 38, cy - 36 + pulse],
              [cx - 14, cy - 32 + pulse],
              [cx + 14, cy - 32 + pulse],
              [cx + 38, cy - 36 + pulse],
              [cx - 28, cy - 14],
              [cx + 28, cy - 14],
              [cx, cy + 8],
              [cx - 24, cy + 38],
              [cx, cy + 42 - pulse],
              [cx + 24, cy + 38],
            ];
            ctx.fillStyle = '#E8FF3A';
            nodes.forEach(([nx, ny]) => {
              ctx.beginPath();
              ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
              ctx.fill();
            });

            if (frameCount % 6 === 0 && simulationModeRef.current === null) {
              const score =
                (opticalBrow * 0.3 +
                  opticalSquint * 0.28 +
                  opticalMidface * 0.2 +
                  opticalMouth * 0.22) /
                10;
              updatePainScore(
                score,
                {
                  brow: opticalBrow,
                  squint: opticalSquint,
                  midface: opticalMidface,
                  mouth: opticalMouth,
                },
                'camera'
              );
            }
          }
        }
      }

      cameraRafRef.current = requestAnimationFrame(renderLoop);
    };

    cameraRafRef.current = requestAnimationFrame(renderLoop);
  }, [exitSimulation, updatePainScore]);

  // 1-second rolling 60s Trend History & Ward Simulation updater
  useEffect(() => {
    const id = window.setInterval(() => {
      setTrendHistory((prev) => [...prev.slice(1), painScore]);

      // Update SLA stopwatch if alarm is active
      if (alarmActiveRef.current && slaStartRef.current !== null) {
        setSlaElapsedSeconds((Date.now() - slaStartRef.current) / 1000);
      }

      // Update cooldown timer display
      const rem = cooldownUntilRef.current - Date.now();
      setCooldownRemainingMs(rem > 0 ? rem : 0);

      // Gently fluctuate ward bed telemetry and sync active bed
      setWardBeds((prevBeds) =>
        prevBeds.map((b) => {
          if (b.bedNumber === activeCaseRef.current.bedNumber) {
            return {
              ...b,
              painScore,
              biomarkers,
              hr: vitals.hr,
              spo2: vitals.spo2,
              rr: vitals.rr,
              history: [...b.history.slice(1), painScore],
              threshold: thresholdRef.current,
            };
          }
          const delta = (Math.random() - 0.5) * 0.2;
          const nextScore = Number(
            Math.max(0.8, Math.min(9.5, b.painScore + delta)).toFixed(1)
          );
          return {
            ...b,
            painScore: nextScore,
            history: [...b.history.slice(1), nextScore],
          };
        })
      );
    }, 1000);

    return () => window.clearInterval(id);
  }, [painScore, biomarkers, vitals]);

  // Draw 60-Second Trend Graph on #trendChart canvas
  useEffect(() => {
    const canvas = trendCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Horizontal reference grid lines
    ctx.strokeStyle = 'rgba(169, 155, 234, 0.14)';
    ctx.lineWidth = 1;
    [2, 5, 8].forEach((lvl) => {
      const y = h - (lvl / 10) * (h - 20) - 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    });

    // Threshold line in dashed Neon Yellow / Rose
    const thrY = h - (threshold / 10) * (h - 20) - 10;
    ctx.strokeStyle = 'rgba(232, 255, 58, 0.75)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, thrY);
    ctx.lineTo(w, thrY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot 60s Pain Index curve
    if (trendHistory.length > 1) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(232, 255, 58, 0.34)');
      grad.addColorStop(1, 'rgba(169, 155, 234, 0.02)');

      ctx.beginPath();
      trendHistory.forEach((val, idx) => {
        const x = (idx / (trendHistory.length - 1)) * w;
        const y = h - (Math.min(10, Math.max(0, val)) / 10) * (h - 20) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = painScore >= threshold ? '#F43F5E' : '#E8FF3A';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }, [trendHistory, threshold, painScore]);

  // Draw Live Animated ECG Waveform on #ecgCanvas
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    let rafId = 0;
    const drawEcg = () => {
      phase += (vitals.hr / 60) * 0.14;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = painScore >= threshold ? '#F43F5E' : '#E8FF3A';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = (x / 28 + phase) % (Math.PI * 2);
        let yOffset = 0;
        if (t > 2.6 && t < 2.8) yOffset = -4;
        else if (t >= 2.8 && t < 2.95) yOffset = 5;
        else if (t >= 2.95 && t < 3.12) yOffset = -16;
        else if (t >= 3.12 && t < 3.28) yOffset = 9;
        else if (t > 3.6 && t < 4.1) yOffset = -5 * Math.sin(((t - 3.6) / 0.5) * Math.PI);

        const y = h / 2 + yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      rafId = requestAnimationFrame(drawEcg);
    };
    rafId = requestAnimationFrame(drawEcg);
    return () => cancelAnimationFrame(rafId);
  }, [vitals.hr, painScore, threshold]);

  // Severity helper
  const getSeverityBadge = (score: number) => {
    if (score >= 8) return { label: 'CRITICAL', labelHi: 'अति गंभीर', color: '#F43F5E' };
    if (score >= 6) return { label: 'SEVERE', labelHi: 'गंभीर दर्द', color: '#FB923C' };
    if (score >= 3) return { label: 'MODERATE', labelHi: 'मध्यम दर्द', color: '#FBBF24' };
    return { label: 'STABLE', labelHi: 'स्थिर / सामान्य', color: '#22C55E' };
  };

  const severity = getSeverityBadge(painScore);

  const handleSelectWardBed = (bed: WardBed) => {
    const matchedCase =
      PATIENT_CASE_FILES.find((c) => c.bedNumber === bed.bedNumber) ||
      PATIENT_CASE_FILES[0];
    setActiveCase(matchedCase);
    setThreshold(bed.threshold);
    updatePainScore(bed.painScore, bed.biomarkers, 'simulation');
    setActiveTab('monitor');
  };

  const handleSelectPatientCase = (patientCase: PatientCaseFile) => {
    setActiveCase(patientCase);
    setThreshold(patientCase.recommendedThreshold);
    setVitals({
      hr: patientCase.baseVitals.hr,
      spo2: patientCase.baseVitals.spo2,
      rr: patientCase.baseVitals.rr,
      dyspnea: 'Normal',
    });
    setActiveTab('monitor');
  };

  const handleTryInstantDemo = () => {
    setShowHero(false);
    setActiveTab('monitor');
    startSimulation('grimace');
  };

  return (
    <div className="min-h-screen aura-bg-grid text-[#F4F1FF] flex flex-col">
      {/* Full-Screen Hero Landing Overlay */}
      <HeroOverlay
        visible={showHero}
        onEnterMonitor={() => setShowHero(false)}
        onTryInstantDemo={handleTryInstantDemo}
        lang={lang}
      />

      {/* Persistent Automatic Bilingual Red/Neon Alarm Banner (#alertBanner) */}
      {alarmActive && (
        <div
          id="alertBanner"
          className="sticky top-0 z-40 bg-[#93000A]/95 backdrop-blur-xl border-b-2 border-[#E8FF3A] px-4 sm:px-8 py-3.5 shadow-[0_8px_32px_rgba(244,63,94,0.5)] animate-fade-up"
        >
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#E8FF3A] text-[#150F29] flex items-center justify-center font-bold shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E8FF3A] text-[#150F29]">
                    {activeCase.bedNumber}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    SILENT PAIN THRESHOLD BREACH — SCORE {painScore.toFixed(1)}/10
                  </span>
                  <span className="font-mono text-xs text-[#FFDAD6]">
                    ({getDominantBiomarkerName(biomarkers)})
                  </span>
                </div>
                <div className="font-hindi text-xs sm:text-sm text-[#E8FF3A] font-semibold mt-0.5">
                  ध्यान दें - दर्द चेतावनी: {activeCase.bedNumber} ({activeCase.name}) को तुरंत क्लिनिकल सहायता की आवश्यकता है
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live SLA Timer */}
              <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-[#FFDAD6]/30 text-right">
                <div className="text-[10px] font-mono uppercase text-[#FFDAD6]">
                  SLA RESPONSE TIMER
                </div>
                <div
                  id="slaTimer"
                  className="font-mono text-base font-bold text-[#E8FF3A]"
                >
                  {slaElapsedSeconds.toFixed(1)}s
                </div>
              </div>

              <button
                id="acknowledgeBtn"
                onClick={acknowledgeAlert}
                className="btn-neon px-5 py-3 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge Alert (6s Cooldown)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Application Header */}
      <header className="sticky top-0 z-30 bg-[#1E1638]/90 backdrop-blur-xl border-b border-[#A99BEA]/25">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Brand Logo (Clicking returns to Hero) */}
          <button
            id="brandLogo"
            onClick={() => setShowHero(true)}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Return to Hero Landing Page"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2A2145] border border-[#A99BEA]/40 group-hover:border-[#E8FF3A] flex items-center justify-center transition-colors shadow-[0_0_16px_rgba(169,155,234,0.2)]">
              <Activity className="w-5 h-5 text-[#E8FF3A]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-[#F4F1FF] whitespace-nowrap">
                AURA<span className="text-[#E8FF3A]">-PainCare</span>
              </div>
              <div className="text-[11px] font-mono text-[#B4ABD6] hidden sm:block">
                {activeCase.bedNumber} · {activeCase.name}
              </div>
            </div>
          </button>

          {/* Center: Clean Pill Tab Bar with Neon Yellow Active Tab (5 Tabs) */}
          <nav
            aria-label="Primary Clinical Navigation"
            className="flex items-center gap-1 p-1.5 rounded-full bg-[#150F29]/90 border border-[#A99BEA]/25 overflow-x-auto max-w-full"
          >
            {(
              [
                { id: 'monitor', label: 'Monitor', icon: Eye },
                { id: 'ward', label: 'ICU Ward', icon: LayoutGrid },
                { id: 'painmap', label: 'Pain Map & Voice', icon: Mic },
                { id: 'patients', label: 'Patients', icon: Users },
                { id: 'present', label: 'Present', icon: Presentation },
              ] as { id: ActiveTab; label: string; icon: React.ComponentType<any> }[]
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tabBtn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#E8FF3A] text-[#150F29] font-bold shadow-[0_0_16px_rgba(232,255,58,0.35)]'
                      : 'text-[#C4B8F7] hover:text-[#F4F1FF] hover:bg-[#2A2145]/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Audio Armed Pill (Bug Fix #2) + EN/Hindi Toggle + QR + Report */}
          <div className="flex items-center gap-2.5">
            <button
              id="alarmArmedPill"
              onClick={() => {
                MedicalAudioAlarm.unlock();
                MedicalAudioAlarm.playChime('severe');
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                audioUnlocked
                  ? 'bg-[#E8FF3A] text-[#150F29] shadow-[0_0_16px_rgba(232,255,58,0.4)]'
                  : 'bg-[#2A2145] text-[#C4B8F7] border border-[#A99BEA]/35 hover:border-[#E8FF3A]'
              }`}
              title="Click to test clinical chime & confirm audio is unlocked"
            >
              <span>🔔 Alarm sound armed</span>
            </button>

            <button
              id="langToggle"
              onClick={() =>
                setLang((prev) =>
                  prev === 'both' ? 'en' : prev === 'en' ? 'hi' : 'both'
                )
              }
              className="btn-lilac-glass px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Toggle English / Hindi Bilingual Labels"
            >
              <Languages className="w-3.5 h-3.5 text-[#E8FF3A]" />
              <span>
                {lang === 'both' ? 'EN + हिं' : lang === 'en' ? 'EN Only' : 'हिंदी'}
              </span>
            </button>

            <button
              id="qrBtn"
              onClick={() => setQrModalOpen(true)}
              className="btn-lilac-glass p-2.5 text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
              title="Mobile Nurse Station QR Pairing"
              aria-label="Open QR Pairing Modal"
            >
              <QrCode className="w-4 h-4 text-[#C4B8F7]" />
            </button>

            <button
              id="reportBtn"
              onClick={() => setReportModalOpen(true)}
              className="btn-lilac-glass px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-[#E8FF3A]" />
              <span className="hidden md:inline">Clinical Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'monitor' && (
          <div id="tab-monitor" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
            {/* LEFT 7 COLUMNS: Live Camera Viewport + Simulation Bar + 60s Trend Chart */}
            <div className="lg:col-span-7 space-y-6">
              {/* Live Optical & 468-Landmark Camera Card */}
              <div
                className={`aura-card p-5 space-y-4 ${
                  painScore >= 8
                    ? 'aura-card-critical'
                    : painScore >= 6
                    ? 'aura-card-severe'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#E8FF3A]">
                        {activeCase.bedNumber}
                      </span>
                      <span className="text-xs text-[#B4ABD6]">·</span>
                      <span className="text-sm font-bold text-[#F4F1FF]">
                        {activeCase.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#1E1638] border border-[#A99BEA]/30 text-[#C4B8F7]">
                        {engineMode}
                      </span>
                    </div>
                    <p id="cameraStatusText" className="text-xs text-[#B4ABD6] mt-0.5">
                      {cameraStatus}
                    </p>
                  </div>

                  {/* Camera Start / Stop Controls */}
                  <div className="flex items-center gap-2.5">
                    {!cameraActive ? (
                      <button
                        id="startCameraBtn"
                        onClick={startCamera}
                        className="btn-neon px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start Live Camera</span>
                      </button>
                    ) : (
                      <button
                        id="stopCameraBtn"
                        onClick={stopCamera}
                        className="btn-lilac-glass px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer text-[#F43F5E]"
                      >
                        <CameraOff className="w-4 h-4" />
                        <span>Stop Camera</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Video + 468-Landmark Overlay Viewport */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#100A24] border border-[#A99BEA]/30 flex items-center justify-center">
                  <video
                    id="webcamVideo"
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      cameraActive ? 'opacity-90' : 'opacity-25'
                    }`}
                  />
                  <canvas
                    id="outputCanvas"
                    ref={outputCanvasRef}
                    width={640}
                    height={400}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />

                  {/* Center Standby Graphic when neither camera nor simulation is active */}
                  {!cameraActive && !simulationMode && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#150F29]/75 backdrop-blur-xs">
                      <div className="w-16 h-16 rounded-full bg-[#2A2145] border border-[#A99BEA]/40 flex items-center justify-center mb-3 shadow-[0_0_28px_rgba(232,255,58,0.18)]">
                        <Camera className="w-7 h-7 text-[#E8FF3A]" />
                      </div>
                      <h3 className="text-base font-bold text-[#F4F1FF]">
                        Bedside Optical Biomarker Feed Ready
                      </h3>
                      <p className="text-xs text-[#B4ABD6] max-w-md mt-1">
                        Start the live webcam to track 468 facial landmarks in real time, or select a clinical simulation preset below to test the automatic 1.5s bilingual alarm.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                        <button
                          onClick={startCamera}
                          className="btn-neon px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Start Live Camera</span>
                        </button>
                        <button
                          onClick={() => startSimulation('grimace')}
                          className="btn-lilac-glass px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-[#E8FF3A] fill-[#E8FF3A]" />
                          <span>Run Grimace Alarm Demo</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Top-Left HUD Overlay: Live Score & Sustained Timer */}
                  <div className="absolute top-3 left-3 px-3.5 py-2 rounded-xl bg-[#150F29]/85 backdrop-blur-md border border-[#A99BEA]/30 flex items-center gap-3">
                    <div>
                      <div className="text-[10px] font-mono text-[#B4ABD6]">
                        LIVE PAIN INDEX
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          id="hudPainScore"
                          className="font-mono text-2xl font-bold"
                          style={{
                            color: painScore >= threshold ? '#E8FF3A' : severity.color,
                          }}
                        >
                          {painScore.toFixed(1)}
                        </span>
                        <span className="font-mono text-xs text-[#B4ABD6]">/ 10</span>
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: `${severity.color}22`,
                        color: severity.color,
                        borderColor: severity.color,
                      }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border"
                    >
                      {severity.label}
                    </div>
                  </div>

                  {/* Top-Right HUD Overlay: 1.5s Sustained Progress or 6s Cooldown */}
                  <div className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-[#150F29]/85 backdrop-blur-md border border-[#A99BEA]/30 text-right font-mono text-xs">
                    {cooldownRemainingMs > 0 ? (
                      <span className="text-[#22C55E]">
                        Cooldown: {(cooldownRemainingMs / 1000).toFixed(1)}s
                      </span>
                    ) : sustainedMs > 0 ? (
                      <span className="text-[#E8FF3A] font-bold">
                        Sustained: {(sustainedMs / 1000).toFixed(1)}s / 1.5s
                      </span>
                    ) : (
                      <span className="text-[#C4B8F7]">
                        Thr: {threshold.toFixed(1)} (1.5s trigger)
                      </span>
                    )}
                  </div>
                </div>

                {/* Clinical Simulation Preset Bar (Resting, Spasm, Grimace, Respiratory, Reset) */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#B4ABD6]">
                    CLINICAL SIMULATIONS:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="simResting"
                      onClick={() => startSimulation('resting')}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        simulationMode === 'resting'
                          ? 'bg-[#22C55E] text-[#150F29] font-bold'
                          : 'btn-lilac-glass'
                      }`}
                    >
                      Resting (1.3)
                    </button>
                    <button
                      id="simSpasm"
                      onClick={() => startSimulation('spasm')}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        simulationMode === 'spasm'
                          ? 'bg-[#FBBF24] text-[#150F29] font-bold'
                          : 'btn-lilac-glass'
                      }`}
                    >
                      Spasm (5.4)
                    </button>
                    <button
                      id="simGrimace"
                      onClick={() => startSimulation('grimace')}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        simulationMode === 'grimace'
                          ? 'bg-[#E8FF3A] text-[#150F29] font-bold shadow-[0_0_16px_rgba(232,255,58,0.45)]'
                          : 'btn-lilac-glass border-[#FB923C]/50 text-[#E8FF3A]'
                      }`}
                    >
                      ▶ Grimace Alarm (8.4)
                    </button>
                    <button
                      id="simRespiratory"
                      onClick={() => startSimulation('respiratory')}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        simulationMode === 'respiratory'
                          ? 'bg-[#F43F5E] text-white font-bold'
                          : 'btn-lilac-glass'
                      }`}
                    >
                      Respiratory (7.2)
                    </button>
                    <button
                      id="simReset"
                      onClick={() => {
                        exitSimulation();
                        acknowledgeAlert();
                        updatePainScore(
                          1.4,
                          { brow: 16, squint: 14, midface: 12, mouth: 15 },
                          'simulation'
                        );
                      }}
                      className="btn-lilac-glass px-3 py-2 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 60-Second Rolling Pain Trend Graph Card */}
              <div className="aura-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
                      60-SECOND NOCICEPTIVE TELEMETRY CURVE
                    </div>
                    <h3 className="text-base font-bold text-[#F4F1FF]">
                      Real-Time Pain Index &amp; Threshold Trajectory
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-[#E8FF3A]">● Pain Score</span>
                    <span className="text-[#B4ABD6]">--- Threshold ({threshold.toFixed(1)})</span>
                  </div>
                </div>

                <div className="w-full h-36 rounded-2xl bg-[#150F29]/85 border border-[#A99BEA]/20 p-2">
                  <canvas
                    id="trendChart"
                    ref={trendCanvasRef}
                    width={680}
                    height={130}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLUMNS: Pain Gauge & Threshold Calibrator + 4 Biomarker Bars + Vitals/Dyspnea + Incident Log */}
            <div className="lg:col-span-5 space-y-6">
              {/* Pain Gauge + Threshold Calibrator Card */}
              <div className="aura-card p-5 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
                      COMPOSITE PAIN GAUGE
                    </div>
                    <h2 className="text-lg font-bold text-[#F4F1FF]">
                      Silent-Pain Severity Index
                    </h2>
                    {lang !== 'en' && (
                      <p className="font-hindi text-xs text-[#B4ABD6]">
                        मूक दर्द सूचकांक ({severity.labelHi})
                      </p>
                    )}
                  </div>

                  {alarmActive && (
                    <button
                      onClick={acknowledgeAlert}
                      className="btn-neon px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>

                {/* Gauge Arc + Big Numeric Display */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1E1638]/90 border border-[#A99BEA]/25">
                    <div
                      id="painScoreDisplay"
                      className="font-mono text-5xl font-bold tracking-tight"
                      style={{
                        color: painScore >= threshold ? '#E8FF3A' : severity.color,
                      }}
                    >
                      {painScore.toFixed(1)}
                    </div>
                    <div className="text-xs font-mono text-[#B4ABD6] mt-1">
                      SCALE 0.0 – 10.0
                    </div>
                    <span
                      id="painSeverityBadge"
                      style={{
                        backgroundColor: `${severity.color}22`,
                        color: severity.color,
                        borderColor: severity.color,
                      }}
                      className="mt-2.5 px-3 py-1 rounded-full text-xs font-mono font-bold border"
                    >
                      {severity.label}
                    </span>
                  </div>

                  {/* 4 Facial Biomarker Bars */}
                  <div className="sm:col-span-7 space-y-3">
                    {[
                      {
                        id: 'browBar',
                        labelEn: 'Brow Lowering (AU4)',
                        labelHi: 'भौंहों का सिकुड़ना',
                        val: biomarkers.brow,
                      },
                      {
                        id: 'squintBar',
                        labelEn: 'Eye Squint (AU6/7)',
                        labelHi: 'आंखों का भींचना',
                        val: biomarkers.squint,
                      },
                      {
                        id: 'midfaceBar',
                        labelEn: 'Mid-Face Tension (AU9)',
                        labelHi: 'चेहरे के मध्य भाग में तनाव',
                        val: biomarkers.midface,
                      },
                      {
                        id: 'mouthBar',
                        labelEn: 'Mouth Grimace (AU20)',
                        labelHi: 'मुंह का खिंचाव / कराह',
                        val: biomarkers.mouth,
                      },
                    ].map((bm) => (
                      <div key={bm.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#F4F1FF] font-medium">
                            {bm.labelEn}
                            {lang !== 'en' && (
                              <span className="font-hindi text-[11px] text-[#B4ABD6] ml-1.5">
                                ({bm.labelHi})
                              </span>
                            )}
                          </span>
                          <span className="font-mono font-bold text-[#C4B8F7]">
                            {bm.val}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#150F29] overflow-hidden border border-[#A99BEA]/20">
                          <div
                            id={bm.id}
                            className="h-full rounded-full transition-all duration-150"
                            style={{
                              width: `${bm.val}%`,
                              backgroundColor:
                                bm.val >= 75
                                  ? '#F43F5E'
                                  : bm.val >= 55
                                  ? '#E8FF3A'
                                  : '#A99BEA',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threshold Calibrator Slider */}
                <div className="p-3.5 rounded-2xl bg-[#1E1638]/80 border border-[#A99BEA]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#F4F1FF]">
                      <Sliders className="w-3.5 h-3.5 text-[#E8FF3A]" />
                      <span>Alarm Trigger Threshold (1.5s Sustained)</span>
                    </span>
                    <span
                      id="thresholdValue"
                      className="font-mono text-sm font-bold text-[#E8FF3A]"
                    >
                      {threshold.toFixed(1)} / 10
                    </span>
                  </div>
                  <input
                    id="thresholdSlider"
                    type="range"
                    min={3.0}
                    max={9.0}
                    step={0.5}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full aura-slider"
                  />
                </div>
              </div>

              {/* Coupled Physiological Vitals & Dyspnea Detection Card */}
              <div className="aura-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
                    COUPLED VITALS &amp; DYSPNEA DETECTION
                  </div>
                  <span
                    id="dyspneaBadge"
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                      vitals.dyspnea.includes('ACUTE')
                        ? 'bg-[#F43F5E]/20 text-[#F43F5E] border-[#F43F5E]'
                        : vitals.dyspnea.includes('Mild')
                        ? 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]'
                        : 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/50'
                    }`}
                  >
                    Dyspnea: {vitals.dyspnea}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-[#1E1638]/90 border border-[#A99BEA]/20">
                    <div className="text-[10px] font-mono text-[#B4ABD6]">
                      HEART RATE
                    </div>
                    <div className="font-mono text-2xl font-bold text-[#F4F1FF] mt-0.5">
                      <span id="vitalHR">{vitals.hr}</span>{' '}
                      <span className="text-xs font-normal text-[#B4ABD6]">BPM</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1E1638]/90 border border-[#A99BEA]/20">
                    <div className="text-[10px] font-mono text-[#B4ABD6]">
                      BLOOD OXYGEN
                    </div>
                    <div className="font-mono text-2xl font-bold text-[#F4F1FF] mt-0.5">
                      <span id="vitalSpO2">{vitals.spo2}</span>
                      <span className="text-xs font-normal text-[#B4ABD6]">%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1E1638]/90 border border-[#A99BEA]/20">
                    <div className="text-[10px] font-mono text-[#B4ABD6]">
                      RESPIRATION
                    </div>
                    <div className="font-mono text-2xl font-bold text-[#F4F1FF] mt-0.5">
                      <span id="vitalRR">{vitals.rr}</span>{' '}
                      <span className="text-xs font-normal text-[#B4ABD6]">/m</span>
                    </div>
                  </div>
                </div>

                {/* Live ECG Strip */}
                <div className="p-2.5 rounded-xl bg-[#150F29]/90 border border-[#A99BEA]/20 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-[#C4B8F7] uppercase pl-1">
                    LIVE ECG LEAD II
                  </span>
                  <canvas
                    id="ecgCanvas"
                    ref={ecgCanvasRef}
                    width={260}
                    height={36}
                    className="w-48 sm:w-64 h-9"
                  />
                </div>
              </div>

              {/* Automated Incident & SLA Audit Log Card */}
              <div className="aura-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[#C4B8F7]">
                      AUTOMATED INCIDENT &amp; SLA LOG
                    </div>
                    <h3 className="text-sm font-bold text-[#F4F1FF]">
                      Sustained Pain Alert History ({incidents.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="text-xs font-mono text-[#E8FF3A] hover:underline cursor-pointer"
                  >
                    Export Shift Report →
                  </button>
                </div>

                <div
                  id="incidentLog"
                  className="space-y-2 max-h-44 overflow-y-auto pr-1"
                >
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        inc.acknowledged
                          ? 'bg-[#1E1638]/70 border-[#A99BEA]/20'
                          : 'bg-[#93000A]/40 border-[#F43F5E]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#C4B8F7]">
                            {inc.timestamp}
                          </span>
                          <span className="font-bold text-[#F4F1FF]">
                            Peak {inc.peakScore.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="text-[11px] text-[#B4ABD6]">
                          {inc.dominantBiomarker} · HR {inc.hr} · SpO2 {inc.spo2}%
                        </div>
                      </div>

                      <div className="text-right font-mono shrink-0">
                        {inc.acknowledged ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 text-[10px]">
                            ACK {inc.slaSeconds?.toFixed(1) || '2.0'}s
                          </span>
                        ) : (
                          <button
                            onClick={acknowledgeAlert}
                            className="px-2.5 py-1 rounded-full bg-[#E8FF3A] text-[#150F29] font-bold text-[10px] cursor-pointer"
                          >
                            ACK NOW
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ward' && (
          <ICUWardTab
            beds={wardBeds}
            activeBedId={
              wardBeds.find((b) => b.bedNumber === activeCase.bedNumber)?.id ||
              'bed-104'
            }
            onSelectBedForMonitor={handleSelectWardBed}
            onAcknowledgeBed={(bedId) => {
              setWardBeds((prev) =>
                prev.map((b) =>
                  b.id === bedId ? { ...b, painScore: 2.1, acknowledged: true } : b
                )
              );
              acknowledgeAlert();
            }}
            lang={lang}
          />
        )}

        {activeTab === 'painmap' && (
          <PainMapVoiceTab
            lang={lang}
            activePatientName={activeCase.name}
            activeBedNumber={activeCase.bedNumber}
            onTriggerSimulatedSpike={(score) => {
              updatePainScore(
                score,
                { brow: 80, squint: 75, midface: 70, mouth: 78 },
                'simulation'
              );
            }}
          />
        )}

        {activeTab === 'patients' && (
          <PatientsTab
            activeCaseId={activeCase.id}
            onSelectPatientCase={handleSelectPatientCase}
            lang={lang}
          />
        )}

        {activeTab === 'present' && (
          <PresentTab
            onLaunchDemoFromDeck={() => {
              setActiveTab('monitor');
              startSimulation('grimace');
            }}
          />
        )}
      </main>

      {/* Clinical Shift Handover Report Modal (#reportModal) */}
      <ClinicalReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        activeCase={activeCase}
        currentScore={painScore}
        threshold={threshold}
        biomarkers={biomarkers}
        vitals={vitals}
        trendHistory={trendHistory}
        incidents={incidents}
      />

      {/* Mobile Nurse Station QR Pairing Modal (#qrModal) */}
      <QRModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        activeCase={activeCase}
        currentScore={painScore}
      />
    </div>
  );
}

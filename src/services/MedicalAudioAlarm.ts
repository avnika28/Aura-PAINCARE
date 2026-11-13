/**
 * MedicalAudioAlarm
 * Handles Web Audio API IEC-style clinical chimes, pre-recorded /audio mp3 playback
 * with automatic Web Speech API (EN + Hindi) fallback, and browser gesture unlocking.
 */

type UnlockListener = (unlocked: boolean) => void;

class MedicalAudioAlarmService {
  private audioCtx: AudioContext | null = null;
  public unlocked: boolean = false;
  private listeners: Set<UnlockListener> = new Set();
  private activeChimeInterval: number | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private speechTimeoutId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const autoUnlock = () => {
        this.unlock();
      };
      window.addEventListener('pointerdown', autoUnlock, { once: true, passive: true });
      window.addEventListener('keydown', autoUnlock, { once: true, passive: true });
      window.addEventListener('touchstart', autoUnlock, { once: true, passive: true });
    }
  }

  public subscribe(listener: UnlockListener): () => void {
    this.listeners.add(listener);
    listener(this.unlocked);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.unlocked));
  }

  /**
   * Bug Fix #2:
   * Browsers block audio until a user gesture.
   * Resumes AudioContext, plays an inaudible blip, and speaks a silent empty utterance.
   */
  public unlock(): boolean {
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx && AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx) {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        // Play an inaudible 30ms blip to unlock hardware audio channel
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.03);
      }

      if ('speechSynthesis' in window) {
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        silentUtterance.rate = 2;
        window.speechSynthesis.speak(silentUtterance);
      }

      if (!this.unlocked) {
        this.unlocked = true;
        this.notifyListeners();
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Plays an IEC 60601-1-8 inspired multi-tone ICU clinical alarm chime
   */
  public playChime(severity: 'severe' | 'critical' = 'critical') {
    try {
      this.unlock();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const now = this.audioCtx.currentTime;
      // Clinical high-priority 3-pulse burst (C5 - F5 - A5 - C6)
      const freqs = severity === 'critical' ? [523.25, 698.46, 880.0, 1046.5] : [440.0, 587.33, 659.25];
      freqs.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const start = now + idx * 0.14;
        const duration = 0.12;

        const osc = this.audioCtx.createOscillator();
        const subOsc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq * 2, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        subOsc.start(start);
        osc.stop(start + duration + 0.02);
        subOsc.stop(start + duration + 0.02);
      });
    } catch {
      // Ignore WebAudio errors if blocked
    }
  }

  /**
   * Triggers repeating clinical chime + bilingual English & Hindi voice alert.
   * Tries pre-recorded /audio/alert_en.mp3 first, falling back to speechSynthesis
   * with an 80ms delay after cancel() (Bug Fix #4).
   */
  public triggerAlarmAudio(
    bedLabel: string,
    painScore: number,
    dominantBiomarker: string,
    lang: 'en' | 'hi' | 'both' = 'both'
  ) {
    this.stopAll();
    this.playChime(painScore >= 8 ? 'critical' : 'severe');

    // Repeat chime pulse every 4.2 seconds while alarm is active
    this.activeChimeInterval = window.setInterval(() => {
      this.playChime(painScore >= 8 ? 'critical' : 'severe');
    }, 4200);

    const scoreRounded = painScore.toFixed(1);
    const enText = `Critical pain alert in ${bedLabel}. Pain index ${scoreRounded} out of 10. High ${dominantBiomarker} detected. Immediate bedside assessment required.`;
    const hiText = `ध्यान दें, ${bedLabel} के मरीज़ को गंभीर दर्द हो रहा है। दर्द सूचकांक ${scoreRounded} है। कृपया तुरंत जांच करें।`;

    // Attempt pre-recorded audio in /audio/alert.mp3 first, fallback to Web Speech API
    const tryPreRecorded = new Audio('/audio/alert.mp3');
    this.currentAudioElement = tryPreRecorded;
    let fallbackCalled = false;

    const runSpeechFallback = () => {
      if (fallbackCalled) return;
      fallbackCalled = true;
      this.speakWithDelay(enText, hiText, lang);
    };

    tryPreRecorded.onerror = runSpeechFallback;
    const playPromise = tryPreRecorded.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          tryPreRecorded.onended = () => {
            this.speakWithDelay(enText, hiText, lang);
          };
        })
        .catch(() => {
          runSpeechFallback();
        });
    } else {
      runSpeechFallback();
    }
  }

  /**
   * Bug Fix #4: Delay speechSynthesis.speak() by ~80 ms after cancel() to avoid Chrome dropping it.
   */
  public speakWithDelay(enText: string, hiText: string, lang: 'en' | 'hi' | 'both' = 'both') {
    if (!('speechSynthesis' in window)) return;

    if (this.speechTimeoutId !== null) {
      window.clearTimeout(this.speechTimeoutId);
      this.speechTimeoutId = null;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    this.speechTimeoutId = window.setTimeout(() => {
      try {
        const voices = window.speechSynthesis.getVoices();
        const enVoice =
          voices.find((v) => v.lang.startsWith('en-IN')) ||
          voices.find((v) => v.lang.startsWith('en-GB')) ||
          voices.find((v) => v.lang.startsWith('en'));
        const hiVoice =
          voices.find((v) => v.lang.startsWith('hi')) ||
          voices.find((v) => v.lang.includes('IN'));

        if (lang === 'en' || lang === 'both') {
          const uEn = new SpeechSynthesisUtterance(enText);
          uEn.lang = 'en-IN';
          if (enVoice) uEn.voice = enVoice;
          uEn.rate = 1.02;
          uEn.pitch = 1.0;
          uEn.volume = 1.0;
          window.speechSynthesis.speak(uEn);
        }

        if (lang === 'hi' || lang === 'both') {
          const uHi = new SpeechSynthesisUtterance(hiText);
          uHi.lang = 'hi-IN';
          if (hiVoice) uHi.voice = hiVoice;
          uHi.rate = 0.96;
          uHi.pitch = 1.0;
          uHi.volume = 1.0;
          window.speechSynthesis.speak(uHi);
        }
      } catch {
        // Ignore synthesis error
      }
    }, 85);
  }

  public speakSingleCard(enText: string, hiText: string) {
    this.unlock();
    this.playChime('severe');
    this.speakWithDelay(enText, hiText, 'both');
  }

  public stopAll() {
    if (this.activeChimeInterval !== null) {
      window.clearInterval(this.activeChimeInterval);
      this.activeChimeInterval = null;
    }
    if (this.speechTimeoutId !== null) {
      window.clearTimeout(this.speechTimeoutId);
      this.speechTimeoutId = null;
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export const MedicalAudioAlarm = new MedicalAudioAlarmService();

// Expose on window for legacy compatibility
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).MedicalAudioAlarm = MedicalAudioAlarm;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.playClick();
    return this.isMuted;
  }

  public getMuteState() {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Web Audio Click failed', e);
    }
  }

  public playScanning() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Web Audio Scan failed', e);
    }
  }

  public playLaunchRumble() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.ctx.createBiquadFilter) return;

      const bufferSize = this.ctx.sampleRate * 2.5; // 2.5 seconds rumble
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate Pink Noise
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // scale
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Dynamic Filter Sweep for rocket rising
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(8, this.ctx.currentTime);
      filter.frequency.setValueAtTime(100, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2500, this.ctx.currentTime + 2.0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.5);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      // Add a high-pitch whistle oscillator for metal stress/engine thrust
      const whistle = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistle.type = 'triangle';
      whistle.frequency.setValueAtTime(80, this.ctx.currentTime);
      whistle.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 1.5);
      whistleGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);

      whistle.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);

      noiseSource.start();
      whistle.start();
      
      noiseSource.stop(this.ctx.currentTime + 2.5);
      whistle.stop(this.ctx.currentTime + 2.5);
    } catch (e) {
      console.warn('Web Audio Launch failed', e);
    }
  }

  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major arpeggio
      
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.45);
      });
    } catch (e) {
      console.warn('Web Audio Success Chime failed', e);
    }
  }

  public playErrorBuzz() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.setValueAtTime(105, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Web Audio Error Buzz failed', e);
    }
  }

  public playLanguageChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.12);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn('Web Audio Lang Chime failed', e);
    }
  }

  // Speak Text using speech synthesis in a female friendly voice
  public speakText(text: string, lang: 'en' | 'bn', onEnd?: () => void) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop current speaking

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Localize speech
        if (lang === 'bn') {
          utterance.lang = 'bn-BD'; // Try Bengali Bangladesh first
        } else {
          utterance.lang = 'en-US';
        }

        // Voice configuration
        const voices = window.speechSynthesis.getVoices();
        
        // Find female voice
        let selectedVoice = null;
        
        if (lang === 'bn') {
          selectedVoice = voices.find(v => 
            v.lang.startsWith('bn') && 
            (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('mitra'))
          ) || voices.find(v => v.lang.startsWith('bn'));
        } else {
          selectedVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('google'))
          ) || voices.find(v => v.lang.startsWith('en'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.pitch = 1.15; // slightly higher pitch to make it sound friendly and feminine
        utterance.rate = lang === 'bn' ? 0.95 : 1.0; // comfortable pacing

        if (onEnd) {
          utterance.onend = onEnd;
          utterance.onerror = onEnd;
        }

        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('SpeechSynthesis not supported.');
        if (onEnd) onEnd();
      }
    } catch (e) {
      console.error('TTS error', e);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.error('Stop speaking error', e);
    }
  }
}

export const sounds = new SoundEffectsEngine();
export default sounds;

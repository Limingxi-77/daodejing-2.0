// Web Audio API 纯代码生成白噪音和环境音
// 无需加载外部 MP3 文件，极致轻量

class AudioEngine {
  private ctx: AudioContext | null = null;
  private rainNode: ScriptProcessorNode | null = null;
  private rainGain: GainNode | null = null;
  private isInitialized = false;

  constructor() {
    // 懒加载 AudioContext
  }

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContext();
    this.isInitialized = true;
  }

  // --- 雨声 (粉红/布朗噪音模拟) ---
  toggleRain(enable: boolean, volume: number = 0.5) {
    if (!this.isInitialized) this.init();
    if (!this.ctx) return;

    if (enable) {
      if (this.rainNode) return; // 已经在播放

      // 创建缓冲区大小
      const bufferSize = 4096;
      this.rainNode = this.ctx.createScriptProcessor(bufferSize, 1, 1);

      this.rainNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          // 生成粉红噪音 (近似雨声)
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // 补偿增益
        }
      };

      let lastOut = 0;
      
      // 创建增益节点控制音量
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = volume * 0.2; // 默认稍微小一点

      // 连接节点
      this.rainNode.connect(this.rainGain);
      this.rainGain.connect(this.ctx.destination);
    } else {
      if (this.rainNode) {
        this.rainNode.disconnect();
        this.rainNode = null;
      }
      if (this.rainGain) {
        this.rainGain.disconnect();
        this.rainGain = null;
      }
    }
  }

  setRainVolume(volume: number) {
    if (this.rainGain) {
      this.rainGain.gain.value = volume * 0.2;
    }
  }

  // --- 颂钵 (正弦波叠加模拟) ---
  playBowl() {
    if (!this.isInitialized) this.init();
    if (!this.ctx) return;

    const baseFreq = 180; // 基础频率
    const harmonics = [1, 2.8, 4.2]; // 泛音比率
    const gains = [0.5, 0.2, 0.1]; // 泛音音量

    const masterGain = this.ctx.createGain();
    masterGain.connect(this.ctx.destination);
    masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.1); // 敲击声起
    masterGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 8); // 悠长的尾音 (8秒)

    harmonics.forEach((h, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * h;
      
      const oscGain = this.ctx.createGain();
      oscGain.gain.value = gains[i];
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 8);
    });
  }
}

export const audioEngine = new AudioEngine();

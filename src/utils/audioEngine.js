// Web Audio API 音乐引擎 v2 - 赛博朋克风格 · 丰富层次版
let audioCtx = null
let currentGain = null
let isPlaying = false
let loopTimer = null
let activeOscillators = []

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

// ==================== 效果器 ====================
async function createReverb(ctx, duration = 2, decay = 2) {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const impulse = ctx.createBuffer(2, length, sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  const convolver = ctx.createConvolver()
  convolver.buffer = impulse
  return convolver
}

function createDelay(ctx, time = 0.3, feedback = 0.3) {
  const delay = ctx.createDelay(2)
  delay.delayTime.value = time
  const fb = ctx.createGain()
  fb.gain.value = feedback
  delay.connect(fb)
  fb.connect(delay)
  return { delay, fb }
}

function createDistortion(ctx, amount = 3) {
  const ws = ctx.createWaveShaper()
  const samples = 512
  const curve = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    curve[i] = Math.tanh(x * amount)
  }
  ws.curve = curve
  return ws
}

function createChorus(ctx, depth = 0.003, rate = 1.5) {
  const delay = ctx.createDelay()
  delay.delayTime.value = 0.03
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = rate
  lfoGain.gain.value = depth
  lfo.connect(lfoGain)
  lfoGain.connect(delay.delayTime)
  lfo.start()
  return delay
}

// ==================== 音符工具 ====================
const NF = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50,
  'Eb2': 77.78, 'Bb2': 116.54, 'Eb3': 155.56, 'Bb3': 233.08, 'Eb4': 311.13, 'Bb4': 466.16, 'Eb5': 622.25,
  'F#2': 92.50, 'F#3': 185.00, 'C#3': 138.59, 'C#4': 277.18, 'F#4': 369.99, 'G#3': 207.65, 'G#4': 415.30,
  'Ab2': 103.83, 'Ab3': 207.65, 'Db3': 138.59, 'Db4': 277.18,
}

function freq(note) { return NF[note] || 440 }

// ==================== 噪声缓冲 ====================
function createNoiseBuffer(ctx, duration) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buf
}

// ==================== SYNTHWAVE 引擎 (丰富版) ====================
async function playSynthwave(ctx, masterGain) {
  const bpm = 118
  const bt = 60 / bpm
  const t0 = ctx.currentTime + 0.05

  // 效果链
  const reverb = await createReverb(ctx, 4, 2)
  const revG = ctx.createGain(); revG.gain.value = 0.35
  reverb.connect(revG); revG.connect(masterGain)

  const { delay: dly } = createDelay(ctx, bt * 0.375, 0.3)
  const dlyG = ctx.createGain(); dlyG.gain.value = 0.2
  dly.connect(dlyG); dlyG.connect(masterGain); dlyG.connect(reverb)

  const chorus = createChorus(ctx)
  const chrG = ctx.createGain(); chrG.gain.value = 0.15
  chorus.connect(chrG); chrG.connect(masterGain)

  // 和弦进行 (8小节): Am - F - C - G - Am - Em - F - G
  const progression = [
    ['A2','C3','E3'], ['F2','A2','C3'], ['C3','E3','G3'], ['G2','B2','D3'],
    ['A2','C3','E3'], ['E2','G2','B2'], ['F2','A2','C3'], ['G2','B2','D3'],
  ]

  // 高音和弦 (高八度叠加)
  const highChords = progression.map(c => c.map(n => {
    const note = n.replace(/\d/, m => String(Number(m) + 1))
    return note
  }))

  const totalBars = progression.length
  const loopDur = totalBars * 4 * bt

  // ---- Pad 层 (双层叠加) ----
  progression.forEach((chord, ci) => {
    const cs = t0 + ci * 4 * bt
    // 低频 Pad - sawtooth
    chord.forEach(n => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sawtooth'; o.frequency.value = freq(n) * 0.5
      o.detune.value = (Math.random() - 0.5) * 6
      g.gain.setValueAtTime(0, cs)
      g.gain.linearRampToValueAtTime(0.06, cs + bt * 1.5)
      g.gain.setValueAtTime(0.06, cs + bt * 3.5)
      g.gain.linearRampToValueAtTime(0, cs + bt * 4)
      o.connect(g); g.connect(reverb); g.connect(masterGain)
      o.start(cs); o.stop(cs + bt * 4 + 0.1)
    })
    // 高频 Pad - sine (增加空气感)
    highChords[ci].forEach(n => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq(n) * 0.5
      g.gain.setValueAtTime(0, cs)
      g.gain.linearRampToValueAtTime(0.03, cs + bt * 2)
      g.gain.linearRampToValueAtTime(0, cs + bt * 4)
      o.connect(g); g.connect(chorus); g.connect(reverb)
      o.start(cs); o.stop(cs + bt * 4 + 0.1)
    })
  })

  // ---- 主琶音层 ----
  const arpPatterns = [
    [0,1,2,1, 0,2,1,2, 0,1,2,0, 1,2,1,0],
    [2,1,0,1, 2,0,1,0, 2,1,0,2, 1,0,1,2],
    [0,2,1,0, 2,1,0,2, 1,0,2,1, 0,2,0,1],
    [1,0,2,1, 0,1,2,0, 1,2,0,1, 2,0,1,2],
    [0,1,0,2, 1,2,1,0, 2,0,2,1, 0,1,0,2],
    [2,0,1,2, 0,2,1,0, 1,2,0,1, 2,1,2,0],
    [0,2,0,1, 2,1,2,0, 1,0,1,2, 0,2,0,1],
    [1,2,1,0, 2,0,2,1, 0,1,0,2, 1,0,1,2],
  ]

  progression.forEach((chord, ci) => {
    const pat = arpPatterns[ci]
    const base = t0 + ci * 4 * bt
    for (let i = 0; i < 16; i++) {
      const n = chord[pat[i] % chord.length]
      const time = base + i * bt * 0.25
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'square'
      o.frequency.value = freq(n) * 2
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.09, time + 0.008)
      g.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.22)
      o.connect(g); g.connect(dly); g.connect(masterGain)
      o.start(time); o.stop(time + bt * 0.25 + 0.05)
    }
  })

  // ---- 旋律层 (合成器 Lead) ----
  const melody = [
    null, ['E5','D5','C5','B4'], null, ['G4','A4','B4','D5'],
    ['E5','G5','A5','G5'], null, ['A5','G5','F5','E5'], ['D5','E5','G5','E5'],
  ]
  melody.forEach((notes, ci) => {
    if (!notes) return
    const base = t0 + ci * 4 + bt * 2 // 从第3拍开始
    notes.forEach((n, i) => {
      const time = base + i * bt
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sawtooth'
      o.frequency.value = freq(n)
      o.detune.value = (Math.random() - 0.5) * 4
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.1, time + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.85)
      o.connect(g); g.connect(dly); g.connect(reverb); g.connect(masterGain)
      o.start(time); o.stop(time + bt + 0.05)
    })
  })

  // ---- Bass 层 (双层) ----
  progression.forEach((chord, ci) => {
    const bassN = chord[0]
    const base = t0 + ci * 4 * bt
    // Sub bass
    for (let b = 0; b < 4; b++) {
      const time = base + b * bt
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq(bassN) * 0.25
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.2, time + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.9)
      o.connect(g); g.connect(masterGain)
      o.start(time); o.stop(time + bt + 0.05)
    }
    // Synth bass (sawtooth)
    for (let b = 0; b < 8; b++) {
      const time = base + b * bt * 0.5
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sawtooth'; o.frequency.value = freq(bassN) * 0.5
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.12, time + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.4)
      o.connect(g); g.connect(masterGain)
      o.start(time); o.stop(time + bt * 0.5 + 0.05)
    }
  })

  // ---- 鼓机层 (丰富版) ----
  const noiseBuf = createNoiseBuffer(ctx, 0.3)
  for (let bar = 0; bar < totalBars; bar++) {
    const bs = t0 + bar * 4 * bt

    // Kick (4 on the floor)
    for (let b = 0; b < 4; b++) {
      const t = bs + b * bt
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.setValueAtTime(160, t)
      o.frequency.exponentialRampToValueAtTime(28, t + 0.12)
      g.gain.setValueAtTime(0.65, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
      o.connect(g); g.connect(masterGain)
      o.start(t); o.stop(t + 0.25)
    }

    // Snare (2, 4)
    for (let b = 0; b < 4; b++) {
      if (b % 2 === 1) {
        const t = bs + b * bt
        const src = ctx.createBufferSource()
        src.buffer = noiseBuf
        const g = ctx.createGain()
        const flt = ctx.createBiquadFilter()
        flt.type = 'bandpass'; flt.frequency.value = 3500; flt.Q.value = 1.2
        g.gain.setValueAtTime(0.22, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
        src.connect(flt); flt.connect(g); g.connect(masterGain)
        src.start(t)
        // Snare tone
        const o = ctx.createOscillator()
        const og = ctx.createGain()
        o.frequency.setValueAtTime(200, t)
        o.frequency.exponentialRampToValueAtTime(100, t + 0.04)
        og.gain.setValueAtTime(0.15, t)
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
        o.connect(og); og.connect(masterGain)
        o.start(t); o.stop(t + 0.08)
      }
    }

    // Open hi-hat (offbeats)
    for (let b = 0; b < 4; b++) {
      const t = bs + b * bt + bt * 0.5
      const src = ctx.createBufferSource()
      src.buffer = noiseBuf
      const g = ctx.createGain()
      const flt = ctx.createBiquadFilter()
      flt.type = 'highpass'; flt.frequency.value = 9000
      g.gain.setValueAtTime(0.1, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      src.connect(flt); flt.connect(g); g.connect(masterGain)
      src.start(t)
    }

    // Closed hi-hat (16ths)
    for (let b = 0; b < 16; b++) {
      const t = bs + b * bt * 0.25
      const src = ctx.createBufferSource()
      src.buffer = noiseBuf
      const g = ctx.createGain()
      const flt = ctx.createBiquadFilter()
      flt.type = 'highpass'; flt.frequency.value = 11000
      const vol = b % 4 === 0 ? 0.1 : b % 2 === 0 ? 0.06 : 0.03
      g.gain.setValueAtTime(vol, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
      src.connect(flt); flt.connect(g); g.connect(masterGain)
      src.start(t)
    }

    // Clap (snare ghost)
    if (bar % 2 === 1) {
      const t = bs + 2 * bt + bt * 0.5
      for (let c = 0; c < 3; c++) {
        const src = ctx.createBufferSource()
        src.buffer = noiseBuf
        const g = ctx.createGain()
        const flt = ctx.createBiquadFilter()
        flt.type = 'bandpass'; flt.frequency.value = 2500
        g.gain.setValueAtTime(0.08, t + c * 0.015)
        g.gain.exponentialRampToValueAtTime(0.001, t + c * 0.015 + 0.06)
        src.connect(flt); flt.connect(g); g.connect(masterGain)
        src.start(t + c * 0.015)
      }
    }

    // Ride cymbal (每4小节)
    if (bar % 4 === 0) {
      const t = bs
      const src = ctx.createBufferSource()
      src.buffer = createNoiseBuffer(ctx, 4)
      const g = ctx.createGain()
      const flt = ctx.createBiquadFilter()
      flt.type = 'highpass'; flt.frequency.value = 7000
      g.gain.setValueAtTime(0.04, t)
      g.gain.linearRampToValueAtTime(0.02, t + 3)
      g.gain.linearRampToValueAtTime(0, t + 4)
      src.connect(flt); flt.connect(g); g.connect(reverb)
      src.start(t)
    }
  }

  return loopDur
}

// ==================== SHOEGAZE 引擎 (丰富版) ====================
async function playShoegaze(ctx, masterGain) {
  const bpm = 138
  const bt = 60 / bpm
  const t0 = ctx.currentTime + 0.05

  const reverb = await createReverb(ctx, 5, 1.2)
  const revG = ctx.createGain(); revG.gain.value = 0.55
  reverb.connect(revG); revG.connect(masterGain)

  const { delay: dly } = createDelay(ctx, bt * 0.5, 0.35)
  const dlyG = ctx.createGain(); dlyG.gain.value = 0.25
  dly.connect(dlyG); dlyG.connect(masterGain); dlyG.connect(reverb)

  const chorus = createChorus(ctx, 0.005, 2)
  const chrG = ctx.createGain(); chrG.gain.value = 0.2
  chorus.connect(chrG); chrG.connect(reverb)

  // 8小节和弦进行: Em - Cmaj7 - G - D/F# - Am - Em - Fmaj7 - B7
  const progression = [
    ['E2','G2','B2','D3'], ['C3','E3','G3','B3'], ['G2','B2','D3','G3'], ['D3','F#3','A3','D4'],
    ['A2','C3','E3','A3'], ['E2','G2','B2','E3'], ['F2','A2','C3','E3'], ['B2','D#3','F#3','B3'],
  ]

  const totalBars = progression.length
  const loopDur = totalBars * 4 * bt

  // ---- 失真吉他墙 (多层叠加) ----
  progression.forEach((chord, ci) => {
    const cs = t0 + ci * 4 * bt
    chord.forEach((n, ni) => {
      // 每个音3轨失真 (厚墙效果)
      for (let tr = 0; tr < 3; tr++) {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        const dist = createDistortion(ctx, 2.5 + tr * 0.5)
        o.type = 'sawtooth'
        o.frequency.value = freq(n) * (tr === 2 ? 2 : 1)
        o.detune.value = (tr - 1) * 8 + (Math.random() - 0.5) * 5
        g.gain.setValueAtTime(0, cs)
        g.gain.linearRampToValueAtTime(0.04, cs + bt * 1)
        g.gain.setValueAtTime(0.04, cs + bt * 3.5)
        g.gain.linearRampToValueAtTime(0, cs + bt * 4)
        o.connect(dist); dist.connect(g)
        g.connect(reverb); g.connect(chorus); g.connect(masterGain)
        o.start(cs); o.stop(cs + bt * 4 + 0.1)
      }
    })
  })

  // ---- 梦幻旋律 (双八度) ----
  const melodyA = [
    ['E5','G5','B5','A5','G5','F#5','E5','D5'],
    ['C5','E5','G5','A5','G5','E5','D5','C5'],
    ['G4','B4','D5','E5','D5','B4','A4','G4'],
    ['D5','F#5','A5','B5','A5','F#5','E5','D5'],
    ['A4','C5','E5','F#5','E5','C5','B4','A4'],
    ['E5','G5','B5','A5','G5','F#5','E5','D5'],
    ['F4','A4','C5','E5','D5','C5','A4','F4'],
    ['B4','D#5','F#5','A5','G5','F#5','D#5','B4'],
  ]

  melodyA.forEach((notes, ci) => {
    const base = t0 + ci * 4 * bt
    notes.forEach((n, i) => {
      const time = base + i * bt * 0.5
      // 主旋律
      const o1 = ctx.createOscillator()
      const g1 = ctx.createGain()
      o1.type = 'sine'; o1.frequency.value = freq(n)
      g1.gain.setValueAtTime(0, time)
      g1.gain.linearRampToValueAtTime(0.07, time + 0.04)
      g1.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.45)
      o1.connect(g1); g1.connect(dly); g1.connect(reverb); g1.connect(masterGain)
      o1.start(time); o1.stop(time + bt * 0.5 + 0.05)
      // 高八度泛音
      const o2 = ctx.createOscillator()
      const g2 = ctx.createGain()
      o2.type = 'sine'; o2.frequency.value = freq(n) * 2
      g2.gain.setValueAtTime(0, time)
      g2.gain.linearRampToValueAtTime(0.025, time + 0.04)
      g2.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.35)
      o2.connect(g2); g2.connect(reverb)
      o2.start(time); o2.stop(time + bt * 0.4 + 0.05)
    })
  })

  // ---- 第二旋律 (对位) ----
  const melodyB = [
    null, null, ['D5','E5','G5','B5'], null,
    ['E5','D5','C5','B4'], null, ['A4','C5','E5','G5'], ['F#5','E5','D5','C5'],
  ]
  melodyB.forEach((notes, ci) => {
    if (!notes) return
    const base = t0 + ci * 4 * bt + bt * 2
    notes.forEach((n, i) => {
      const time = base + i * bt
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'triangle'; o.frequency.value = freq(n)
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.05, time + 0.05)
      g.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.8)
      o.connect(g); g.connect(dly); g.connect(reverb); g.connect(masterGain)
      o.start(time); o.stop(time + bt + 0.05)
    })
  })

  // ---- Bass (滑音合成贝斯) ----
  progression.forEach((chord, ci) => {
    const bassN = chord[0]
    const base = t0 + ci * 4 * bt
    for (let b = 0; b < 4; b++) {
      const t = base + b * bt
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(freq(bassN) * 0.5, t)
      if (b === 0) o.frequency.linearRampToValueAtTime(freq(bassN) * 0.5, t + 0.05)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.18, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t + bt * 0.85)
      o.connect(g); g.connect(masterGain)
      o.start(t); o.stop(t + bt + 0.05)
    }
  })

  // ---- 鼓 (shoegaze 风格) ----
  const noiseBuf = createNoiseBuffer(ctx, 0.5)
  for (let bar = 0; bar < totalBars; bar++) {
    const bs = t0 + bar * 4 * bt

    // Kick
    for (let b = 0; b < 4; b++) {
      const t = bs + b * bt
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.setValueAtTime(120, t)
      o.frequency.exponentialRampToValueAtTime(25, t + 0.1)
      g.gain.setValueAtTime(0.45, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      o.connect(g); g.connect(masterGain)
      o.start(t); o.stop(t + 0.2)
    }

    // Snare (2, 4) + ghost notes
    for (let b = 0; b < 8; b++) {
      const t = bs + b * bt * 0.5
      const isMain = b % 4 === 2
      const isGhost = b % 4 === 1 || b % 4 === 3
      if (isMain) {
        const src = ctx.createBufferSource()
        src.buffer = noiseBuf
        const g = ctx.createGain()
        const flt = ctx.createBiquadFilter()
        flt.type = 'bandpass'; flt.frequency.value = 3000; flt.Q.value = 0.8
        g.gain.setValueAtTime(0.2, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        src.connect(flt); flt.connect(g); g.connect(reverb); g.connect(masterGain)
        src.start(t)
      } else if (isGhost && bar % 2 === 0) {
        const src = ctx.createBufferSource()
        src.buffer = noiseBuf
        const g = ctx.createGain()
        const flt = ctx.createBiquadFilter()
        flt.type = 'bandpass'; flt.frequency.value = 4000
        g.gain.setValueAtTime(0.04, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
        src.connect(flt); flt.connect(g); g.connect(masterGain)
        src.start(t)
      }
    }

    // Crash (每2小节)
    if (bar % 2 === 0) {
      const t = bs
      const src = ctx.createBufferSource()
      src.buffer = createNoiseBuffer(ctx, 2)
      const g = ctx.createGain()
      const flt = ctx.createBiquadFilter()
      flt.type = 'highpass'; flt.frequency.value = 5000
      g.gain.setValueAtTime(0.12, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.8)
      src.connect(flt); flt.connect(g); g.connect(reverb); g.connect(masterGain)
      src.start(t)
    }

    // Ride (持续)
    for (let b = 0; b < 8; b++) {
      const t = bs + b * bt * 0.5
      const src = ctx.createBufferSource()
      src.buffer = noiseBuf
      const g = ctx.createGain()
      const flt = ctx.createBiquadFilter()
      flt.type = 'highpass'; flt.frequency.value = 8000
      g.gain.setValueAtTime(b % 2 === 0 ? 0.05 : 0.03, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
      src.connect(flt); flt.connect(g); g.connect(reverb)
      src.start(t)
    }
  }

  return loopDur
}

// ==================== LO-FI 引擎 (丰富版) ====================
async function playLofi(ctx, masterGain) {
  const bpm = 82
  const bt = 60 / bpm
  const t0 = ctx.currentTime + 0.05

  const reverb = await createReverb(ctx, 2.5, 2.5)
  const revG = ctx.createGain(); revG.gain.value = 0.3
  reverb.connect(revG); revG.connect(masterGain)

  const { delay: dly } = createDelay(ctx, bt * 0.75, 0.2)
  const dlyG = ctx.createGain(); dlyG.gain.value = 0.15
  dly.connect(dlyG); dlyG.connect(masterGain)

  // 8小节爵士和弦: Dm7 - G9 - Cmaj7 - Am9 - Fm7 - Bb9 - Ebmaj7 - Dm7
  const progression = [
    ['D3','F3','A3','C4'], ['G3','B3','D4','F4'], ['C3','E3','G3','B3'], ['A3','C4','E4','G4'],
    ['F3','Ab3','C4','Eb4'], ['B3','D4','F4','Ab4'], ['Eb3','G3','Bb3','D4'], ['D3','F3','A3','C4'],
  ]

  const totalBars = progression.length
  const loopDur = totalBars * 4 * bt

  // ---- 钢琴和弦 (多层) ----
  progression.forEach((chord, ci) => {
    const cs = t0 + ci * 4 * bt
    // 第一拍和第三拍弹和弦
    for (let hit = 0; hit < 2; hit++) {
      const ht = cs + hit * 2 * bt
      chord.forEach((n, ni) => {
        // 低频层
        const o1 = ctx.createOscillator()
        const g1 = ctx.createGain()
        o1.type = 'triangle'; o1.frequency.value = freq(n)
        o1.detune.value = (Math.random() - 0.5) * 10
        g1.gain.setValueAtTime(0, ht + ni * 0.012)
        g1.gain.linearRampToValueAtTime(0.07, ht + ni * 0.012 + 0.015)
        g1.gain.exponentialRampToValueAtTime(0.001, ht + ni * 0.012 + bt * 1.8)
        o1.connect(g1); g1.connect(reverb); g1.connect(masterGain)
        o1.start(ht + ni * 0.012); o1.stop(ht + ni * 0.012 + bt * 2 + 0.05)

        // 高频泛音层
        const o2 = ctx.createOscillator()
        const g2 = ctx.createGain()
        o2.type = 'sine'; o2.frequency.value = freq(n) * 2
        g2.gain.setValueAtTime(0, ht + ni * 0.012)
        g2.gain.linearRampToValueAtTime(0.02, ht + ni * 0.012 + 0.02)
        g2.gain.exponentialRampToValueAtTime(0.001, ht + ni * 0.012 + bt * 1.2)
        o2.connect(g2); g2.connect(dly); g2.connect(reverb)
        o2.start(ht + ni * 0.012); o2.stop(ht + ni * 0.012 + bt * 1.5 + 0.05)
      })
    }
    // 添加装饰音 (和弦内音的高八度短音)
    if (ci % 2 === 0) {
      const decoTime = cs + bt * 3.5
      const decoNote = chord[chord.length - 1]
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq(decoNote) * 2
      g.gain.setValueAtTime(0, decoTime)
      g.gain.linearRampToValueAtTime(0.04, decoTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, decoTime + bt * 0.4)
      o.connect(g); g.connect(dly); g.connect(reverb)
      o.start(decoTime); o.stop(decoTime + bt * 0.5 + 0.05)
    }
  })

  // ---- 爵士钢琴走句 (偶数小节插入) ----
  const runs = [
    null, ['C5','D5','E5','G5','A5','G5','E5','D5'],
    null, ['E5','G5','A5','C6','B5','A5','G5','E5'],
    null, ['Ab4','Bb4','C5','Eb5','D5','C5','Bb4','Ab4'],
    null, ['A4','C5','D5','F5','E5','D5','C5','A4'],
  ]
  runs.forEach((notes, ci) => {
    if (!notes) return
    const base = t0 + ci * 4 + bt
    notes.forEach((n, i) => {
      const time = base + i * bt * 0.5
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'triangle'; o.frequency.value = freq(n)
      o.detune.value = (Math.random() - 0.5) * 6
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.06, time + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.4)
      o.connect(g); g.connect(dly); g.connect(reverb); g.connect(masterGain)
      o.start(time); o.stop(time + bt * 0.5 + 0.05)
    })
  })

  // ---- 贝斯 (walking bass 风格) ----
  const bassLines = [
    ['D3','F3','A3','C3'], ['G2','B2','D3','F3'], ['C3','E3','G2','B2'], ['A2','C3','E3','G2'],
    ['F2','Ab2','C3','Eb3'], ['Bb2','D3','F3','Ab2'], ['Eb2','G2','Bb2','D3'], ['D3','A2','F2','D2'],
  ]
  bassLines.forEach((line, ci) => {
    const base = t0 + ci * 4 * bt
    line.forEach((n, i) => {
      const time = base + i * bt
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq(n) * 0.5
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.2, time + 0.025)
      g.gain.exponentialRampToValueAtTime(0.001, time + bt * 0.85)
      o.connect(g); g.connect(masterGain)
      o.start(time); o.stop(time + bt + 0.05)
    })
  })

  // ---- Rhodes 电钢琴装饰 ----
  progression.forEach((chord, ci) => {
    if (ci % 2 === 1) return
    const base = t0 + ci * 4 + bt * 2.5
    const n = chord[2]
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = freq(n) * 4 // bell tone
    g.gain.setValueAtTime(0, base)
    g.gain.linearRampToValueAtTime(0.03, base + 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, base + bt * 1.5)
    o.connect(g); g.connect(dly); g.connect(reverb); g.connect(masterGain)
    o.start(base); o.stop(base + bt * 2)
  })

  // ---- 鼓组 (lo-fi swing) ----
  const noiseBuf = createNoiseBuffer(ctx, 0.2)
  for (let bar = 0; bar < totalBars; bar++) {
    const bs = t0 + bar * 4 * bt
    const swing = bar % 2 === 0 ? 0 : 0.08

    // Kick
    const kickPattern = bar % 4 < 3 ? [0, 2.5] : [0, 1.5, 2.5, 3.5]
    kickPattern.forEach(b => {
      const t = bs + b * bt + (b > 2 ? swing : 0)
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.setValueAtTime(90, t)
      o.frequency.exponentialRampToValueAtTime(28, t + 0.08)
      g.gain.setValueAtTime(0.28, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
      o.connect(g); g.connect(masterGain)
      o.start(t); o.stop(t + 0.15)
    })

    // Snare/Clap
    const snarePattern = [1, 3]
    snarePattern.forEach(b => {
      const t = bs + b * bt + swing
      const src = ctx.createBufferSource()
      src.buffer = noiseBuf
      const g = ctx.createGain()
      const flt = ctx.createBiquadFilter()
      flt.type = 'bandpass'; flt.frequency.value = 2800
      g.gain.setValueAtTime(0.14, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      src.connect(flt); flt.connect(g); g.connect(masterGain)
      src.start(t)
      // Clap layer
      if (bar % 2 === 0) {
        for (let c = 0; c < 2; c++) {
          const src2 = ctx.createBufferSource()
          src2.buffer = noiseBuf
          const g2 = ctx.createGain()
          const flt2 = ctx.createBiquadFilter()
          flt2.type = 'bandpass'; flt2.frequency.value = 2000
          g2.gain.setValueAtTime(0.06, t + c * 0.02)
          g2.gain.exponentialRampToValueAtTime(0.001, t + c * 0.02 + 0.05)
          src2.connect(flt2); flt2.connect(g2); g2.connect(reverb); g2.connect(masterGain)
          src2.start(t + c * 0.02)
        }
      }
    })

    // Hi-hat (swing)
    for (let b = 0; b < 8; b++) {
      const t = bs + b * bt * 0.5 + (b % 2 === 1 ? swing * 0.5 : 0)
      const src = ctx.createBufferSource()
      src.buffer = noiseBuf
      const g = ctx.createGain()
      const flt = ctx.createBiquadFilter()
      flt.type = 'highpass'; flt.frequency.value = 7500
      const vol = b % 4 === 0 ? 0.07 : b % 2 === 0 ? 0.04 : 0.025
      g.gain.setValueAtTime(vol, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
      src.connect(flt); flt.connect(g); g.connect(masterGain)
      src.start(t)
    }

    // Shaker (每2小节)
    if (bar % 2 === 0) {
      for (let b = 0; b < 8; b++) {
        const t = bs + b * bt * 0.5 + bt * 0.25
        const src = ctx.createBufferSource()
        src.buffer = createNoiseBuffer(ctx, 0.08)
        const g = ctx.createGain()
        const flt = ctx.createBiquadFilter()
        flt.type = 'bandpass'; flt.frequency.value = 5000; flt.Q.value = 2
        g.gain.setValueAtTime(0.03, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
        src.connect(flt); flt.connect(g); g.connect(masterGain)
        src.start(t)
      }
    }

    // Vinyl crackle (持续)
    if (bar === 0) {
      const crackleDur = loopDur
      const buf = ctx.createBuffer(1, ctx.sampleRate * crackleDur, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < data.length; i++) {
        // 低频底噪 + 随机噼啪声
        data[i] = (Math.random() * 2 - 1) * 0.3
        if (Math.random() < 0.001) data[i] += (Math.random() - 0.5) * 0.8
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const g = ctx.createGain()
      g.gain.value = 0.018
      const flt = ctx.createBiquadFilter()
      flt.type = 'bandpass'; flt.frequency.value = 800; flt.Q.value = 0.3
      src.connect(flt); flt.connect(g); g.connect(masterGain)
      src.start(t0)
    }

    // Rhodes pad (偶数小节)
    if (bar % 2 === 0) {
      const chord = progression[bar]
      const cs = t0 + bar * 4 * bt
      chord.forEach((n, ni) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'; o.frequency.value = freq(n) * 2
        g.gain.setValueAtTime(0, cs)
        g.gain.linearRampToValueAtTime(0.02, cs + bt * 0.5)
        g.gain.linearRampToValueAtTime(0.015, cs + bt * 3)
        g.gain.linearRampToValueAtTime(0, cs + bt * 4)
        o.connect(g); g.connect(reverb); g.connect(masterGain)
        o.start(cs); o.stop(cs + bt * 4 + 0.1)
      })
    }
  }

  return loopDur
}

// ==================== 公共接口 ====================
const engines = { SYNTHWAVE: playSynthwave, SHOEGAZE: playShoegaze, 'LO-FI': playLofi }

export async function startMusic(genreId) {
  const ctx = getContext()
  if (ctx.state === 'suspended') await ctx.resume()
  stopMusic()

  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.7
  masterGain.connect(ctx.destination)
  currentGain = masterGain
  isPlaying = true

  const engine = engines[genreId]
  if (!engine) return

  async function playLoop() {
    if (!isPlaying) return
    const duration = await engine(ctx, masterGain)
    loopTimer = setTimeout(playLoop, duration * 1000 - 200)
  }
  playLoop()
}

export function stopMusic() {
  isPlaying = false
  if (loopTimer) { clearTimeout(loopTimer); loopTimer = null }
  if (currentGain) {
    const ctx = getContext()
    currentGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    currentGain = null
  }
}

export function isAudioPlaying() { return isPlaying }

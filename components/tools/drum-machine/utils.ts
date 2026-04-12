export type Instrument = {
  name: string;
  freq: number;
  decay: number;
  type: OscillatorType;
};

function writeString(dv: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    dv.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function encodeWav(buffer: AudioBuffer): Blob {
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataSize = samples.length * 4; // float32 = 4 bytes each
  const buf = new ArrayBuffer(44 + dataSize);
  const dv = new DataView(buf);

  writeString(dv, 0, "RIFF");
  dv.setUint32(4, 36 + dataSize, true);
  writeString(dv, 8, "WAVE");
  writeString(dv, 12, "fmt ");
  dv.setUint32(16, 16, true);           // Subchunk1Size
  dv.setUint16(20, 3, true);            // AudioFormat = 3 (IEEE float)
  dv.setUint16(22, 1, true);            // NumChannels = 1
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * 4, true); // ByteRate
  dv.setUint16(32, 4, true);            // BlockAlign
  dv.setUint16(34, 32, true);           // BitsPerSample
  writeString(dv, 36, "data");
  dv.setUint32(40, dataSize, true);

  new Float32Array(buf, 44).set(samples);

  return new Blob([buf], { type: "audio/wav" });
}

function scheduleNote(
  ctx: OfflineAudioContext,
  instrument: Instrument,
  t: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = instrument.type;
  osc.frequency.value = instrument.freq;
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + instrument.decay);
  osc.start(t);
  osc.stop(t + instrument.decay + 0.05);
}

export async function renderOffline(
  grid: boolean[][],
  instruments: Instrument[],
  bpm: number,
  bars: number,
): Promise<AudioBuffer> {
  const STEPS = 16;
  const sampleRate = 44100;
  const stepDuration = 60 / bpm / 4;
  const barDuration = stepDuration * STEPS;
  const totalDuration = barDuration * bars;

  const ctx = new OfflineAudioContext(
    1,
    Math.ceil(totalDuration * sampleRate),
    sampleRate,
  );

  for (let bar = 0; bar < bars; bar++) {
    for (let step = 0; step < STEPS; step++) {
      const t = bar * barDuration + step * stepDuration;
      for (let row = 0; row < instruments.length; row++) {
        if (grid[row][step]) {
          scheduleNote(ctx, instruments[row], t);
        }
      }
    }
  }

  return ctx.startRendering();
}

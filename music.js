// Procedural battle music (no audio files). NRMusic.start(), .stop(), .setMode(1|2|3|'final'), .setVolume(0..1)
(function(){
  const N = n => 440*Math.pow(2,(n-69)/12);
  // A minor progression: Am F C G  (bass notes, chord tones)
  const PROG = [ {b:45, c:[57,60,64]}, {b:41, c:[53,57,60]}, {b:48, c:[55,60,64]}, {b:43, c:[55,59,62]} ];
  const MODES = { 1:{bpm:112, arp:true, hat:2, lead:false}, 2:{bpm:128, arp:true, hat:1, lead:false}, 3:{bpm:142, arp:true, hat:1, lead:true}, final:{bpm:160, arp:true, hat:1, lead:true} };
  let ac=null, master=null, timer=null, step=0, nextTime=0, mode=1, vol=0.5, running=false;
  function ctx(){ if(!ac){ ac = window.NR ? NR.ac() : new AudioContext(); master=ac.createGain(); master.gain.value=vol*0.35; const comp=ac.createDynamicsCompressor(); master.connect(comp); comp.connect(ac.destination);} return ac; }
  function osc(type, f, t, dur, v, dest){ const o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(dest||master); o.start(t); o.stop(t+dur+0.05); }
  function kick(t){ const o=ac.createOscillator(), g=ac.createGain(); o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(40,t+0.15); g.gain.setValueAtTime(0.9,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.2); o.connect(g); g.connect(master); o.start(t); o.stop(t+0.25); }
  let nbuf=null; function hat(t,v){ if(!nbuf){ nbuf=ac.createBuffer(1,ac.sampleRate*0.05,ac.sampleRate); const d=nbuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
    const s=ac.createBufferSource(); s.buffer=nbuf; const f=ac.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000; const g=ac.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.04); s.connect(f); f.connect(g); g.connect(master); s.start(t); }
  function schedule(){
    const m=MODES[mode]||MODES[1]; const s16 = 60/m.bpm/4;
    while(nextTime < ac.currentTime + 0.15){
      const bar = Math.floor(step/16)%4, st = step%16, ch = PROG[bar], t=nextTime;
      if(st%4===0) kick(t);
      if(mode==='final' && st%4===2) kick(t);
      if(st%(m.hat*2)===(m.hat===2?2:1)) hat(t, 0.12);
      if(st%2===0) osc('sawtooth', N(ch.b-12 + (st%8===6?12:0)), t, s16*1.8, 0.16);
      if(m.arp){ const n = ch.c[(st)%3] + (st%8>=4?12:0); osc('square', N(n), t, s16*0.9, 0.035); }
      if(m.lead && st%8===0){ const n = ch.c[(Math.floor(step/8))%3]+24; osc('triangle', N(n), t, s16*6, 0.05); }
      nextTime += s16; step++;
    }
  }
  window.NRMusic = {
    start(){ ctx(); if(running) return; running=true; nextTime=ac.currentTime+0.1; timer=setInterval(schedule, 40); },
    stop(){ running=false; clearInterval(timer); timer=null; },
    setMode(m){ mode=m; },
    setVolume(v){ vol=v; if(master) master.gain.value=v*0.35; },
    get running(){ return running; }
  };
})();

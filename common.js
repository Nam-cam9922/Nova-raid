// NOVA RAID — shared helpers (network + utils)
(function(){
  const BROKERS = [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://test.mosquitto.org:8081/mqtt'
  ];
  const TOPIC_ROOT = 'astroplanetia/novaraid/v1/';

  const TEAM_COLORS = ['#ff5d5d','#ffb648','#3ee6c8','#5aa9ff','#c37bff','#ff6fb5','#9be15d','#f2f2f2','#ffd84d','#5df0ff','#ff8a3d','#a88bff'];
  const TEAM_NAMES  = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ceres','Titan','Europa'];

  function qs(name){ return new URLSearchParams(location.search).get(name); }
  function store(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); }catch(e){ return null; } }
  function storeDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
  function rid(n){ const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; const r=crypto.getRandomValues(new Uint8Array(n)); for(const x of r) s+=a[x%a.length]; return s; }
  function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function brokerUrl(idx){
    const o = qs('broker'); if(o) return o;
    return BROKERS[idx|0] || BROKERS[0];
  }

  // Connect to one broker. Resolves {client, idx} or rejects after timeout.
  function connectOne(url, timeoutMs){
    return new Promise((resolve,reject)=>{
      let done=false;
      const client = mqtt.connect(url, { clientId:'nr_'+rid(10), keepalive:20, reconnectPeriod:2000, connectTimeout:timeoutMs||6000, clean:true });
      const t = setTimeout(()=>{ if(!done){ done=true; try{client.end(true);}catch(e){} reject(new Error('timeout')); } }, (timeoutMs||6000)+500);
      client.once('connect', ()=>{ if(done) return; done=true; clearTimeout(t); resolve(client); });
      client.once('error', (e)=>{ if(done) return; done=true; clearTimeout(t); try{client.end(true);}catch(_){} reject(e); });
    });
  }

  // Host: try brokers in order, return {client, idx}
  async function connectAny(preferIdx){
    if(qs('broker')){ return { client: await connectOne(qs('broker'), 6000), idx: 0 }; }
    const order = [];
    if(preferIdx!=null) order.push(preferIdx);
    BROKERS.forEach((_,i)=>{ if(!order.includes(i)) order.push(i); });
    let lastErr;
    for(const i of order){
      try{ const c = await connectOne(BROKERS[i], 6000); return {client:c, idx:i}; }catch(e){ lastErr=e; }
    }
    throw lastErr || new Error('no broker');
  }

  function topics(room){
    const base = TOPIC_ROOT + room + '/';
    return { up: base+'up', all: base+'all', team: (id)=>base+'team/'+id, info: base+'info' };
  }

  // ---------- tiny synth sound effects (no files needed) ----------
  let actx=null;
  function ac(){ if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(actx&&actx.state==='suspended') actx.resume(); return actx; }
  function tone(type, f1, f2, dur, vol, delay){
    const a=ac(); if(!a) return; const t=a.currentTime+(delay||0);
    const o=a.createOscillator(), g=a.createGain();
    o.type=type; o.frequency.setValueAtTime(f1,t); if(f2) o.frequency.exponentialRampToValueAtTime(Math.max(1,f2), t+dur);
    g.gain.setValueAtTime(vol||0.2,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+0.02);
  }
  function noise(dur, vol, delay){
    const a=ac(); if(!a) return; const t=a.currentTime+(delay||0);
    const b=a.createBuffer(1, a.sampleRate*dur, a.sampleRate); const d=b.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
    const s=a.createBufferSource(); s.buffer=b; const g=a.createGain(); g.gain.value=vol||0.3;
    const f=a.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  const SFX = {
    laser(){ tone('sawtooth', 1400, 180, 0.18, 0.08); },
    hit(){ noise(0.18, 0.25); tone('square', 120, 60, 0.15, 0.08); },
    block(){ tone('triangle', 900, 900, 0.08, 0.1); tone('triangle', 600, 600, 0.12, 0.08, 0.06); },
    wrong(){ tone('square', 220, 110, 0.25, 0.08); },
    correct(){ tone('sine', 660, 0, 0.1, 0.15); tone('sine', 990, 0, 0.16, 0.15, 0.08); },
    alarm(){ for(let i=0;i<4;i++){ tone('sawtooth', 440, 880, 0.3, 0.07, i*0.35); } },
    boom(){ noise(2.5, 0.6); tone('sine', 90, 30, 2.2, 0.35); },
    counter(){ tone('sawtooth', 300, 60, 0.5, 0.1); noise(0.4,0.2); },
    tick(){ tone('sine', 1200, 0, 0.04, 0.06); }
  };

  window.NR = { BROKERS, TEAM_COLORS, TEAM_NAMES, qs, store, storeDel, rid, shuffle, brokerUrl, connectOne, connectAny, topics, SFX, ac };
})();

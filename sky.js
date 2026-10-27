// animated starfield background
(function(){
  const c=document.getElementById('sky'); if(!c) return; const g=c.getContext('2d'); let W,H,stars=[];
  function init(){ W=c.width=innerWidth; H=c.height=innerHeight; const n=Math.round(W*H/5000);
    stars=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random(),t:Math.random()*6.28})); }
  addEventListener('resize',init); init();
  (function loop(){ g.clearRect(0,0,W,H);
    for(const s of stars){ s.t+=0.02+s.z*0.03; s.y+=0.05+s.z*0.25; if(s.y>H){s.y=0;s.x=Math.random()*W;}
      const a=0.35+0.65*Math.abs(Math.sin(s.t))*s.z; g.globalAlpha=a; g.fillStyle=s.z>.85?'#ffe6b0':'#cfd8ff'; const r=s.z*1.6+0.3; g.fillRect(s.x,s.y,r,r); }
    g.globalAlpha=1; requestAnimationFrame(loop); })();
})();

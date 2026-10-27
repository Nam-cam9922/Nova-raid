// NOVA RAID — default settings. Host can override on the laptop via ⚙ Cài đặt (code: namcam).
window.NR_DEFAULTS = {
  // ---- Stardust rewards ----
  top: [50, 30, 20],      // Top 1 / 2 / 3 by damage
  win: 20,                // every team, if the boss is defeated
  lastHit: 30,            // team that lands the final blow
  penalty: 10,            // Phase 3: per wrong / timed-out answer
  // ---- Battle ----
  timeLimit: 1200,        // seconds (20 min)
  killAt: 0.98,           // boss auto-balances to die at ~95% of the time limit (inside the final minute)
  p2At: 0.66,             // Phase 2 starts when boss HP <= 66%
  p3At: 0.33,             // Phase 3 starts when boss HP <= 33%
  shieldSec: 5,           // Phase 2: must answer within N seconds to pierce
  qLimit: [25, 15, 20],   // seconds per question in phase 1/2/3
  // ---- Question types ----
  types: { spell:true, fill:true, listen:true, meaning:true, odd:true },
  // ---- Drama features ----
  combo: true,  comboN: 3, comboMult: 2,      // OVERCHARGE: N correct in a row → x2
  crit: true,   critSec: 2.5, critMult: 1.5,  // CRITICAL: correct within N seconds
  skills: true, skillEvery: 150,              // boss skill roughly every N seconds
  meteorSec: 20,                              // METEOR SHOWER: all damage x2
  healSec: 20, healNeed: 10, healPct: 12,     // HEAL: class must land N hits in time, else boss heals %
  blackoutSec: 10,                            // BLACKOUT: answers blurred
  finalMinute: true, finalMult: 1.5,          // last 60s: damage x1.5, heartbeat, big countdown
  taunts: true,                               // boss trash-talks in English
  music: true, musicVol: 0.5
};

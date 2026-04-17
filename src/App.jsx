import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];
const TEAM_MEMBERS = ["Me", "VA", "Jake Holden", "Matt Reeves"];

const DAILY_QUOTES = [
  "A job written down is a job half done.",
  "Say it once. Done. Not forgotten.",
  "Busy hands need a clear head. Capture first, sort later.",
  "The van's packed. Is your head?",
  "You can't invoice a job you forgot to finish.",
  "Every great tradesman runs a tight list.",
  "Done beats perfect. Get it out of your head.",
  "No job too small to write down.",
  "Your future self will thank you for this note.",
  "The job that's not written is the one that gets missed.",
  "Good tradies don't forget. They write it down.",
  "One voice memo. One less thing spinning in your head.",
  "A clean list is as satisfying as a clean install.",
  "Capture it now. Deal with it later.",
  "The best tool is the one you actually use.",
  "On time, on budget, nothing missed.",
  "Write it. Do it. Tick it off.",
  "Your reputation is built job by job.",
  "The sites that run smooth are the ones run organised.",
  "Small details. Big difference.",
  "First fix, second fix, never forget the invoice.",
  "Don't let a follow-up fall through the cracks.",
  "A tradie's word is their brand. Keep it.",
  "Every task captured is money not left on the table.",
  "Quick capture today. Clean site tomorrow.",
  "The quote you don't send is the job you don't get.",
  "Sort your list. Clear your head. Back to work.",
  "Strong hands, stronger systems.",
  "The work's in the tools. The business is in the list.",
  "Don't just work in your business — work on it.",
];
const DAILY_QUOTE = DAILY_QUOTES[new Date(TODAY).getDate() % DAILY_QUOTES.length];

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_JOBS = [
  { id:"J001", ref:"J-001", name:"Webb Rewire", client:"Marcus Webb", address:"14 Birchwood Ave, Northside", phone:"07812 441 223", email:"m.webb@email.com", scope:"Full house rewire. Consumer unit upgrade to RCBO board. Loft circuit to be added.", notes:"", notesLog:[{id:"NL001",text:"Check loft access — may need scaffolding for upper circuits.",date:"2026-04-06",time:"08:30",via:"manual"}], status:"active", checkboxes:{booked:true,cert:false,invoice:false,completed:false}, certUploaded:false, invoiceUploaded:false, tasks:["T001","T002"], scopeItems:[{id:"SI001",text:"Strip existing wiring — ground floor",done:false},{id:"SI002",text:"Install new consumer unit",done:true},{id:"SI003",text:"First fix — ground floor circuits",done:true},{id:"SI004",text:"First fix — upper floor circuits",done:false},{id:"SI005",text:"Loft circuit installation",done:false}], unfinished:[{id:"UF001",text:"Confirm loft hatch dimensions before next visit",done:false}], memos:["M001"], photos:[], date:"2026-04-07", value:8500 },
  { id:"J002", ref:"J-002", name:"Hoult Fault Find", client:"Sandra Hoult", address:"7 Elmfield Close, Westgate", phone:"07911 002 334", email:"sandrah@email.co.uk", scope:"Intermittent trip on ring main. Investigate sockets upstairs.", notes:"Call ahead — she works from home.", notesLog:[], unfinished:[], memos:[], photos:[], date:"2026-04-09", value:650 },
  { id:"J003", ref:"J-003", name:"Hargreaves New Build", client:"Hargreaves Build Co.", address:"Plot 12, New Mill Rd, Bromley", phone:"07812 334 211", email:"dave@hargreaves.co.uk", scope:"First fix start. 4-bed new build. Full electrical installation.", notes:"Builder contact: Dave. Site opens 7:30am.", notesLog:[], unfinished:[], memos:[], photos:[], date:"2026-04-14", value:28000 },
  { id:"J004", ref:"J-004", name:"Malone Consumer Unit", client:"Terry Malone", address:"22 Station Rd, Lowmoor", phone:"07700 900 123", email:"terry.m@gmail.com", scope:"Replace old rewireable fuse board with modern RCBO consumer unit.", notes:"Completed. EIC issued.", notesLog:[], unfinished:[], memos:[], photos:[], date:"2026-03-28", value:2200 },
];

const SEED_TASKS = [
  { id:"T001", title:"Order cable for Webb rewire", jobId:"J001", priority:"P1", assignedTo:"Me", done:false, dueDate:"2026-04-06", notes:"2.5mm twin & earth x4 drums, 6mm for cooker" },
  { id:"T002", title:"Submit Part P notification — Webb", jobId:"J001", priority:"P1", assignedTo:"Me", done:false, dueDate:"2026-04-08", notes:"" },
  { id:"T003", title:"Call Sandra re: access time", jobId:"J002", priority:"P2", assignedTo:"Me", done:false, dueDate:"2026-04-07", notes:"" },
  { id:"T004", title:"Chase Hargreaves quote sign-off", jobId:"J003", priority:"P2", assignedTo:"VA", done:false, dueDate:"2026-04-10", notes:"" },
  { id:"T005", title:"Renew van insurance", jobId:null, priority:"P1", assignedTo:"Me", done:false, dueDate:"2026-04-15", notes:"Compare on Go Compare first" },
  { id:"T006", title:"File April receipts", jobId:null, priority:"P3", assignedTo:"VA", done:true, dueDate:"2026-04-04", notes:"" },
  { id:"T007", title:"Book inspection — Malone EICR", jobId:"J004", priority:"P2", assignedTo:"Me", done:true, dueDate:"2026-04-03", notes:"" },
  { id:"T008", title:"Clean van", jobId:null, priority:"P3", assignedTo:"Me", done:false, dueDate:"2026-04-11", notes:"" },
  { id:"T009", title:"Send invoice — Johnson", jobId:null, priority:"P1", assignedTo:"VA", done:false, dueDate:"2026-04-06", notes:"" },
];

// Reminders = time-based items, can exist without a job, optional date
const SEED_REMINDERS = [
  { id:"R001", title:"Ring Marcus re: loft socket — single or double?", text:"Ring Marcus about whether he wants the loft socket double or single — forgot to ask on site", notes:"", dueDate:"2026-04-07", dueTime:"09:00", linkedJobId:"J001", done:false, promoted:false },
  { id:"R002", title:"Follow up Sandra re: outdoor socket quote", text:"Sandra mentioned she might want an outdoor socket fitted at the same time — worth quoting", notes:"", dueDate:"2026-04-09", dueTime:"", linkedJobId:"J002", done:false, promoted:false },
  { id:"R003", title:"Check Fluke calibration cert before Hargreaves", text:"Need to check if calibration cert for Fluke is still valid before the Hargreaves EICR", notes:"", dueDate:"2026-04-13", dueTime:"", linkedJobId:"J003", done:false, promoted:false },
  { id:"R004", title:"Pick up 20mm conduit — before Thursday", text:"Pick up more 20mm conduit from the trade counter before Thursday", notes:"", dueDate:"2026-04-10", dueTime:"", linkedJobId:null, done:false, promoted:false },
];

const SEED_ASSETS = [
  { id:"AS001", name:"Transit Custom LWB", type:"van", rego:"EL22 XRT", notes:"Service due May 2026. MOT: Aug 2026.", serviceReminder:"May 2026" },
  { id:"AS002", name:"Fluke 1664FC MFT", type:"tool", rego:"", notes:"Calibration due June 2026. Serial: FL-9921-X.", serviceReminder:"June 2026" },
  { id:"AS003", name:"18V Makita Drill", type:"tool", rego:"", notes:"Spare battery ordered. Charger faulty — replace.", serviceReminder:"" },
  { id:"AS004", name:"6ft Ladder", type:"tool", rego:"", notes:"Annual inspection done March 2026.", serviceReminder:"March 2027" },
];

const SEED_WORKERS = [
  { id:"W001", name:"Jake Holden", role:"Lead Electrician", notes:"10yrs experience. Reliable.", hours:[{date:"2026-04-05",hrs:8,jobId:"J001"},{date:"2026-04-04",hrs:7,jobId:"J002"}] },
  { id:"W002", name:"Matt Reeves", role:"Apprentice", notes:"2nd year. Needs supervision on board work.", hours:[{date:"2026-04-05",hrs:8,jobId:"J001"}] },
  { id:"W003", name:"VA", role:"Virtual Assistant", notes:"Admin, invoicing, chasing quotes.", hours:[] },
];


const PENDING_INTAKE = [
  { id:"PI001", name:"Tamara Nguyen", address:"23 Mayfield St, Kogarah", phone:"+61 400 123 456", email:"tamara@example.com", scope:"Install new power points in living room, kitchen, and garage.", submitted:"2026-04-06" },
  { id:"PI002", name:"Damien Douglas", address:"8 Maple Ave, Westside", phone:"07923 441 002", email:"d.douglas@email.com", scope:"Kitchen light fitting replacement and outdoor socket install.", submitted:"2026-04-05" },
];

const ACCOUNT = { name:"Jason Miller", trade:"Electrician", company:"Miller Electrical Services", email:"jason@millerelectrical.co.uk", phone:"07711 234 567", regNo:"SELECT-2234", address:"Unit 4, Anvil Works, Northside", logoUrl:"" };

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#1B2B6B;--navy2:#2A3F8F;
  --blue:#1D6CE8;--blue2:#1558CC;--blue-l:#EBF2FF;
  --teal:#2BA890;--teal2:#1E8A75;--teal-l:#E8F7F4;
  --bg:#F0F2F8;--surface:#FFFFFF;--border:#E2E6EF;--border2:#CDD3E0;
  --text:#111827;--text2:#4B5563;--text3:#9CA3AF;
  --red:#EF4444;--red-bg:#FEF2F2;
  --amber:#F59E0B;--amber-bg:#FFFBEB;
  --green:#10B981;--green-bg:#ECFDF5;
  --orange:#F97316;--orange-bg:#FFF7ED;
  --r:10px;--r2:14px;
  --sh:0 1px 3px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.04);
  --sh2:0 6px 24px rgba(0,0,0,.10);
  --sidebar-w:210px;--top-h:56px;
}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
button,input,select,textarea{font-family:'Inter',sans-serif}
.app{display:flex;min-height:100vh}
.main{flex:1;margin-left:var(--sidebar-w);display:flex;flex-direction:column;min-height:100vh}
.page{padding:22px;max-width:1180px;width:100%}

/* ── SIDEBAR ── */
.sb{width:var(--sidebar-w);background:#fff;border-right:1px solid var(--border);position:fixed;top:0;left:0;bottom:0;z-index:200;display:flex;flex-direction:column;transition:transform .22s cubic-bezier(.4,0,.2,1)}
.sb-logo{padding:16px 14px 13px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none}
.logo-wm{display:flex;align-items:baseline;font-size:17px;font-weight:800;letter-spacing:-.3px;line-height:1}
.logo-sole{color:var(--navy)}.logo-tasker{color:var(--teal)}
.logo-wave{display:inline-flex;align-items:center;gap:1.5px;height:17px;margin:0 1px}
.logo-bar{width:2.5px;border-radius:2px;background:var(--blue)}
.sb-nav{flex:1;padding:10px;overflow-y:auto}
.nav-sec{font-size:10px;font-weight:600;color:var(--text3);letter-spacing:.9px;text-transform:uppercase;padding:14px 8px 5px}
.nav-it{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer;font-size:13.5px;font-weight:500;color:var(--text2);margin-bottom:1px;transition:all .14s;user-select:none}
.nav-it:hover{background:var(--bg);color:var(--text)}
.nav-it.on{background:var(--blue-l);color:var(--blue);font-weight:600}
.nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 5px}
.sb-user{padding:12px 12px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer}
.av{display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--teal));color:#fff;font-weight:700;flex-shrink:0;position:relative;font-size:13px}
.av-dot{position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:var(--green);border:2px solid #fff}

/* ── TOPBAR ── */
.topbar{height:var(--top-h);background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 22px;gap:14px;position:sticky;top:0;z-index:100}
.topbar-div{width:1px;height:22px;background:var(--border);flex-shrink:0}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 17px;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;border:none;transition:all .14s;white-space:nowrap;font-family:'Inter',sans-serif}
.btn-blue{background:var(--blue);color:#fff}.btn-blue:hover{background:var(--blue2)}
.btn-teal{background:var(--teal);color:#fff}.btn-teal:hover{background:var(--teal2)}
.btn-ghost{background:transparent;color:var(--text2);border:1.5px solid var(--border)}.btn-ghost:hover{background:var(--bg);color:var(--text)}
.btn-red{background:var(--red);color:#fff;border:none}.btn-red:hover{background:#DC2626}
.btn-green{background:var(--green);color:#fff}.btn-green:hover{background:var(--teal2)}
.btn-sm{padding:6px 13px;font-size:12.5px;border-radius:8px}
.btn-xs{padding:4px 10px;font-size:11.5px;border-radius:7px;font-weight:500}
.btn-ic{width:34px;height:34px;border-radius:8px;border:1.5px solid var(--border);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .14s;color:var(--text2)}.btn-ic:hover{background:var(--bg)}

/* ── CARD ── */
.card{background:#fff;border:1px solid var(--border);border-radius:var(--r2);box-shadow:var(--sh)}
.section-box{border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;background:#fff;box-shadow:var(--sh)}
.section-box-head{padding:12px 16px;background:#FAFBFF;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}

/* ── HOLD-TO-COMPLETE CHECKBOX ── */
.hcheck-wrap{position:relative;flex-shrink:0}
.hcheck{
  width:22px;height:22px;border-radius:50%;border:2px solid var(--border2);background:#fff;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:border-color .15s,background .15s;user-select:none;-webkit-user-select:none;
  touch-action:none;position:relative;overflow:hidden;
}
.hcheck:hover{border-color:var(--blue-m)}
.hcheck.filling{border-color:var(--blue)}
.hcheck-ring{
  position:absolute;inset:-2px;border-radius:50%;
  background:conic-gradient(var(--blue) 0%, transparent 0%);
  transition:none;
  opacity:0;
}
.hcheck.filling .hcheck-ring{opacity:1}
.hcheck.done{background:var(--green);border-color:var(--green)}
.hcheck.done .hcheck-ring{display:none}
.hcheck-tip{
  position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);
  background:var(--text);color:#fff;font-size:10px;font-weight:500;
  padding:3px 8px;border-radius:5px;white-space:nowrap;pointer-events:none;
  opacity:0;transition:opacity .15s;z-index:10;
}
.hcheck-wrap:hover .hcheck-tip{opacity:1}

/* ── TASK ROWS ── */
.task-row{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);transition:background .12s}
.task-row:last-child{border-bottom:none}
.task-row:hover{background:#FAFBFF}
.task-row.done-row{opacity:.45}
.t-body{flex:1;min-width:0}
.t-title{font-size:13.5px;color:var(--text);font-weight:400;line-height:1.4}
.t-title.dn{text-decoration:line-through;color:var(--text3)}
.t-meta{display:flex;align-items:center;gap:7px;margin-top:5px;flex-wrap:wrap}
.t-right{display:flex;align-items:center;gap:8px;flex-shrink:0;margin-top:1px}

/* ── REMINDER ROWS (different visual from tasks) ── */
.rem-row{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border);background:#fff;transition:background .12s}
.rem-row:last-child{border-bottom:none}
.rem-row:hover{background:var(--amber-bg)}
.rem-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px}
.rem-text{font-size:13.5px;color:var(--text);line-height:1.55;flex:1}
.rem-text.done{text-decoration:line-through;color:var(--text3)}
.rem-date{font-size:11.5px;color:var(--text3);margin-top:4px}

/* ── STATUS PILLS ── */
.pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600}
.pill-active{background:var(--blue-l);color:var(--blue)}
.pill-upcoming{background:var(--teal-l);color:var(--teal2)}
.pill-completed{background:var(--green-bg);color:#065F46}
.pill-draft{background:var(--amber-bg);color:#92400E}
.pill-paid{background:var(--green-bg);color:#065F46}
.pill-pending{background:var(--amber-bg);color:#92400E}
.pill-issued{background:var(--green-bg);color:#065F46}

/* ── JOB STATUS TAGS ── */
.jtag{display:inline-flex;align-items:center;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase}
.jtag-booked{background:#DBEAFE;color:#1D4ED8}
.jtag-cert{background:var(--green-bg);color:#065F46}
.jtag-inv{background:var(--green-bg);color:#065F46}
.jtag-done{background:#E5E7EB;color:#374151}
.jtag-missing{background:var(--red-bg);color:var(--red)}

/* ── PRIORITY BADGES ── */
.pbadge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700}
.p1{background:#FEE2E2;color:#B91C1C}
.p2{background:#FEF3C7;color:#92400E}
.p3{background:#E5E7EB;color:#4B5563}
.assign-chip{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;background:var(--bg);border:1px solid var(--border);color:var(--text2)}

/* ── WORKFLOW CHECKBOXES ── */
.wf-row{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid var(--border)}
.wf-row:last-child{border-bottom:none}
.wf-check{width:22px;height:22px;border-radius:6px;border:2px solid var(--border2);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s}
.wf-check.on{background:var(--blue);border-color:var(--blue)}
.wf-label{font-size:13.5px;font-weight:500;flex:1}
.wf-hint{font-size:11.5px;color:var(--text3);margin-top:2px}

/* ── SCOPE / UNFINISHED ── */
.scope-item{display:flex;align-items:flex-start;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border)}
.scope-item:last-child{border-bottom:none}
.scope-check{width:18px;height:18px;border-radius:4px;border:2px solid var(--border2);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s;margin-top:2px}
.scope-check.on{background:var(--teal);border-color:var(--teal)}

/* ── QUICK ACTION BUTTONS ── */
.qbtn{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;cursor:pointer;border:none;transition:all .14s;font-family:'Inter',sans-serif;text-align:left;width:100%}
.qbtn-blue{background:var(--blue);color:#fff}.qbtn-blue:hover{background:var(--blue2)}
.qbtn-teal{background:var(--teal);color:#fff}.qbtn-teal:hover{background:var(--teal2)}
.qbtn-navy{background:var(--navy);color:#fff}.qbtn-navy:hover{background:var(--navy2)}
.qbtn-white{background:#fff;color:var(--text);border:1.5px solid var(--border)}.qbtn-white:hover{background:var(--bg)}
/* HERO voice button — larger, prominent */
.qbtn-hero{padding:18px 20px;border-radius:14px;box-shadow:0 4px 16px rgba(29,108,232,.28)}
.qbtn-hero .qbtn-ic{width:46px;height:46px;border-radius:50%}
.qbtn-hero .qbtn-title{font-size:14px;letter-spacing:.3px}
.qbtn-hero .qbtn-sub{font-size:12px;opacity:.88;margin-top:3px}
.qbtn-ic{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.qbtn-white .qbtn-ic{background:var(--bg)}
.qbtn-title{font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
.qbtn-sub{font-size:11px;font-weight:400;opacity:.82;margin-top:1px}
/* Add Task choice buttons */
.choice-btn{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:12px;border:2px solid var(--border);background:#fff;cursor:pointer;width:100%;text-align:left;transition:all .15s;font-family:'Inter',sans-serif;margin-bottom:10px}
.choice-btn:hover{border-color:var(--blue);background:var(--blue-l)}
.choice-btn-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.choice-btn-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:2px}
.choice-btn-sub{font-size:12.5px;color:var(--text3)}

/* ── FORM ── */
.fg{margin-bottom:14px}
.fl{display:block;font-size:11px;font-weight:700;color:var(--text2);margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px}
.fi,.fs,.fta{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:9px;font-size:13.5px;background:#fff;color:var(--text);outline:none;transition:border-color .14s}
.fi:focus,.fs:focus,.fta:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-l)}
.fta{resize:vertical;min-height:78px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* ── MODAL ── */
.mo{position:fixed;inset:0;background:rgba(17,24,39,.46);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
.mw{background:#fff;border-radius:16px;width:100%;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,.16);animation:mIn .17s ease}
.mw-lg{max-width:680px}
@keyframes mIn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
.mh{padding:18px 20px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.mt2{font-size:15px;font-weight:700}
.mb2{padding:20px;max-height:75vh;overflow-y:auto}
.mf{padding:14px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px}
.xbtn{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text3)}.xbtn:hover{background:var(--bg)}

/* ── SEARCH ── */
.search-wrap{position:relative;flex:1;max-width:320px}
.search-wrap svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text3);pointer-events:none}
.search-input{width:100%;padding:8px 12px 8px 34px;border:1.5px solid var(--border);border-radius:9px;font-size:13.5px;background:#fff;outline:none;color:var(--text);transition:border-color .14s;font-family:'Inter',sans-serif}
.search-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-l)}

/* ── MISC ── */
.tabs{display:flex;gap:3px;background:#fff;border:1.5px solid var(--border);border-radius:10px;padding:3px;width:fit-content;margin-bottom:16px}
.tab{padding:6px 15px;border-radius:8px;border:none;font-size:13px;font-weight:500;cursor:pointer;transition:all .14s;color:var(--text2);background:transparent;font-family:'Inter',sans-serif}
.tab.on{background:var(--blue);color:#fff;font-weight:600}
.sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}
.st{font-size:13px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.4px}
.va{font-size:12.5px;font-weight:500;color:var(--blue);cursor:pointer;display:flex;align-items:center;gap:3px;background:none;border:none;font-family:'Inter',sans-serif}.va:hover{opacity:.75}
.dr{display:flex;padding:10px 0;border-bottom:1px solid var(--border);font-size:13.5px}
.dr:last-child{border-bottom:none}
.dl{width:130px;flex-shrink:0;color:var(--text3);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding-top:2px}
.dv{flex:1;color:var(--text);font-weight:500}
.hint{background:var(--blue-l);border-radius:10px;padding:11px 14px;display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--navy)}
.info-box{background:var(--bg);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--text2);line-height:1.65;border:1px solid var(--border)}
.em{text-align:center;padding:36px 20px;color:var(--text3)}
.li{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s}
.li:last-child{border-bottom:none}
.li:hover{background:#FAFBFF}
.li-main{flex:1;min-width:0}
.li-title{font-size:13.5px;font-weight:600;color:var(--text)}
.li-sub{font-size:12px;color:var(--text3);margin-top:2px}
.li-meta{display:flex;align-items:center;gap:8px;flex-shrink:0}
.tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:11px;color:var(--text2);font-weight:500}
.divider{height:1px;background:var(--border);margin:14px 0}
.pc-av{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--navy2),var(--teal));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:10.5px;font-weight:700;color:var(--text3);padding:9px 16px;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.6px}
td{padding:12px 16px;border-bottom:1px solid var(--border);font-size:13.5px}
tr:last-child td{border-bottom:none}
tr:hover td{background:#FAFBFF}
.scroll-x{overflow-x:auto}
.mds{background:#fff;border-radius:10px;padding:14px 16px;border:1px solid var(--border)}
.mds-label{font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:5px}
.mds-num{font-size:30px;font-weight:700;letter-spacing:-1px;line-height:1}
.parse-box{background:var(--teal-l);border:1.5px solid var(--teal);border-radius:10px;padding:14px 16px;margin-bottom:16px}
.wv{display:flex;align-items:center;gap:3px;height:36px;justify-content:center}
.wb{width:3px;background:var(--blue);border-radius:3px;animation:wa 1s ease-in-out infinite}
.wb:nth-child(2){animation-delay:.1s}.wb:nth-child(3){animation-delay:.2s}.wb:nth-child(4){animation-delay:.15s}.wb:nth-child(5){animation-delay:.05s}
@keyframes wa{0%,100%{height:6px}50%{height:26px}}
.rb{width:80px;height:80px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;margin:0 auto}
.rb-idle{background:var(--blue);color:#fff;box-shadow:0 4px 20px rgba(29,108,232,.4)}.rb-idle:hover{transform:scale(1.04)}
.rb-rec{background:var(--red);color:#fff;animation:rp 1.4s ease infinite}
@keyframes rp{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.3)}50%{box-shadow:0 0 0 14px rgba(239,68,68,0)}}
.photo-thumb{width:72px;height:60px;border-radius:8px;object-fit:cover;border:1px solid var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.photo-grid{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.w-full{width:100%}
.flex{display:flex}.ai-c{align-items:center}.jb{justify-content:space-between}
.gap-8{gap:8px}.gap-10{gap:10px}.gap-12{gap:12px}
.mb-8{margin-bottom:8px}.mb-12{margin-bottom:12px}.mb-16{margin-bottom:16px}.mb-20{margin-bottom:20px}
.mt-8{margin-top:8px}.mt-12{margin-top:12px}.mt-16{margin-top:16px}
.p-16{padding:16px}.p-20{padding:20px}

/* ── MOBILE ── */
.mob-top{display:none}.mob-bar{display:none}.sb-ov{display:none}
@media(max-width:768px){
  .sb{transform:translateX(-100%)}.sb.open{transform:translateX(0)}
  .sb-ov{display:block;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:199}
  .main{margin-left:0}.topbar{display:none}
  .mob-top{display:flex;align-items:center;gap:12px;padding:0 16px;height:54px;background:#fff;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
  .mob-top-title{font-size:15px;font-weight:700;flex:1}
  .page{padding:14px}
  .qgrid{grid-template-columns:1fr 1fr!important}
  .mdgrid{grid-template-columns:repeat(3,1fr)!important}
  .twocol{grid-template-columns:1fr!important}
  .fr{grid-template-columns:1fr!important}
  .mob-bar{display:flex;position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid var(--border);z-index:150;padding:6px 0 calc(6px + env(safe-area-inset-bottom,0px))}
  .mbi{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 4px;cursor:pointer}
  .mbi span{font-size:10px;font-weight:500;color:var(--text3)}
  .mbi.on span,.mbi.on svg{color:var(--blue)!important}
  .main{padding-bottom:72px}
}
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const P = {
  dashboard:"M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  jobs:"M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm0 0V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2",
  tasks:"M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  reminders:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  assets:"M4 6h16M4 10h16M4 14h16M4 18h16",
  workers:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  account:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  mic:"M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zm6 11a6 6 0 01-12 0M12 19v4m-4 0h8",
  plus:"M12 4v16m8-8H4",
  check:"M20 6L9 17l-5-5",
  chevR:"M9 18l6-6-6-6", chevL:"M15 18l-6-6 6-6",
  close:"M18 6L6 18M6 6l12 12",
  menu:"M4 6h16M4 12h16M4 18h16",
  search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  pin:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  link:"M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  upload:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  stop:"M21 3H3v18h18V3z",
  edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  clock:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  settings:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  alert:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  van:"M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  tool:"M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  copy:"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  mail:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  brain:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  note:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  image:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};
const Ic = ({n,s=18,col}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={col||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <path d={P[n]}/>
  </svg>
);

const Logo = () => (
  <div className="logo-wm">
    <span className="logo-sole">Sole</span>
    <span className="logo-wave">{[9,17,22,13,19,11].map((h,i)=><span key={i} className="logo-bar" style={{height:h}}/>)}</span>
    <span className="logo-tasker">Tasker</span>
  </div>
);

const ini = n => n?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";
const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

// ─── HOLD-TO-COMPLETE CHECKBOX ────────────────────────────────────────────────
// User must hold for 800ms to complete — prevents accidental taps
const HoldCheck = ({ done, onComplete, onUncomplete }) => {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdRef = useRef(null);
  const startRef = useRef(null);
  const HOLD_MS = 800;

  const startHold = (e) => {
    if (done) return;
    e.preventDefault();
    setHolding(true);
    startRef.current = Date.now();
    holdRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / HOLD_MS) * 100, 100);
      setProgress(pct);
      if (elapsed >= HOLD_MS) {
        clearInterval(holdRef.current);
        setHolding(false);
        setProgress(0);
        onComplete();
      }
    }, 16);
  };

  const cancelHold = () => {
    if (done) return;
    clearInterval(holdRef.current);
    setHolding(false);
    setProgress(0);
  };

  const progressBg = `conic-gradient(var(--blue) ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`;

  return (
    <div className="hcheck-wrap">
      <span className="hcheck-tip">{done ? "Click to reopen" : "Hold to complete"}</span>
      <div
        className={`hcheck${holding?" filling":""}${done?" done":""}`}
        onMouseDown={done ? onUncomplete : startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={done ? onUncomplete : startHold}
        onTouchEnd={cancelHold}
        onClick={done ? onUncomplete : undefined}
        style={{cursor: done ? "pointer" : "pointer"}}
      >
        {holding && (
          <div className="hcheck-ring" style={{background: progressBg}}/>
        )}
        {done && <Ic n="check" s={12} col="#fff"/>}
      </div>
    </div>
  );
};

// ─── SHARED MODAL ─────────────────────────────────────────────────────────────
const Mod = ({title, children, footer, onClose, lg}) => (
  <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className={`mw${lg?" mw-lg":""}`}>
      <div className="mh"><span className="mt2">{title}</span><button className="xbtn" onClick={onClose}><Ic n="close" s={14}/></button></div>
      <div className="mb2">{children}</div>
      {footer&&<div className="mf">{footer}</div>}
    </div>
  </div>
);

// Copy text to clipboard with a brief "Copied!" flash
const CopyBtn = ({text, style={}}) => {
  const [copied,setCopied]=useState(false);
  const copy=()=>{
    if(!text) return;
    navigator.clipboard?.writeText(text).catch(()=>{
      const ta=document.createElement("textarea"); ta.value=text;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    });
    setCopied(true); setTimeout(()=>setCopied(false),1800);
  };
  return (
    <button onClick={copy} title="Copy to clipboard" style={{
      display:"inline-flex",alignItems:"center",gap:4,padding:"4px 9px",
      borderRadius:7,border:"1.5px solid var(--border)",background:copied?"var(--teal-l)":"#fff",
      cursor:"pointer",fontSize:11.5,fontWeight:600,
      color:copied?"var(--teal2)":"var(--text3)",transition:"all .15s",fontFamily:"'Inter',sans-serif",
      ...style
    }}>
      <Ic n={copied?"check":"copy"} s={12} col={copied?"var(--teal)":"var(--text3)"}/>
      {copied?"Copied":"Copy"}
    </button>
  );
};

const Pill = ({s}) => {
  const m={active:"pill-active",upcoming:"pill-upcoming",completed:"pill-completed",draft:"pill-draft",paid:"pill-paid",pending:"pill-pending",issued:"pill-issued"};
  return <span className={`pill ${m[s]||"pill-active"}`}>{s}</span>;
};

const PBadge = ({p}) => {
  const l={P1:"URGENT",P2:"HIGH",P3:"LOW"};
  return <span className={`pbadge ${p?.toLowerCase()||"p2"}`}>{p} {l[p]}</span>;
};

const JobTags = ({job}) => {
  const done=job.status==="completed";
  const missing=done&&(!job.certUploaded||!job.invoiceUploaded);
  return (
    <div className="flex gap-8" style={{flexWrap:"wrap"}}>
      {job.checkboxes?.booked&&<span className="jtag jtag-booked">BOOKED</span>}
      {job.checkboxes?.cert&&<span className="jtag jtag-cert">CERT ✓</span>}
      {job.checkboxes?.invoice&&<span className="jtag jtag-inv">INV ✓</span>}
      {job.checkboxes?.completed&&<span className="jtag jtag-done">DONE</span>}
      {missing&&<span className="jtag jtag-missing">⚠ MISSING DOCS</span>}
    </div>
  );
};

// ─── AI FULL CAPTURE ANALYSIS ────────────────────────────────────────────────
// Analyses a full thought dump (voice or text) and extracts structured intent
const analyseCapture = async (text, jobs) => {
  const jobNames = jobs.map(j=>`"${j.name}" (id:${j.id})`).join(", ");
  const prompt = `You are an intelligent capture system for SoleTasker, a job management app for tradespeople.

Analyse this thought dump and extract ALL useful structured information.

Available jobs: ${jobNames || "none"}
Available team members: ${TEAM_MEMBERS.join(", ")}

Thought dump: "${text}"

Return ONLY valid JSON. No markdown, no explanation:
{
  "intent": "one of: job | task | reminder | note",
  "confidence": "high | medium | low",
  "job_name": "extracted job name or null",
  "job_id": "matching job id from available jobs or null",
  "client_name": "extracted client name or null",
  "address": "extracted address or null",
  "tasks": ["array of task strings extracted, empty array if none"],
  "reminder_text": "extracted reminder text or null",
  "reminder_date": "extracted date in YYYY-MM-DD format or null",
  "notes": "any remaining context as a clean note or null",
  "task_title": "if intent is task: concise task title or null",
  "priority": "P1 or P2 or P3",
  "assigned_to": "one of: ${TEAM_MEMBERS.join(", ")} or null",
  "smart_suggestions": ["array of smart suggestions like: invoice, certificate, follow-up — empty if none"]
}

Intent guide:
- job: contains client name, address, or job description
- task: action to be done (order, call, book, send, submit, fix)
- reminder: contains time intent ("remind me", "follow up", dates, "don't forget", "tomorrow", "next week")
- note: general info, no clear action or time intent

Priority: P1=urgent/today, P2=this week, P3=low/when possible`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:600, messages:[{role:"user",content:prompt}] })
    });
    const data = await res.json();
    const raw = data.content?.map(b=>b.text||"").join("")||"";
    return JSON.parse(raw.replace(/```json|```/g,"").trim());
  } catch(e) {
    return {intent:"note",confidence:"low",task_title:text.slice(0,80),priority:"P2",assigned_to:"Me",job_id:null,job_name:null,tasks:[],reminder_text:null,reminder_date:null,notes:text,smart_suggestions:[]};
  }
};



// ─── VOICE CAPTURE MODAL ──────────────────────────────────────────────────────
// Record → stop → transcript + 4 action buttons shown IMMEDIATELY
// AI parses in background ONLY after user picks an action, pre-fills confirm form
// Thought Dump is a first-class option — saves instantly as reminder, no form
const CaptureModal = ({
  mode, jobs, onClose,
  onSaveTask, onSaveReminder, onSaveNote, onCreateJob
}) => {
  const [step, setStep] = useState(mode==="voice" ? "idle" : "typing");
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [confirmType, setConfirmType] = useState(null);
  const [confirming, setConfirming] = useState(false); // AI running in background
  const [taskDraft, setTaskDraft] = useState({title:"",priority:"P2",assignedTo:"Me",jobId:"",dueDate:"",notes:""});
  const [jobDraft, setJobDraft] = useState({name:"",client:"",address:"",scope:"",notes:""});
  const [reminderDraft, setReminderDraft] = useState({title:"",notes:"",dueDate:"",dueTime:"",linkedJobId:""});
  const tRef = useRef(null);
  const srRef = useRef(null);
  const MAX = 120;

  const startRec = () => {
    setStep("recording"); setTimer(0); setText(""); setEditing(false);
    tRef.current = setInterval(()=>setTimer(t=>{if(t>=MAX-1){stopRec();return t+1;}return t+1;}),1000);
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(SR){
      const sr=new SR(); sr.continuous=true; sr.interimResults=true; sr.lang="en-GB";
      sr.onresult=e=>{setText(Array.from(e.results).map(r=>r[0].transcript).join(" "))};
      sr.start(); srRef.current=sr;
    }
  };
  const stopRec = () => {
    clearInterval(tRef.current); try{srRef.current?.stop();}catch(e){}
    setStep("choose");
  };

  // ── TRANSCRIPT FORMATTER ──────────────────────────────────────────────────
  // Converts spoken text into clean, usable formatted output
  const cleanTranscript = (raw) => {
    if(!raw) return "";
    const words = {
      zero:"0",one:"1",two:"2",three:"3",four:"4",five:"5",
      six:"6",seven:"7",eight:"8",nine:"9",ten:"10",
      eleven:"11",twelve:"12",fifteen:"15",twenty:"20",
      thirty:"30",forty:"40",fifty:"50",sixty:"60",
      seventy:"70",eighty:"80",ninety:"90",hundred:"100",
      thousand:"1000"
    };
    let t = raw.toLowerCase().trim();
    // Number words → digits
    Object.entries(words).forEach(([w,d])=>{
      t = t.replace(new RegExp(`\\b${w}\\b`,"g"), d);
    });
    // "times" / "multiply" / "by" → x
    t = t.replace(/\b(times|multiply|multiplied by|x)\b/g,"x");
    // Line break spoken words → actual newlines
    t = t.replace(/\b(new line|next line|line break|newline)\b/gi,"\n");
    // Capitalise known electrical/trade terms
    const caps = ["GPO","RCD","RCBO","MCB","DB","LED","IP65","IP44","TV","USB","HDMI","RJ45","CCTV","EV","SWA","PVC","CU","MEN","TPN","SPN","EICR","EIC"];
    caps.forEach(c=>{
      t = t.replace(new RegExp(`\\b${c.toLowerCase()}\\b`,"g"), c);
    });
    // Capitalise "Labour"
    t = t.replace(/\blabour\b/g,"Labour");
    // Clean up multiple spaces
    t = t.replace(/ {2,}/g," ").trim();
    // Capitalise first letter of each line
    t = t.split("\n").map(l=>l.trim()).map(l=>l.length>0?l[0].toUpperCase()+l.slice(1):l).join("\n");
    return t;
  };

  // THOUGHT DUMP — saves immediately using cleaned text
  const saveThoughtDump = () => {
    if(!text.trim()) return;
    const clean = cleanTranscript(text);
    onSaveReminder({
      id:`R${uid()}`, title:clean.slice(0,120), text:clean.slice(0,120),
      notes:"", dueDate:"", dueTime:"", linkedJobId:"", done:false, promoted:false
    });
    onClose();
  };

  const saveNote = () => { onSaveNote({id:`N${uid()}`,text:cleanTranscript(text),date:TODAY,source:mode}); onClose(); };

  // User picks Task/Job/Reminder → AI runs in background → confirm form appears
  const pickAction = async (type) => {
    const clean = cleanTranscript(text);
    setConfirmType(type);
    const fallback = clean;
    setTaskDraft({title:fallback, priority:"P2", assignedTo:"Me", jobId:"", dueDate:"", notes:""});
    setJobDraft({name:"", client:"", address:"", scope:clean, notes:""});
    setReminderDraft({title:fallback, notes:"", dueDate:"", dueTime:"", linkedJobId:""});
    setStep("confirm");
    setConfirming(true);
    try {
      const r = await analyseCapture(clean, jobs);
      if(r) {
        // Task: keep full transcript as title — AI only improves priority and job link
        setTaskDraft(p=>({...p, priority:r.priority||p.priority, assignedTo:r.assigned_to||p.assignedTo, jobId:r.job_id||p.jobId}));
        setJobDraft(p=>({...p, name:r.job_name||r.client_name||p.name, client:r.client_name||p.client, address:r.address||p.address, scope:r.notes||p.scope}));
        setReminderDraft(p=>({...p, title:r.reminder_text||p.title, notes:r.notes||p.notes, dueDate:r.reminder_date||p.dueDate, linkedJobId:r.job_id||p.linkedJobId}));
      }
    } catch(e){}
    setConfirming(false);
  };

  const doSave = () => {
    if(confirmType==="task")      onSaveTask({id:`T${uid()}`,done:false,...taskDraft});
    else if(confirmType==="job")  onCreateJob(jobDraft, text);
    else if(confirmType==="reminder") onSaveReminder({id:`R${uid()}`,done:false,promoted:false,text:reminderDraft.title,...reminderDraft});
    onClose();
  };

  // The 4 action buttons shown after recording
  const ActionBtn = ({label, sub, emoji, color, bg, onClick}) => (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:13,padding:"13px 15px",
      borderRadius:12,border:`1.5px solid ${color}40`,background:bg,
      cursor:"pointer",transition:"all .13s",fontFamily:"'Inter',sans-serif",
      width:"100%",textAlign:"left",marginBottom:7
    }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=color}
      onMouseLeave={e=>e.currentTarget.style.borderColor=color+"40"}
    >
      <span style={{fontSize:24,flexShrink:0,width:38,textAlign:"center"}}>{emoji}</span>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{label}</div>
        <div style={{fontSize:11.5,color:"var(--text3)",marginTop:1}}>{sub}</div>
      </div>
    </button>
  );

  const titleMap = {task:"Review Task",job:"Review Job"};

  return (
    <Mod title={step==="confirm"?(titleMap[confirmType]||"Review"):"Voice Capture"} onClose={onClose} lg
      footer={
        step==="idle"      ? <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        : step==="recording" ? <button className="btn btn-red w-full" onClick={stopRec}><Ic n="stop" s={15}/> Stop Recording</button>
        : step==="confirm"  ? <>
            <button className="btn btn-ghost" onClick={()=>{setStep("choose");setConfirmType(null);}}>← Back</button>
            <button className="btn btn-blue" onClick={doSave} disabled={confirming}>
              {confirming?"Filling fields…":"Save"}
            </button>
          </>
        : <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      }>

      {/* IDLE — tap mic */}
      {step==="idle"&&<div style={{textAlign:"center",padding:"20px 0 8px"}}>
        <button className="rb rb-idle" onClick={startRec}><Ic n="mic" s={32}/></button>
        <div style={{marginTop:16,fontSize:16,fontWeight:700,color:"var(--text)"}}>Tap to record</div>
        <div style={{marginTop:6,fontSize:13,color:"var(--text3)",lineHeight:1.6}}>
          Say anything — a job, a task, a reminder, a thought.<br/>
          <span style={{fontSize:12}}>Max 2 minutes. We'll sort the rest.</span>
        </div>
      </div>}

      {/* RECORDING — live transcript shows as you speak */}
      {step==="recording"&&<div style={{textAlign:"center",padding:"14px 0"}}>
        <div className="wv mb-12">{[12,20,28,18,24,14,22].map((h,i)=><div key={i} className="wb" style={{height:h,animationDelay:`${i*.08}s`}}/>)}</div>
        <div style={{fontSize:40,fontWeight:700,letterSpacing:-2,color:"var(--red)",marginBottom:4,fontFamily:"monospace"}}>{fmt(timer)}</div>
        <div style={{fontSize:13,color:"var(--text3)",marginBottom:16}}>Listening…</div>
        <button className="rb rb-rec" onClick={stopRec}><Ic n="stop" s={28}/></button>
        {/* LIVE TRANSCRIPT — this is the voice-to-text happening in real time */}
        {text
          ? <div style={{marginTop:16,background:"var(--bg)",borderRadius:9,padding:"12px 14px",textAlign:"left"}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--teal)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Live transcript</div>
              <div style={{fontSize:13.5,color:"var(--text)",lineHeight:1.65,fontStyle:"italic"}}>"{text}"</div>
            </div>
          : <div style={{marginTop:16,fontSize:12,color:"var(--text3)"}}>Start speaking — transcript appears here in real time</div>
        }
      </div>}

      {/* CHOOSE — transcript shown, then action buttons */}
      {step==="choose"&&<div>
        {/* Transcript box — displays cleaned text, editable, copyable */}
        <div style={{background:"var(--bg)",borderRadius:10,padding:"12px 14px",marginBottom:4,position:"relative"}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>Transcript {text?"":"— nothing captured"}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {text&&<CopyBtn text={cleanTranscript(text)}/>}
              <button onClick={()=>setEditing(e=>!e)} style={{fontSize:11.5,color:"var(--blue)",background:"none",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:500}}>
                {editing?"Done":"Edit"}
              </button>
            </div>
          </div>
          {editing
            ? <textarea className="fta w-full" style={{minHeight:80,fontSize:13,background:"#fff"}} value={text} onChange={e=>setText(e.target.value)} autoFocus/>
            : <p style={{fontSize:13.5,color:text?"var(--text)":"var(--text3)",lineHeight:1.75,whiteSpace:"pre-wrap",fontStyle:text?"normal":"italic"}}>
                {text?cleanTranscript(text):"Nothing recorded — tap Edit to type"}
              </p>
          }
          <div style={{fontSize:11,color:"var(--text3)",marginTop:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{color:"var(--text3)",fontStyle:"italic"}}>Copy text to paste anywhere.</span>
            <span>{fmt(timer)} recorded</span>
          </div>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.6,marginBottom:10,marginTop:14}}>What is this?</div>

        {/* REMINDER — saves instantly */}
        <button onClick={saveThoughtDump} style={{
          display:"flex",alignItems:"center",gap:14,padding:"18px 18px",
          borderRadius:14,border:"2px solid var(--amber)",background:"var(--amber-bg)",
          cursor:"pointer",transition:"all .13s",fontFamily:"'Inter',sans-serif",
          width:"100%",textAlign:"left",marginBottom:10,
          boxShadow:"0 2px 12px rgba(245,158,11,.15)"
        }}
          onMouseEnter={e=>e.currentTarget.style.background="#FEF3C7"}
          onMouseLeave={e=>e.currentTarget.style.background="var(--amber-bg)"}
        >
          <span style={{fontSize:28,flexShrink:0}}>🔔</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:15,color:"var(--text)"}}>Reminder</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Saves instantly — no typing needed. Use this while driving.</div>
          </div>
          <div style={{background:"var(--amber)",color:"#fff",borderRadius:8,padding:"5px 10px",fontSize:11.5,fontWeight:700,flexShrink:0}}>SAVE NOW</div>
        </button>

        <ActionBtn emoji="✅" label="Task" sub="Something to action — AI pre-fills title, priority, job link" color="var(--blue)" bg="var(--blue-l)" onClick={()=>pickAction("task")}/>
        <ActionBtn emoji="🏗️" label="New Job" sub="New job site — AI extracts client, address, scope" color="var(--teal)" bg="var(--teal-l)" onClick={()=>pickAction("job")}/>
      </div>}

      {/* CONFIRM — shows immediately, AI updates fields in background */}
      {step==="confirm"&&<div>
        <div style={{background:"var(--bg)",borderRadius:9,padding:"10px 13px",marginBottom:12,fontSize:12.5,color:"var(--text2)",fontStyle:"italic",lineHeight:1.5,borderLeft:"3px solid var(--blue)"}}>
          "{text.slice(0,160)}{text.length>160?"…":""}"
        </div>
        {confirming&&<div style={{fontSize:12,color:"var(--teal2)",marginBottom:10,display:"flex",alignItems:"center",gap:6,background:"var(--teal-l)",borderRadius:8,padding:"8px 12px"}}>
          <div className="wv" style={{display:"inline-flex",gap:2}}>{[6,9,12,9,6].map((h,i)=><div key={i} className="wb" style={{height:h,width:2,animationDelay:`${i*.1}s`}}/>)}</div>
          AI filling fields — you can edit now and it'll update as it finishes
        </div>}

        {confirmType==="task"&&<>
          <div className="fg"><label className="fl">Task (edit if needed)</label><textarea className="fta" style={{minHeight:80,fontSize:13}} value={taskDraft.title} onChange={e=>setTaskDraft(p=>({...p,title:e.target.value}))} autoFocus/></div>
          <div className="fr">
            <div className="fg"><label className="fl">Priority</label><select className="fs" value={taskDraft.priority} onChange={e=>setTaskDraft(p=>({...p,priority:e.target.value}))}><option value="P1">P1 — Urgent</option><option value="P2">P2 — High</option><option value="P3">P3 — Low</option></select></div>
            <div className="fg"><label className="fl">Assigned To</label><select className="fs" value={taskDraft.assignedTo} onChange={e=>setTaskDraft(p=>({...p,assignedTo:e.target.value}))}>{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select></div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Link to Job</label><select className="fs" value={taskDraft.jobId} onChange={e=>setTaskDraft(p=>({...p,jobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div>
            <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={taskDraft.dueDate} onChange={e=>setTaskDraft(p=>({...p,dueDate:e.target.value}))}/></div>
          </div>
          <div className="fg"><label className="fl">Notes</label><textarea className="fta" style={{minHeight:60}} value={taskDraft.notes} onChange={e=>setTaskDraft(p=>({...p,notes:e.target.value}))}/></div>
        </>}

        {confirmType==="job"&&<>
          <div className="fr">
            <div className="fg"><label className="fl">Job Name *</label><input className="fi" value={jobDraft.name} onChange={e=>setJobDraft(p=>({...p,name:e.target.value}))} autoFocus/></div>
            <div className="fg"><label className="fl">Client</label><input className="fi" value={jobDraft.client} onChange={e=>setJobDraft(p=>({...p,client:e.target.value}))}/></div>
          </div>
          <div className="fg"><label className="fl">Address</label><input className="fi" value={jobDraft.address} onChange={e=>setJobDraft(p=>({...p,address:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Scope of Works</label><textarea className="fta" style={{minHeight:80}} value={jobDraft.scope} onChange={e=>setJobDraft(p=>({...p,scope:e.target.value}))}/></div>
        </>}

        {confirmType==="reminder"&&<>
          <div className="fg"><label className="fl">Reminder *</label><input className="fi" value={reminderDraft.title} onChange={e=>setReminderDraft(p=>({...p,title:e.target.value}))} autoFocus/></div>
          <div className="fg"><label className="fl">Notes (optional)</label><textarea className="fta" style={{minHeight:60}} value={reminderDraft.notes} onChange={e=>setReminderDraft(p=>({...p,notes:e.target.value}))}/></div>
          <div className="fr">
            <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={reminderDraft.dueDate} onChange={e=>setReminderDraft(p=>({...p,dueDate:e.target.value}))}/></div>
            <div className="fg"><label className="fl">Time</label><input type="time" className="fi" value={reminderDraft.dueTime} onChange={e=>setReminderDraft(p=>({...p,dueTime:e.target.value}))}/></div>
          </div>
          <div className="fg"><label className="fl">Link to Job</label><select className="fs" value={reminderDraft.linkedJobId} onChange={e=>setReminderDraft(p=>({...p,linkedJobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div>
        </>}
      </div>}

      {/* TYPING mode — same choose flow after text entered */}
      {step==="typing"&&<div>
        <div className="fg">
          <label className="fl">Type anything — job, task, reminder, thought</label>
          <textarea className="fta w-full" style={{minHeight:100,fontSize:14}} placeholder='"Call Marcus about cable order, also remind me to chase the Hargreaves quote Friday"' value={text} onChange={e=>setText(e.target.value)} autoFocus/>
        </div>
        {text.trim()&&<>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.6,marginBottom:10}}>What is this?</div>
          <button onClick={saveThoughtDump} style={{
            display:"flex",alignItems:"center",gap:14,padding:"16px 18px",
            borderRadius:14,border:"2px solid var(--amber)",background:"var(--amber-bg)",
            cursor:"pointer",transition:"all .13s",fontFamily:"'Inter',sans-serif",
            width:"100%",textAlign:"left",marginBottom:10
          }}
            onMouseEnter={e=>e.currentTarget.style.background="#FEF3C7"}
            onMouseLeave={e=>e.currentTarget.style.background="var(--amber-bg)"}
          >
            <span style={{fontSize:26,flexShrink:0}}>🔔</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:"var(--text)"}}>Reminder</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Saves instantly — no extra steps</div>
            </div>
            <div style={{background:"var(--amber)",color:"#fff",borderRadius:8,padding:"5px 10px",fontSize:11.5,fontWeight:700,flexShrink:0}}>SAVE NOW</div>
          </button>
          <ActionBtn emoji="✅" label="Task" sub="Something to action" color="var(--blue)" bg="var(--blue-l)" onClick={()=>pickAction("task")}/>
          <ActionBtn emoji="🏗️" label="New Job" sub="Start a job" color="var(--teal)" bg="var(--teal-l)" onClick={()=>pickAction("job")}/>
        </>}
      </div>}
    </Mod>
  );
};


// ─── CAPTURE INBOX PAGE ───────────────────────────────────────────────────────
const InboxPage = ({inbox,setInbox,tasks,setTasks,reminders,setReminders,jobs,onNav}) => {
  const [promoteId,setPromoteId]=useState(null);
  const [pf,setPf]=useState({title:"",priority:"P2",assignedTo:"Me",jobId:"",dueDate:""});
  const item=inbox.find(n=>n.id===promoteId);

  const remove=id=>setInbox(p=>p.filter(n=>n.id!==id));
  const promoteTask=()=>{
    if(!pf.title.trim())return;
    setTasks(p=>[{...pf,id:`T${uid()}`,done:false,notes:"From capture inbox"},...p]);
    remove(promoteId); setPromoteId(null);
  };

  return (
    <div className="page">
      <div className="flex ai-c jb mb-20">
        <div><h1 style={{fontSize:20,fontWeight:700}}>Capture Inbox</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>{inbox.length} unsorted notes · convert when ready</p></div>
      </div>
      <div style={{background:"var(--orange-bg)",border:"1px solid #FED7AA",borderRadius:10,padding:"11px 14px",marginBottom:16,fontSize:13,color:"#7C2D12",display:"flex",gap:10}}>
        <span style={{fontSize:15}}>📥</span>
        <span><strong>Capture Inbox</strong> stores everything you captured but haven't sorted yet. Nothing gets lost. Convert each item to a task, reminder, or job when you're ready.</span>
      </div>
      {inbox.length===0
        ?<div className="card em"><Ic n="note" s={32} col="var(--text3)"/><p style={{marginTop:8,fontSize:13}}>Inbox is empty — great!</p></div>
        :<div className="card" style={{padding:0}}>
          {inbox.map(n=>(
            <div key={n.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 16px",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"var(--orange)",flexShrink:0,marginTop:6}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,color:"var(--text)",lineHeight:1.6}}>{n.text}</div>
                <div style={{fontSize:11.5,color:"var(--text3)",marginTop:4}}>{n.date} · via {n.source||"capture"}</div>
              </div>
              <div className="flex gap-8">
                <button className="btn btn-xs" style={{background:"var(--blue-l)",color:"var(--blue)",border:"none",fontWeight:600}} onClick={()=>{setPromoteId(n.id);setPf({title:n.text.slice(0,80),priority:"P2",assignedTo:"Me",jobId:"",dueDate:""})}}>
                  → Make Task
                </button>
                <button className="btn btn-xs btn-ghost" onClick={()=>remove(n.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      }
      {promoteId&&item&&<Mod title="Convert to Task" onClose={()=>setPromoteId(null)}
        footer={<><button className="btn btn-ghost" onClick={()=>setPromoteId(null)}>Cancel</button><button className="btn btn-blue" onClick={promoteTask}>Create Task</button></>}>
        <div style={{fontSize:13,color:"var(--text2)",fontStyle:"italic",background:"var(--bg)",borderRadius:9,padding:"10px 13px",marginBottom:14}}>"{item.text}"</div>
        <div className="fg"><label className="fl">Task Title *</label><input className="fi" value={pf.title} onChange={e=>setPf(p=>({...p,title:e.target.value}))}/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Priority</label><select className="fs" value={pf.priority} onChange={e=>setPf(p=>({...p,priority:e.target.value}))}><option value="P1">P1 — Urgent</option><option value="P2">P2 — High</option><option value="P3">P3 — Low</option></select></div>
          <div className="fg"><label className="fl">Assigned To</label><select className="fs" value={pf.assignedTo} onChange={e=>setPf(p=>({...p,assignedTo:e.target.value}))}>{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select></div>
        </div>
        <div className="fr">
          <div className="fg"><label className="fl">Link to Job</label><select className="fs" value={pf.jobId} onChange={e=>setPf(p=>({...p,jobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div>
          <div className="fg"><label className="fl">Due Date (optional)</label><input type="date" className="fi" value={pf.dueDate} onChange={e=>setPf(p=>({...p,dueDate:e.target.value}))}/></div>
        </div>
      </Mod>}
    </div>
  );
};

// ─── ADD TASK MODAL — structured creation: choose type first, then fill form ──
const AddTaskModal = ({onVoice, onCreateJob, onSaveTask, onSaveReminder, onNav, onClose}) => {
  const [step, setStep] = useState("choose"); // "choose" | "task" | "job" | "reminder"
  const [tf, setTf] = useState({title:"",priority:"P2",assignedTo:"Me",dueDate:"",jobId:"",notes:""});
  const [jf, setJf] = useState({name:"",client:"",address:"",scope:"",notes:""});
  const [rf, setRf] = useState({title:"",notes:"",dueDate:"",dueTime:"",linkedJobId:""});

  const saveTask = () => {
    if(!tf.title.trim()) return;
    if(onSaveTask) onSaveTask({...tf, id:`T${uid()}`, done:false});
    onClose();
  };
  const saveJob = () => {
    if(!jf.name.trim()&&!jf.client.trim()) return;
    onCreateJob(jf, "");
    onClose();
  };
  const saveReminder = () => {
    if(!rf.title.trim()) return;
    if(onSaveReminder) onSaveReminder({...rf, id:`R${uid()}`, text:rf.title, done:false, promoted:false});
    onClose();
  };

  if(step==="task") return (
    <Mod title="New Task" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={()=>setStep("choose")}>← Back</button><button className="btn btn-blue" onClick={saveTask}>Add Task</button></>}>
      <div className="fg"><label className="fl">What needs doing?</label><input className="fi" placeholder="e.g. Call Marcus re: cable order" value={tf.title} onChange={e=>setTf(p=>({...p,title:e.target.value}))} autoFocus/></div>
      <div className="fr">
        <div className="fg"><label className="fl">Priority</label><select className="fs" value={tf.priority} onChange={e=>setTf(p=>({...p,priority:e.target.value}))}><option value="P1">P1 — Urgent</option><option value="P2">P2 — High</option><option value="P3">P3 — Low</option></select></div>
        <div className="fg"><label className="fl">Assigned To</label><select className="fs" value={tf.assignedTo} onChange={e=>setTf(p=>({...p,assignedTo:e.target.value}))}>{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select></div>
      </div>
      <div className="fr">
        <div className="fg"><label className="fl">Due Date (optional)</label><input type="date" className="fi" value={tf.dueDate} onChange={e=>setTf(p=>({...p,dueDate:e.target.value}))}/></div>
        <div className="fg"><label className="fl">Notes (optional)</label><input className="fi" value={tf.notes} onChange={e=>setTf(p=>({...p,notes:e.target.value}))}/></div>
      </div>
    </Mod>
  );

  if(step==="job") return (
    <Mod title="New Job" onClose={onClose} lg
      footer={<><button className="btn btn-ghost" onClick={()=>setStep("choose")}>← Back</button><button className="btn btn-teal" onClick={saveJob}>Create Job</button></>}>
      <div className="fr">
        <div className="fg"><label className="fl">Job Name *</label><input className="fi" placeholder="e.g. Webb Rewire" value={jf.name} onChange={e=>setJf(p=>({...p,name:e.target.value}))} autoFocus/></div>
        <div className="fg"><label className="fl">Client</label><input className="fi" placeholder="e.g. Marcus Webb" value={jf.client} onChange={e=>setJf(p=>({...p,client:e.target.value}))}/></div>
      </div>
      <div className="fg"><label className="fl">Address</label><input className="fi" placeholder="Site address" value={jf.address} onChange={e=>setJf(p=>({...p,address:e.target.value}))}/></div>
      <div className="fg"><label className="fl">Scope of Works</label><textarea className="fta" style={{minHeight:80}} placeholder="What needs doing" value={jf.scope} onChange={e=>setJf(p=>({...p,scope:e.target.value}))}/></div>
    </Mod>
  );

  if(step==="reminder") return (
    <Mod title="New Reminder" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={()=>setStep("choose")}>← Back</button><button className="btn" style={{background:"var(--amber)",color:"#fff"}} onClick={saveReminder}>Save Reminder</button></>}>
      <div className="fg"><label className="fl">What do you need to remember?</label><input className="fi" placeholder='e.g. "Call Sandra back" or "Remind me Friday — submit Part P"' value={rf.title} onChange={e=>setRf(p=>({...p,title:e.target.value}))} autoFocus/></div>
      <div className="fg"><label className="fl">Notes (optional)</label><textarea className="fta" style={{minHeight:60}} placeholder="Any extra detail…" value={rf.notes} onChange={e=>setRf(p=>({...p,notes:e.target.value}))}/></div>
      <div className="fr">
        <div className="fg"><label className="fl">Due Date (optional)</label><input type="date" className="fi" value={rf.dueDate} onChange={e=>setRf(p=>({...p,dueDate:e.target.value}))}/></div>
        <div className="fg"><label className="fl">Time (optional)</label><input type="time" className="fi" value={rf.dueTime} onChange={e=>setRf(p=>({...p,dueTime:e.target.value}))}/></div>
      </div>
    </Mod>
  );

  // ── CHOOSE: Task / Job / Reminder — pick first, then fill details
  return (
    <Mod title="Add" onClose={onClose}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <button onClick={()=>setStep("task")}
          style={{padding:"18px 10px",borderRadius:12,border:"1.5px solid var(--border)",background:"#fff",cursor:"pointer",textAlign:"center",transition:"all .14s",fontFamily:"'Inter',sans-serif"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--blue)";e.currentTarget.style.background="var(--blue-l)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="#fff"}}>
          <div style={{width:40,height:40,borderRadius:10,background:"var(--blue-l)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><Ic n="tasks" s={20} col="var(--blue)"/></div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>Task</div>
        </button>
        <button onClick={()=>setStep("job")}
          style={{padding:"18px 10px",borderRadius:12,border:"1.5px solid var(--border)",background:"#fff",cursor:"pointer",textAlign:"center",transition:"all .14s",fontFamily:"'Inter',sans-serif"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--teal)";e.currentTarget.style.background="var(--teal-l)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="#fff"}}>
          <div style={{width:40,height:40,borderRadius:10,background:"var(--teal-l)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><Ic n="jobs" s={20} col="var(--teal)"/></div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>Job</div>
        </button>
        <button onClick={()=>setStep("reminder")}
          style={{padding:"18px 10px",borderRadius:12,border:"1.5px solid var(--border)",background:"#fff",cursor:"pointer",textAlign:"center",transition:"all .14s",fontFamily:"'Inter',sans-serif"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--amber)";e.currentTarget.style.background="var(--amber-bg)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="#fff"}}>
          <div style={{width:40,height:40,borderRadius:10,background:"var(--amber-bg)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}><Ic n="reminders" s={20} col="var(--amber)"/></div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>Reminder</div>
        </button>
      </div>
    </Mod>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({jobs,tasks,setTasks,reminders,setReminders,inbox,pendingIntake,setPendingIntake,onNav,onVoiceMemo,onAddTask}) => {
  const overdue=tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<TODAY).length
    + reminders.filter(r=>!r.done&&r.dueDate&&r.dueDate<TODAY).length;
  const dueToday=tasks.filter(t=>!t.done&&t.dueDate===TODAY).length
    + reminders.filter(r=>!r.done&&r.dueDate===TODAY).length;
  const upcoming=tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate>TODAY).length
    + reminders.filter(r=>!r.done&&r.dueDate&&r.dueDate>TODAY).length;
  const openTasks=tasks.filter(t=>!t.done).sort((a,b)=>{ if(!a.dueDate&&!b.dueDate)return 0; if(!a.dueDate)return 1; if(!b.dueDate)return -1; return a.dueDate<b.dueDate?-1:1; });
  const done12=tasks.filter(t=>t.done).length;
  const [selTask,setSelTask]=useState(null);
  const [reviewIntakeDash,setReviewIntakeDash]=useState(null);
  const [selReminder,setSelReminder]=useState(null);

  const complete=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:true}:t));
  const reopen=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:false}:t));
  const saveTask=f=>setTasks(p=>p.map(t=>t.id===f.id?{...t,...f}:t));
  const acceptIntake=intake=>{setPendingIntake(p=>p.filter(x=>x.id!==intake.id));onNav("jobs","intake",intake)};


  return (
    <div className="page">

      {/* ═══ 1. VOICE CAPTURE — full-width hero, compact, dominant ═══ */}
      <button onClick={onVoiceMemo} style={{
        display:"flex",alignItems:"center",gap:16,width:"100%",
        padding:"16px 20px",background:"var(--blue)",color:"#fff",
        borderRadius:14,border:"none",cursor:"pointer",marginBottom:10,
        transition:"background .14s",boxShadow:"0 4px 18px rgba(29,108,232,.28)",
        textAlign:"left",fontFamily:"'Inter',sans-serif"
      }}
        onMouseEnter={e=>e.currentTarget.style.background="var(--blue2)"}
        onMouseLeave={e=>e.currentTarget.style.background="var(--blue)"}
      >
        <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ic n="mic" s={28}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:2,letterSpacing:.1}}>Voice Capture</div>
          <div style={{fontSize:12.5,opacity:.85,fontWeight:400}}>Speak it and we create it.</div>
        </div>
        <div style={{fontSize:11,opacity:.6,fontStyle:"italic",textAlign:"right",lineHeight:1.5,flexShrink:0}}>task · job<br/>reminder</div>
      </button>

      {/* ═══ 2. ADD TASK/JOB + CLIENT LINK ═══ */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <button onClick={onAddTask} style={{
          flex:2,display:"flex",alignItems:"center",gap:12,
          padding:"12px 16px",background:"#D1FAE5",color:"#065F46",
          borderRadius:12,border:"1.5px solid #6EE7B7",cursor:"pointer",
          transition:"all .14s",fontFamily:"'Inter',sans-serif",textAlign:"left"
        }}
          onMouseEnter={e=>{e.currentTarget.style.background="#A7F3D0";e.currentTarget.style.borderColor="#34D399"}}
          onMouseLeave={e=>{e.currentTarget.style.background="#D1FAE5";e.currentTarget.style.borderColor="#6EE7B7"}}
        >
          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(16,185,129,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ic n="plus" s={17} col="#065F46"/>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700}}>Add Task / Job</div>
            <div style={{fontSize:11.5,opacity:.7,marginTop:1}}>Create a task or start a new job</div>
          </div>
        </button>
        <button onClick={()=>onNav("intake")} title="Copy Job Link"
          style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"12px 10px",background:"#fff",border:"1.5px solid var(--border)",borderRadius:12,cursor:"pointer",transition:"all .14s",fontFamily:"'Inter',sans-serif"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.background="var(--bg)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="#fff"}}
        >
          <Ic n="copy" s={16} col="var(--text3)"/>
          <span style={{fontSize:10.5,color:"var(--text3)",fontWeight:600,textAlign:"center",lineHeight:1.3}}>Copy Job<br/>Link</span>
        </button>
      </div>

      {/* ═══ 3. MY DAY + TASKS + REMINDERS ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:14}} className="twocol">

        {/* LEFT */}
        <div>
          <div className="card mb-14">
            <div style={{padding:"12px 14px 0"}}><div className="sh" style={{marginBottom:0}}><span className="st">My Day</span><span style={{fontSize:11.5,color:"var(--text3)",display:"flex",alignItems:"center",gap:4}}><Ic n="clock" s={12}/>{new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span></div></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"10px 14px 14px"}} className="mdgrid">
              <div className="mds" style={{borderLeft:"3px solid var(--red)"}}>
                <div className="mds-label" style={{color:"var(--red)"}}>⚠ Overdue</div>
                <div className="mds-num" style={{color:"var(--red)"}}>{overdue}</div>
              </div>
              <div className="mds" style={{borderLeft:"3px solid var(--amber)"}}>
                <div className="mds-label" style={{color:"var(--amber)"}}>⏰ Today</div>
                <div className="mds-num" style={{color:"var(--amber)"}}>{dueToday}</div>
              </div>
              <div className="mds" style={{borderLeft:"3px solid var(--teal)"}}>
                <div className="mds-label" style={{color:"var(--teal)"}}>📅 Upcoming</div>
                <div className="mds-num" style={{color:"var(--teal)"}}>{upcoming}</div>
              </div>
            </div>
            <div style={{padding:"0 14px 14px",borderTop:"1px solid var(--border)",paddingTop:10}}>
              <div className="hint"><span>💡</span><span style={{fontStyle:"italic"}}>{DAILY_QUOTE}</span></div>
            </div>
          </div>

          <div className="card" style={{padding:0}}>
            <div style={{padding:"12px 14px 0"}}>
              <div className="sh">
                <span className="st">Open Tasks</span>
                <button className="va" onClick={()=>onNav("tasks")}>All <Ic n="chevR" s={13}/></button>
              </div>
            </div>
            {openTasks.length===0
              ?<div className="em"><Ic n="check" s={26} col="var(--green)"/><p style={{marginTop:8,fontSize:13,color:"var(--green)"}}>Nothing due. You're on top of it.</p></div>
              :openTasks.slice(0,8).map(t=>{
                const job=jobs.find(j=>j.id===t.jobId);
                return (
                  <div key={t.id} className="task-row" style={{cursor:"pointer"}} onClick={()=>setSelTask(t)}>
                    <HoldCheck done={t.done} onComplete={()=>complete(t.id)} onUncomplete={()=>reopen(t.id)}/>
                    <div className="t-body">
                      <div className="t-title">{t.title}</div>
                      <div className="t-meta">
                        {job&&<span className="tag"><Ic n="link" s={10}/>{job.name}</span>}
                        <span className="assign-chip">👤 {t.assignedTo||"Me"}</span>
                        {t.dueDate&&<span style={{fontSize:11,color:t.dueDate<=TODAY?"var(--red)":"var(--text3)",display:"flex",alignItems:"center",gap:2}}><Ic n="clock" s={10}/>{t.dueDate===TODAY?"Today":t.dueDate<TODAY?"Overdue":t.dueDate}</span>}
                      </div>
                    </div>
                    <div className="t-right"><PBadge p={t.priority}/></div>
                  </div>
                );
              })
            }
            {done12>0&&<div style={{padding:"9px 14px",fontSize:12,color:"var(--text3)",display:"flex",alignItems:"center",gap:6,borderTop:"1px solid var(--border)"}}><Ic n="check" s={12} col="var(--green)"/>{done12} done</div>}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {pendingIntake.length>0&&<div className="card mb-12">
            <div style={{padding:"11px 13px 0"}}><div className="sh"><span className="st" style={{color:"var(--amber)"}}>⏳ Pending ({pendingIntake.length})</span><button className="va" onClick={()=>onNav("jobs")}>All <Ic n="chevR" s={12}/></button></div></div>
            <div style={{padding:"0 13px 10px"}}>{pendingIntake.map(p=>(
              <div key={p.id} onClick={()=>setReviewIntakeDash(p)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid var(--border)",cursor:"pointer"}}>
                <div className="pc-av" style={{width:32,height:32,fontSize:12,flexShrink:0}}>{ini(p.name)}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12.5}}>{p.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{p.address.split(",")[0]}</div></div>
                <span style={{fontSize:11,color:"var(--amber)",fontWeight:700,border:"1.5px solid var(--amber)",borderRadius:6,padding:"3px 7px",flexShrink:0}}>Review →</span>
              </div>
            ))}</div>
          </div>}

          {/* Inline review modal for pending intake from dashboard */}
          {reviewIntakeDash&&<Mod title="Client Request" onClose={()=>setReviewIntakeDash(null)} lg
            footer={<>
              <button className="btn btn-ghost" onClick={()=>setReviewIntakeDash(null)}>← Back</button>
              <button className="btn btn-ghost" style={{color:"var(--red)"}} onClick={()=>{setPendingIntake(p=>p.filter(x=>x.id!==reviewIntakeDash.id));setReviewIntakeDash(null);}}>Dismiss</button>
              <button className="btn btn-teal" onClick={()=>{acceptIntake(reviewIntakeDash);setReviewIntakeDash(null);}}>✓ Accept &amp; Create Job</button>
            </>}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{reviewIntakeDash.name}</div>
              <div style={{fontSize:13,color:"var(--text3)"}}>{reviewIntakeDash.address}</div>
            </div>
            {[["Phone",reviewIntakeDash.phone],["Email",reviewIntakeDash.email],["Submitted",reviewIntakeDash.submitted]].map(([l,v])=>v&&<div key={l} className="dr"><div className="dl">{l}</div><div className="dv">{v}</div></div>)}
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Scope / Notes</div>
              <div style={{fontSize:13.5,color:"var(--text)",lineHeight:1.7,background:"var(--bg)",borderRadius:9,padding:"12px 14px"}}>{reviewIntakeDash.scope}</div>
            </div>
          </Mod>}

          <div className="card mb-12" style={{padding:0}}>
            <div style={{padding:"11px 13px 0"}}><div className="sh"><span className="st">Reminders</span><button className="va" onClick={()=>onNav("reminders")}>All <Ic n="chevR" s={12}/></button></div></div>
            {reminders.filter(r=>!r.done).length===0
              ?<div style={{padding:"10px 13px 13px",fontSize:12.5,color:"var(--text3)"}}>No reminders</div>
              :reminders.filter(r=>!r.done).slice(0,4).map(r=>(
                <div key={r.id} className="rem-row" style={{padding:"9px 13px",cursor:"pointer"}} onClick={()=>setSelReminder({...r})}>
                  <div className="rem-dot" style={{background:r.dueDate&&r.dueDate<=TODAY?"var(--red)":"var(--amber)"}}/>
                  <div style={{flex:1}}>
                    <div className="rem-text" style={{fontSize:12.5}}>{(r.title||r.text).slice(0,65)}{(r.title||r.text).length>65?"…":""}</div>
                    {r.dueDate&&<div className="rem-date" style={{fontSize:11,marginTop:1,color:r.dueDate<TODAY?"var(--red)":r.dueDate===TODAY?"var(--amber)":"var(--text3)"}}>{r.dueDate===TODAY?"Today":r.dueDate<TODAY?"Overdue":r.dueDate}</div>}
                  </div>
                  <CopyBtn text={r.title||r.text} style={{flexShrink:0}}/>
                </div>
              ))
            }
          </div>

          {selReminder&&<Mod title="Reminder" onClose={()=>setSelReminder(null)}
            footer={<>
              <button className="btn btn-ghost" onClick={()=>setSelReminder(null)}>← Back</button>
              <button className="btn btn-ghost" onClick={()=>{setReminders(p=>p.map(r=>r.id===selReminder.id?{...r,done:true}:r));setSelReminder(null);}}>✓ Done</button>
              <button className="btn btn-blue" onClick={()=>{setReminders(p=>p.map(r=>r.id===selReminder.id?{...r,...selReminder,text:selReminder.title}:r));setSelReminder(null);}}>Save</button>
            </>}>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginBottom:14}}>
              <a href={`mailto:?subject=${encodeURIComponent(selReminder.title||selReminder.text||"")}&body=${encodeURIComponent([selReminder.title||selReminder.text,selReminder.notes].filter(Boolean).join("\n\n"))}`}
                style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,border:"1.5px solid var(--border)",background:"#fff",fontSize:12,fontWeight:600,color:"var(--text2)",textDecoration:"none",fontFamily:"'Inter',sans-serif"}}>
                <Ic n="mail" s={13} col="var(--blue)"/> Email
              </a>
              <CopyBtn text={[selReminder.title||selReminder.text,selReminder.notes].filter(Boolean).join("\n")}/>
            </div>
            <div className="fg"><label className="fl">Reminder</label><input className="fi" value={selReminder.title||selReminder.text||""} onChange={e=>setSelReminder(p=>({...p,title:e.target.value}))} autoFocus/></div>
            <div className="fg"><label className="fl">Notes</label><textarea className="fta" style={{minHeight:80}} value={selReminder.notes||""} onChange={e=>setSelReminder(p=>({...p,notes:e.target.value}))}/></div>
            <div className="fr">
              <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={selReminder.dueDate||""} onChange={e=>setSelReminder(p=>({...p,dueDate:e.target.value}))}/></div>
              <div className="fg"><label className="fl">Time</label><input type="time" className="fi" value={selReminder.dueTime||""} onChange={e=>setSelReminder(p=>({...p,dueTime:e.target.value}))}/></div>
            </div>
            <div className="fg"><label className="fl">Link to Job</label>
              <select className="fs" value={selReminder.linkedJobId||""} onChange={e=>setSelReminder(p=>({...p,linkedJobId:e.target.value}))}>
                <option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}
              </select>
            </div>
          </Mod>}

          {/* Capture inbox — shown only if items exist, quiet placement */}
          {inbox&&inbox.length>0&&<div className="card" style={{padding:0}}>
            <div style={{padding:"10px 13px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontWeight:600,fontSize:12,color:"var(--text2)"}}>📥 Unsorted notes ({inbox.length})</span>
              <button className="va" onClick={()=>onNav("inbox")} style={{fontSize:11.5}}>Sort <Ic n="chevR" s={12}/></button>
            </div>
            {inbox.slice(0,2).map(n=>(
              <div key={n.id} style={{padding:"9px 13px",borderBottom:"1px solid var(--border)",fontSize:12.5,color:"var(--text3)",lineHeight:1.5}}>
                {n.text.slice(0,68)}{n.text.length>68?"…":""}
              </div>
            ))}
          </div>}
        </div>
      </div>
      {selTask&&<TaskDetailModal task={selTask} jobs={jobs} onClose={()=>setSelTask(null)} onSave={saveTask} onComplete={complete} onReopen={reopen}
        onOpenJob={jobId=>{setSelTask(null);onNav("jobs",jobId);}}
      />}
    </div>
  );
};


// ─── TASK DETAIL MODAL ────────────────────────────────────────────────────────
// Clicking any task row opens this. Shows full task, job link, all fields, editable.
const TaskDetailModal = ({task, jobs, onClose, onSave, onComplete, onReopen, onOpenJob}) => {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({...task});
  const job = jobs.find(j=>j.id===f.jobId);

  const save = () => { onSave(f); setEditing(false); };
  const priorityLabel = {P1:"Urgent",P2:"High",P3:"Low"};
  const priorityColor = {P1:"var(--red)",P2:"var(--amber)",P3:"var(--teal)"};

  // Build copyable text block for invoices/certs
  const copyText = [
    f.title,
    job?`Job: ${job.name} — ${job.client} · ${job.address}`:"",
    f.dueDate?`Due: ${f.dueDate}`:"",
    f.notes||""
  ].filter(Boolean).join("\n");

  return (
    <Mod title="Task" onClose={onClose}
      footer={
        editing
          ? <><button className="btn btn-ghost" onClick={()=>{setF({...task});setEditing(false);}}>← Cancel</button><button className="btn btn-blue" onClick={save}>Save</button></>
          : <><button className="btn btn-ghost" onClick={()=>setEditing(true)}><Ic n="edit" s={13}/> Edit</button>
              {task.done
                ? <button className="btn btn-ghost" onClick={()=>{onReopen(task.id);onClose();}}>Reopen</button>
                : <button className="btn btn-green" onClick={()=>{onComplete(task.id);onClose();}}>✓ Complete</button>
              }
            </>
      }>
      {!editing&&<>
        {/* Title + copy */}
        <div style={{marginBottom:14,display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:task.done?"var(--text3)":"var(--text)",textDecoration:task.done?"line-through":"none",lineHeight:1.4}}>{f.title}</div>
            {task.done&&<div style={{fontSize:12,color:"var(--green)",marginTop:4,fontWeight:600}}>✓ Completed</div>}
          </div>
          <CopyBtn text={copyText}/>
        </div>
        {/* Meta pills */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <span style={{background:priorityColor[f.priority]+"18",color:priorityColor[f.priority],borderRadius:7,padding:"4px 10px",fontSize:12,fontWeight:700}}>{f.priority} — {priorityLabel[f.priority]}</span>
          <span style={{background:"var(--bg)",borderRadius:7,padding:"4px 10px",fontSize:12,color:"var(--text2)"}}>👤 {f.assignedTo||"Me"}</span>
          {f.dueDate&&<span style={{background:"var(--bg)",borderRadius:7,padding:"4px 10px",fontSize:12,color:!task.done&&f.dueDate<TODAY?"var(--red)":"var(--text2)",fontWeight:f.dueDate<=TODAY?600:400}}>
            <Ic n="clock" s={11}/> {f.dueDate===TODAY?"Due Today":f.dueDate<TODAY&&!task.done?"Overdue":f.dueDate}
          </span>}
        </div>
        {/* Job link — tappable to open job */}
        {job&&<div style={{background:"var(--blue-l)",borderRadius:9,padding:"11px 13px",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>Linked Job</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{job.name}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>{job.client} · {job.address}</div>
            </div>
            <button onClick={()=>{onClose();onOpenJob&&onOpenJob(job.id);}} style={{
              background:"var(--blue)",color:"#fff",border:"none",borderRadius:8,
              padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0,fontFamily:"'Inter',sans-serif"
            }}>Open Job →</button>
          </div>
          {job.email&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--blue-l)"}}>
            <a href={`mailto:${job.email}?subject=Re: ${encodeURIComponent(job.name)}&body=${encodeURIComponent(`Hi ${job.client},\n\nRe: ${job.name} — ${job.address}\n\n${f.title}\n\n`)}`}
              style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"var(--blue)",fontWeight:600,textDecoration:"none"}}>
              ✉ Email {job.client} →
            </a>
          </div>}
        </div>}
        {/* Notes + copy */}
        {f.notes&&<div style={{background:"var(--bg)",borderRadius:9,padding:"12px 13px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.4}}>Notes</div>
            <CopyBtn text={f.notes}/>
          </div>
          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{f.notes}</div>
        </div>}
        {!f.notes&&!job&&<div style={{fontSize:13,color:"var(--text3)"}}>No notes or job linked.</div>}
      </>}

      {editing&&<>
        <div className="fg"><label className="fl">Task Title *</label><input className="fi" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} autoFocus/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Priority</label><select className="fs" value={f.priority} onChange={e=>setF(p=>({...p,priority:e.target.value}))}><option value="P1">P1 — Urgent</option><option value="P2">P2 — High</option><option value="P3">P3 — Low</option></select></div>
          <div className="fg"><label className="fl">Assigned To</label><select className="fs" value={f.assignedTo} onChange={e=>setF(p=>({...p,assignedTo:e.target.value}))}>{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select></div>
        </div>
        <div className="fr">
          <div className="fg"><label className="fl">Link to Job</label><select className="fs" value={f.jobId||""} onChange={e=>setF(p=>({...p,jobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div>
          <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={f.dueDate||""} onChange={e=>setF(p=>({...p,dueDate:e.target.value}))}/></div>
        </div>
        <div className="fg"><label className="fl">Notes</label><textarea className="fta" style={{minHeight:80}} value={f.notes||""} onChange={e=>setF(p=>({...p,notes:e.target.value}))}/></div>
      </>}
    </Mod>
  );
};

// ─── TASKS PAGE ───────────────────────────────────────────────────────────────
const TasksPage = ({tasks,setTasks,jobs,onNav}) => {
  const [filter,setFilter]=useState("open");
  const [showNew,setShowNew]=useState(false);
  const [selTask,setSelTask]=useState(null);
  const [form,setForm]=useState({title:"",priority:"P2",assignedTo:"Me",dueDate:"",jobId:"",notes:""});

  const sorted=tasks.filter(t=>filter==="open"?!t.done:filter==="done"?t.done:true)
    .sort((a,b)=>{ if(a.done!==b.done) return a.done?1:-1; return a.dueDate<b.dueDate?-1:1; });

  const complete=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:true}:t));
  const reopen=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:false}:t));
  const saveTask=f=>setTasks(p=>p.map(t=>t.id===f.id?{...t,...f}:t));
  const add=()=>{if(!form.title.trim())return;setTasks(p=>[{...form,id:`T${uid()}`,done:false},...p]);setForm({title:"",priority:"P2",assignedTo:"Me",dueDate:"",jobId:"",notes:""});setShowNew(false)};

  return (
    <div className="page">
      <div className="flex ai-c jb mb-20">
        <div><h1 style={{fontSize:20,fontWeight:700}}>Tasks</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>{tasks.filter(t=>!t.done).length} open · {tasks.filter(t=>t.done).length} completed</p></div>
        <button className="btn btn-blue" onClick={()=>setShowNew(true)}><Ic n="plus" s={15}/> New Task</button>
      </div>

      <div className="tabs">
        {[["open","Open"],["done","Completed"],["all","All"]].map(([v,l])=><button key={v} className={`tab${filter===v?" on":""}`} onClick={()=>setFilter(v)}>{l}</button>)}
      </div>

      <div className="card" style={{padding:0}}>
        {sorted.length===0
          ?<div className="em"><Ic n="tasks" s={32} col="var(--text3)"/><p style={{marginTop:8}}>No tasks here</p></div>
          :sorted.map(t=>{
            const job=jobs.find(j=>j.id===t.jobId);
            return (
              <div key={t.id} className={`task-row${t.done?" done-row":""}`} style={{cursor:"pointer"}} onClick={()=>setSelTask(t)}>
                <HoldCheck done={t.done} onComplete={()=>complete(t.id)} onUncomplete={()=>reopen(t.id)}/>
                <div className="t-body">
                  <div className={`t-title${t.done?" dn":""}`}>{t.title}</div>
                  <div className="t-meta">
                    {job&&<span className="tag"><Ic n="link" s={10}/>{job.name}</span>}
                    <span className="assign-chip">👤 {t.assignedTo||"Me"}</span>
                    {t.dueDate&&<span style={{fontSize:11,color:!t.done&&t.dueDate<=TODAY?"var(--red)":"var(--text3)",display:"flex",alignItems:"center",gap:2}}><Ic n="clock" s={10}/>{t.dueDate===TODAY?"Today":t.dueDate<TODAY&&!t.done?"Overdue":t.dueDate}</span>}
                  </div>
                </div>
                <div className="t-right"><PBadge p={t.priority}/></div>
              </div>
            );
          })
        }
      </div>

      {selTask&&<TaskDetailModal task={selTask} jobs={jobs} onClose={()=>setSelTask(null)} onSave={saveTask} onComplete={complete} onReopen={reopen}
        onOpenJob={jobId=>{setSelTask(null);onNav&&onNav("jobs",jobId);}}
      />}

      {showNew&&<Mod title="New Task" onClose={()=>setShowNew(false)}
        footer={<><button className="btn btn-ghost" onClick={()=>setShowNew(false)}>← Cancel</button><button className="btn btn-blue" onClick={add}>Add Task</button></>}>
        <div className="fg"><label className="fl">Task Title *</label><input className="fi" placeholder="What needs doing?" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Priority</label><select className="fs" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}><option value="P1">P1 — Urgent</option><option value="P2">P2 — High</option><option value="P3">P3 — Low</option></select></div>
          <div className="fg"><label className="fl">Assigned To</label><select className="fs" value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}>{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select></div>
        </div>
        <div className="fr">
          <div className="fg"><label className="fl">Link to Job</label><select className="fs" value={form.jobId} onChange={e=>setForm(f=>({...f,jobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div>
          <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/></div>
        </div>
        <div className="fg"><label className="fl">Notes</label><textarea className="fta" style={{minHeight:60}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
      </Mod>}
    </div>
  );
};

// ─── REMINDERS PAGE (time-based, optional due date/time, optional job link) ──
const RemindersPage = ({reminders,setReminders,tasks,setTasks,jobs,onAddNote}) => {
  const [showNew,setShowNew]=useState(false);
  const [form,setForm]=useState({title:"",notes:"",dueDate:"",dueTime:"",linkedJobId:""});
  const [promoteId,setPromoteId]=useState(null);
  const [pf,setPf]=useState({title:"",priority:"P2",assignedTo:"Me",jobId:"",dueDate:""});

  const open=reminders.filter(r=>!r.done);
  const done=reminders.filter(r=>r.done);
  const overdue=open.filter(r=>r.dueDate&&r.dueDate<TODAY);
  const today=open.filter(r=>r.dueDate===TODAY);
  const upcoming=open.filter(r=>!r.dueDate||(r.dueDate>TODAY));

  const add=()=>{
    if(!form.title.trim())return;
    setReminders(p=>[{...form,id:`R${uid()}`,text:form.title,done:false,promoted:false},...p]);
    setForm({title:"",notes:"",dueDate:"",dueTime:"",linkedJobId:""});setShowNew(false);
  };
  const markDone=id=>setReminders(p=>p.map(r=>r.id===id?{...r,done:true}:r));
  const remove=id=>setReminders(p=>p.filter(r=>r.id!==id));
  const doPromote=()=>{
    if(!pf.title.trim())return;
    setTasks(p=>[{...pf,id:`T${uid()}`,done:false,notes:"Promoted from reminder"},...p]);
    setReminders(p=>p.filter(r=>r.id!==promoteId));
    setPromoteId(null);
  };

  const [editReminder,setEditReminder]=useState(null); // reminder being edited inline

  const ReminderRow=({r,urgency})=>{
    const job=jobs.find(j=>j.id===r.linkedJobId);
    const dotColor=urgency==="overdue"?"var(--red)":urgency==="today"?"var(--amber)":"var(--teal)";
    const copyText=[r.title||r.text,r.notes].filter(Boolean).join("\n");
    return (
      <div className="rem-row">
        <div className="rem-dot" style={{background:dotColor,marginTop:5}}/>
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>setEditReminder({...r})}>
          <div className="rem-text">{r.title||r.text}</div>
          {r.notes&&<div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{r.notes}</div>}
          <div className="rem-date flex gap-8" style={{marginTop:4}}>
            {r.dueDate&&<span style={{color:urgency==="overdue"?"var(--red)":urgency==="today"?"var(--amber)":"var(--text3)",display:"flex",alignItems:"center",gap:3}}><Ic n="clock" s={10}/>{urgency==="overdue"?"Overdue":urgency==="today"?"Today":r.dueDate}{r.dueTime?" at "+r.dueTime:""}</span>}
            {job&&<span className="tag"><Ic n="link" s={10}/>{job.name}</span>}
            {!r.dueDate&&<span style={{color:"var(--text3)"}}>No due date</span>}
          </div>
        </div>
        <div className="flex gap-8" style={{alignItems:"flex-start"}}>
          <CopyBtn text={copyText}/>
          <button className="btn btn-xs" style={{background:"var(--teal-l)",color:"var(--teal2)",border:"none",fontWeight:600}} onClick={()=>{setPromoteId(r.id);setPf({title:r.title||r.text||"",priority:"P2",assignedTo:"Me",jobId:r.linkedJobId||"",dueDate:r.dueDate||""})}}>
            → Task
          </button>
          <button className="btn btn-xs btn-ghost" onClick={()=>markDone(r.id)}>Done</button>
          <button className="btn-ic" style={{width:26,height:26}} onClick={()=>remove(r.id)}><Ic n="trash" s={12} col="var(--text3)"/></button>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="flex ai-c jb mb-16">
        <div><h1 style={{fontSize:20,fontWeight:700}}>Reminders</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>Time-based · {open.length} active · {done.length} done</p></div>
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-sm" onClick={onAddNote}><Ic n="mic" s={13}/> Quick Capture</button>
          <button className="btn btn-blue" onClick={()=>setShowNew(true)}><Ic n="plus" s={15}/> Add Reminder</button>
        </div>
      </div>

      <div style={{background:"var(--amber-bg)",border:"1px solid #FDE68A",borderRadius:10,padding:"11px 14px",marginBottom:16,fontSize:13,color:"#78350F",display:"flex",gap:10}}>
        <span style={{fontSize:15}}>🔔</span>
        <span><strong>Reminders</strong> are time-based nudges — work or personal. They can exist without a job, and can be promoted to a proper Task any time. Use <strong>Quick Capture</strong> to dump a thought without structure.</span>
      </div>

      {overdue.length>0&&<div className="card mb-16" style={{padding:0}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",background:"var(--red-bg)"}}><span style={{fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,color:"var(--red)"}}>⚠ Overdue ({overdue.length})</span></div>
        {overdue.map(r=><ReminderRow key={r.id} r={r} urgency="overdue"/>)}
      </div>}

      {today.length>0&&<div className="card mb-16" style={{padding:0}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",background:"var(--amber-bg)"}}><span style={{fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,color:"var(--amber)"}}>⏰ Today ({today.length})</span></div>
        {today.map(r=><ReminderRow key={r.id} r={r} urgency="today"/>)}
      </div>}

      <div className="card mb-16" style={{padding:0}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)"}}><span style={{fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,color:"var(--teal2)"}}>Upcoming &amp; Undated ({upcoming.length})</span></div>
        {upcoming.length===0?<div className="em" style={{padding:"20px"}}><p style={{fontSize:13,color:"var(--text3)"}}>No upcoming reminders</p></div>
        :upcoming.map(r=><ReminderRow key={r.id} r={r} urgency="upcoming"/>)}
      </div>

      {done.length>0&&<div className="card" style={{padding:0,opacity:.55}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)"}}><span style={{fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,color:"var(--text3)"}}>Done ({done.length})</span></div>
        {done.map(r=>(
          <div key={r.id} className="rem-row">
            <div className="rem-dot" style={{background:"var(--border)"}}/>
            <div style={{flex:1}}><div className="rem-text done">{r.title||r.text}</div>{r.promoted&&<div style={{fontSize:11,color:"var(--teal2)",marginTop:2}}>→ Promoted to task</div>}</div>
          </div>
        ))}
      </div>}

      {showNew&&<Mod title="New Reminder" onClose={()=>setShowNew(false)}
        footer={<><button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button><button className="btn btn-blue" onClick={add}>Add Reminder</button></>}>
        <div className="fg"><label className="fl">Reminder *</label><input className="fi" placeholder="What do you need to remember?" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} autoFocus/></div>
        <div className="fg"><label className="fl">Notes (optional)</label><textarea className="fta" style={{minHeight:60}} placeholder="Any extra detail…" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Due Date (optional)</label><input type="date" className="fi" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Time (optional)</label><input type="time" className="fi" value={form.dueTime} onChange={e=>setForm(p=>({...p,dueTime:e.target.value}))}/></div>
        </div>
        <div className="fg"><label className="fl">Link to Job (optional)</label><select className="fs" value={form.linkedJobId} onChange={e=>setForm(p=>({...p,linkedJobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div>
      </Mod>}

      {promoteId&&<Mod title="Move to Tasks" onClose={()=>setPromoteId(null)}
        footer={<><button className="btn btn-ghost" onClick={()=>setPromoteId(null)}>← Back</button><button className="btn btn-teal" onClick={doPromote}>✓ Create Task</button></>}>
        {/* Context note */}
        <div style={{background:"var(--teal-l)",borderRadius:9,padding:"10px 13px",marginBottom:14,fontSize:12.5,color:"var(--teal2)",lineHeight:1.5}}>
          This reminder will move to Tasks and be removed from Reminders.
          {pf.jobId&&<span> It will be linked to the job below.</span>}
        </div>
        <div className="fg"><label className="fl">Task Title *</label><input className="fi" value={pf.title} onChange={e=>setPf(p=>({...p,title:e.target.value}))} autoFocus/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Priority</label><select className="fs" value={pf.priority} onChange={e=>setPf(p=>({...p,priority:e.target.value}))}><option value="P1">P1 — Urgent</option><option value="P2">P2 — High</option><option value="P3">P3 — Low</option></select></div>
          <div className="fg"><label className="fl">Assigned To</label><select className="fs" value={pf.assignedTo} onChange={e=>setPf(p=>({...p,assignedTo:e.target.value}))}>{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select></div>
        </div>
        <div className="fr">
          <div className="fg"><label className="fl">Link to Job (optional)</label><select className="fs" value={pf.jobId} onChange={e=>setPf(p=>({...p,jobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div>
          <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={pf.dueDate} onChange={e=>setPf(p=>({...p,dueDate:e.target.value}))}/></div>
        </div>
      </Mod>}

      {editReminder&&<Mod title="Reminder" onClose={()=>setEditReminder(null)}
        footer={<>
          <button className="btn btn-ghost" onClick={()=>setEditReminder(null)}>← Back</button>
          <button className="btn btn-blue" onClick={()=>{setReminders(p=>p.map(r=>r.id===editReminder.id?{...r,...editReminder,text:editReminder.title}:r));setEditReminder(null);}}>Save</button>
        </>}>
        {/* Top-right icon row — email + copy */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginBottom:14}}>
          <a href={`mailto:?subject=${encodeURIComponent(editReminder.title||editReminder.text||"")}&body=${encodeURIComponent([editReminder.title||editReminder.text,editReminder.notes].filter(Boolean).join("\n\n"))}`}
            style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,border:"1.5px solid var(--border)",background:"#fff",fontSize:12,fontWeight:600,color:"var(--text2)",textDecoration:"none",fontFamily:"'Inter',sans-serif"}}
            title="Email this reminder">
            <Ic n="mail" s={13} col="var(--blue)"/> Email
          </a>
          <CopyBtn text={[editReminder.title||editReminder.text,editReminder.notes].filter(Boolean).join("\n")}/>
        </div>
        <div className="fg"><label className="fl">Reminder</label><input className="fi" value={editReminder.title||editReminder.text||""} onChange={e=>setEditReminder(p=>({...p,title:e.target.value}))} autoFocus/></div>
        <div className="fg"><label className="fl">Notes</label><textarea className="fta" style={{minHeight:70}} value={editReminder.notes||""} onChange={e=>setEditReminder(p=>({...p,notes:e.target.value}))}/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={editReminder.dueDate||""} onChange={e=>setEditReminder(p=>({...p,dueDate:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Time</label><input type="time" className="fi" value={editReminder.dueTime||""} onChange={e=>setEditReminder(p=>({...p,dueTime:e.target.value}))}/></div>
        </div>
      </Mod>}
    </div>
  );
};

// ─── JOBS LIST ────────────────────────────────────────────────────────────────
const JobsList = ({jobs,onSelect,onNew,pendingIntake,onAcceptIntake}) => {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [reviewIntake,setReviewIntake]=useState(null);
  const filtered=jobs.filter(j=>{
    const mf=filter==="all"||j.status===filter;
    const ms=!search||j.name.toLowerCase().includes(search.toLowerCase())||j.client.toLowerCase().includes(search.toLowerCase())||j.address.toLowerCase().includes(search.toLowerCase());
    return mf&&ms;
  });
  const statusColor={active:"var(--blue)",upcoming:"var(--teal)",completed:"var(--green)"};
  return (
    <div className="page">
      <div className="flex ai-c jb mb-20">
        <div><h1 style={{fontSize:20,fontWeight:700}}>Jobs</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>${jobs.reduce((s,j)=>s+(j.value||0),0).toLocaleString()} pipeline · {jobs.length} jobs</p></div>
        <button className="btn btn-teal" onClick={onNew}><Ic n="plus" s={15}/> Create Job</button>
      </div>

      {/* Pending intake jobs — shown at top when present */}
      {pendingIntake&&pendingIntake.length>0&&<div className="card mb-16" style={{padding:0}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",background:"var(--amber-bg)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,color:"#92400E"}}>⏳ Pending Client Requests ({pendingIntake.length})</span>
        </div>
        {pendingIntake.map(p=>(
          <div key={p.id} className="li" onClick={()=>setReviewIntake(p)} style={{cursor:"pointer"}}>
            <div className="pc-av" style={{width:40,height:40,fontSize:13}}>{ini(p.name)}</div>
            <div className="li-main">
              <div className="li-title">{p.name}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{p.address.split(",")[0]} · Submitted {p.submitted}</div>
              <div style={{fontSize:12,color:"var(--text2)",marginTop:4,lineHeight:1.4}}>{p.scope.slice(0,80)}{p.scope.length>80?"…":""}</div>
            </div>
            <div className="li-meta">
              <span style={{background:"var(--amber-bg)",color:"var(--amber)",border:"1.5px solid var(--amber)",borderRadius:7,padding:"4px 10px",fontSize:12,fontWeight:700}}>Review</span>
            </div>
          </div>
        ))}
      </div>}

      <div className="flex ai-c gap-12 mb-16" style={{flexWrap:"wrap"}}>
        <div className="search-wrap"><Ic n="search" s={15}/><input className="search-input" placeholder="Search by name, client, address…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <div className="tabs" style={{marginBottom:0}}>{["all","active","upcoming","completed"].map(f=><button key={f} className={`tab${filter===f?" on":""}`} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}</div>
      </div>
      <div className="card" style={{padding:0}}>
        {filtered.length===0?<div className="em"><Ic n="jobs" s={32} col="var(--text3)"/><p style={{marginTop:8}}>No jobs found</p></div>
        :filtered.map(j=>(
          <div key={j.id} className="li" onClick={()=>onSelect(j.id)}>
            <div style={{width:5,alignSelf:"stretch",borderRadius:"4px 0 0 4px",background:statusColor[j.status]||"var(--border)",flexShrink:0,margin:"-12px 0 -12px -16px"}}/>
            <div className="pc-av" style={{width:40,height:40,fontSize:13,marginLeft:4}}>{ini(j.client)}</div>
            <div className="li-main">
              <div className="li-title">{j.name}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{j.client} · {j.address.split(",")[0]}</div>
              <div style={{marginTop:6}}><JobTags job={j}/></div>
            </div>
            <div className="li-meta"><span style={{fontSize:13,fontWeight:600,color:"var(--text2)"}}>£{(j.value||0).toLocaleString()}</span><Ic n="chevR" s={15} col="var(--text3)"/></div>
          </div>
        ))}
      </div>

      {/* Review intake modal — full details, confirm or dismiss */}
      {reviewIntake&&<Mod title="Client Request" onClose={()=>setReviewIntake(null)} lg
        footer={<>
          <button className="btn btn-ghost" onClick={()=>setReviewIntake(null)}>← Back</button>
          <button className="btn btn-ghost" style={{color:"var(--red)"}} onClick={()=>{onAcceptIntake(reviewIntake,"dismiss");setReviewIntake(null);}}>Dismiss</button>
          <button className="btn btn-teal" onClick={()=>{onAcceptIntake(reviewIntake,"accept");setReviewIntake(null);}}>✓ Accept &amp; Create Job</button>
        </>}>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{reviewIntake.name}</div>
          <div style={{fontSize:13,color:"var(--text3)"}}>{reviewIntake.address}</div>
        </div>
        {[["Phone",reviewIntake.phone],["Email",reviewIntake.email],["Submitted",reviewIntake.submitted]].map(([l,v])=>v&&<div key={l} className="dr"><div className="dl">{l}</div><div className="dv">{v}</div></div>)}
        <div style={{marginTop:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.4,marginBottom:6}}>Scope / Notes</div>
          <div style={{fontSize:13.5,color:"var(--text)",lineHeight:1.7,background:"var(--bg)",borderRadius:9,padding:"12px 14px"}}>{reviewIntake.scope}</div>
        </div>
      </Mod>}
    </div>
  );
};

// ─── JOB DETAIL ───────────────────────────────────────────────────────────────
const JobDetail = ({job,jobs,tasks,setTasks,setJobs,onBack}) => {
  const [showAddTask,setShowAddTask]=useState(false);
  const [showNote,setShowNote]=useState(false);
  const [showUF,setShowUF]=useState(false);
  const [noteText,setNoteText]=useState("");
  const [ufText,setUfText]=useState("");
  const [tf,setTf]=useState({title:"",priority:"P2",assignedTo:"Me",dueDate:"",notes:""});
  const [editJob,setEditJob]=useState(false);
  const [jf,setJf]=useState({name:job.name,client:job.client,address:job.address,phone:job.phone,email:job.email,date:job.date,value:job.value||"",scope:job.scope});
  const fileRef=useRef(null);

  const upd=patch=>setJobs(p=>p.map(j=>j.id===job.id?{...j,...patch}:j));
  const saveJobEdit=()=>{upd({...jf,value:Number(jf.value)||0});setEditJob(false);};
  const toggleWF=key=>{
    if(key==="completed"&&!job.checkboxes.completed&&(!job.certUploaded||!job.invoiceUploaded)){
      alert("Please upload both the Certificate and Invoice before marking the job as Completed.");
      return;
    }
    upd({checkboxes:{...job.checkboxes,[key]:!job.checkboxes[key]}});
  };
  const toggleScope=sid=>upd({scopeItems:job.scopeItems.map(s=>s.id===sid?{...s,done:!s.done}:s)});
  const toggleUFItem=uid2=>upd({unfinished:job.unfinished.map(u=>u.id===uid2?{...u,done:!u.done}:u)});
  const completeTask=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:true}:t));
  const reopenTask=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:false}:t));

  const addTask=()=>{
    if(!tf.title.trim())return;
    const nt={...tf,id:`T${uid()}`,jobId:job.id,done:false};
    setTasks(p=>[nt,...p]);
    upd({tasks:[...job.tasks,nt.id]});
    setTf({title:"",priority:"P2",assignedTo:"Me",dueDate:"",notes:""}); setShowAddTask(false);
  };
  const addNote=(text,via="manual")=>{
    if(!text.trim())return;
    const now=new Date();
    const entry={id:`NL${uid()}`,text:text.trim(),date:now.toISOString().split("T")[0],time:now.toTimeString().slice(0,5),via};
    upd({notesLog:[...(job.notesLog||[]),entry]});
    setNoteText("");setShowNote(false);
  };
  const addUF=()=>{if(!ufText.trim())return;upd({unfinished:[...job.unfinished,{id:`UF${uid()}`,text:ufText,done:false}]});setUfText("");setShowUF(false)};

  // Voice note recording
  const [recNote,setRecNote]=useState(false);
  const [recText,setRecText]=useState("");
  const noteSrRef=useRef(null);
  const startVoiceNote=()=>{
    setRecNote(true);setRecText("");
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(SR){const sr=new SR();sr.continuous=true;sr.interimResults=true;sr.lang="en-GB";
      sr.onresult=e=>{setRecText(Array.from(e.results).map(r=>r[0].transcript).join(" "))};
      sr.start();noteSrRef.current=sr;}
  };
  const stopVoiceNote=()=>{
    try{noteSrRef.current?.stop();}catch(e){}
    setRecNote(false);
    if(recText.trim()) addNote(recText,"voice");
  };

  const handlePhoto=e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>upd({photos:[...(job.photos||[]),{id:`PH${uid()}`,name:file.name,src:ev.target.result,date:TODAY}]});
    reader.readAsDataURL(file);
  };

  const jobTasks=tasks.filter(t=>t.jobId===job.id);
  const openJobTasks=jobTasks.filter(t=>!t.done);
  const doneJobTasks=jobTasks.filter(t=>t.done);
  const scopeDone=job.scopeItems.filter(s=>s.done).length;
  const ufOpen=job.unfinished.filter(u=>!u.done).length;

  return (
    <div className="page">
      <div className="flex ai-c gap-12 mb-20">
        <button className="btn-ic" onClick={onBack}><Ic n="chevL" s={16}/></button>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{job.ref}</div>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:-.3}}>{job.name}</div>
          <div style={{fontSize:12.5,color:"var(--text2)",marginTop:2}}>{job.client} · {job.address}</div>
        </div>
        <div className="flex gap-8 ai-c">
          <JobTags job={job}/>
        </div>
      </div>

      {/* Missing docs warning */}
      {job.checkboxes.completed&&(!job.certUploaded||!job.invoiceUploaded)&&(
        <div style={{background:"var(--red-bg)",border:"1px solid #FECACA",borderRadius:10,padding:"11px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"center",fontSize:13,color:"var(--red)"}}>
          <Ic n="alert" s={16} col="var(--red)"/><strong>Missing:</strong>{!job.certUploaded?" Certificate not uploaded.":""}{!job.invoiceUploaded?" Invoice not uploaded.":""}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="twocol">
        {/* LEFT */}
        <div>
          {/* Job Info — editable */}
          <div className="section-box mb-16">
            <div className="section-box-head">
              <span className="st">Job Details</span>
              <div className="flex gap-8">
                {job.email&&<a href={`mailto:${job.email}?subject=Re: ${encodeURIComponent(job.name)}&body=${encodeURIComponent(`Hi ${job.client},\n\nRe: ${job.name}\n${job.address}\n\n`)}`}
                  style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,background:"var(--blue-l)",color:"var(--blue)",fontSize:12,fontWeight:700,textDecoration:"none",border:"1.5px solid var(--blue)30"}}>
                  ✉ Email
                </a>}
                <button className="btn btn-ghost btn-xs" onClick={()=>setEditJob(!editJob)}><Ic n="edit" s={12}/> {editJob?"Cancel":"Edit"}</button>
              </div>
            </div>
            {editJob
              ? <div style={{padding:"12px 16px"}}>
                  <div className="fr"><div className="fg"><label className="fl">Job Name</label><input className="fi" value={jf.name} onChange={e=>setJf(p=>({...p,name:e.target.value}))}/></div><div className="fg"><label className="fl">Client</label><input className="fi" value={jf.client} onChange={e=>setJf(p=>({...p,client:e.target.value}))}/></div></div>
                  <div className="fg"><label className="fl">Address</label><input className="fi" value={jf.address} onChange={e=>setJf(p=>({...p,address:e.target.value}))}/></div>
                  <div className="fr"><div className="fg"><label className="fl">Phone</label><input className="fi" value={jf.phone} onChange={e=>setJf(p=>({...p,phone:e.target.value}))}/></div><div className="fg"><label className="fl">Email</label><input className="fi" value={jf.email} onChange={e=>setJf(p=>({...p,email:e.target.value}))}/></div></div>
                  <div className="fr"><div className="fg"><label className="fl">Date</label><input type="date" className="fi" value={jf.date} onChange={e=>setJf(p=>({...p,date:e.target.value}))}/></div><div className="fg"><label className="fl">Value AUD (optional)</label><input className="fi" type="number" value={jf.value||""} onChange={e=>setJf(p=>({...p,value:e.target.value}))}/></div></div>
                  <div className="fg"><label className="fl">Scope</label><textarea className="fta" style={{minHeight:80}} value={jf.scope} onChange={e=>setJf(p=>({...p,scope:e.target.value}))}/></div>
                  <button className="btn btn-blue btn-sm w-full" onClick={saveJobEdit}>Save Changes</button>
                </div>
              : <div style={{padding:"4px 16px 12px"}}>
                  {[["Client",job.client],["Address",job.address],["Phone",job.phone?<a href={`tel:${job.phone}`} style={{color:"var(--blue)",textDecoration:"none"}}>{job.phone}</a>:null],["Email",job.email?<a href={`mailto:${job.email}?subject=Re: ${encodeURIComponent(job.name)}`} style={{color:"var(--blue)",textDecoration:"none"}}>✉ {job.email}</a>:null],["Date",job.date],job.value?["Value",`$${(job.value||0).toLocaleString()} AUD`]:null].filter(Boolean).map(([l,v])=>v&&<div key={l} className="dr"><div className="dl">{l}</div><div className="dv">{v}</div></div>)}
                </div>
            }
          </div>

          {/* Scope */}
          <div className="section-box mb-16">
            <div className="section-box-head">
              <span className="st">Scope of Works</span>
              <span style={{fontSize:11.5,color:"var(--text3)"}}>{scopeDone}/{job.scopeItems.length} done</span>
            </div>
            <div style={{padding:"12px 16px",fontSize:13,color:"var(--text2)",lineHeight:1.65,borderBottom:job.scopeItems.length?"1px solid var(--border)":"none"}}>{job.scope}</div>
            {job.scopeItems.map(si=>(
              <div key={si.id} className="scope-item">
                <div className={`scope-check${si.done?" on":""}`} onClick={()=>toggleScope(si.id)}>{si.done&&<Ic n="check" s={10} col="#fff"/>}</div>
                <div style={{fontSize:13.5,color:si.done?"var(--text3)":"var(--text)",textDecoration:si.done?"line-through":"none",flex:1}}>{si.text}</div>
              </div>
            ))}
          </div>

          {/* Notes Log & Photos */}
          <div className="section-box mb-16">
            <div className="section-box-head">
              <span className="st">Site Notes</span>
              <div className="flex gap-8">
                {recNote
                  ? <button className="btn btn-xs btn-red" onClick={stopVoiceNote}><Ic n="stop" s={11}/> Stop</button>
                  : <button className="btn btn-ghost btn-xs" onClick={startVoiceNote}><Ic n="mic" s={12}/> Voice</button>
                }
                <button className="btn btn-ghost btn-xs" onClick={()=>setShowNote(true)}><Ic n="plus" s={12}/> Note</button>
                <button className="btn btn-ghost btn-xs" onClick={()=>fileRef.current?.click()}><Ic n="image" s={12}/> Photo</button>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
              </div>
            </div>

            {/* Live voice recording indicator */}
            {recNote&&<div style={{padding:"10px 16px",background:"var(--red-bg)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
              <div className="wv" style={{display:"inline-flex",gap:2}}>{[5,8,11,8,5].map((h,i)=><div key={i} className="wb" style={{height:h,width:2,animationDelay:`${i*.1}s`}}/>)}</div>
              <span style={{fontSize:12,color:"var(--red)",flex:1}}>{recText||"Listening…"}</span>
            </div>}

            {/* Notes log — chronological, immutable entries */}
            <div style={{padding:"0 16px"}}>
              {(job.notesLog||[]).length===0&&!(job.photos?.length)&&
                <p style={{fontSize:13,color:"var(--text3)",padding:"14px 0"}}>No notes yet — tap Voice or + Note to add.</p>}
              {(job.notesLog||[]).map((n,i)=>(
                <div key={n.id} style={{borderBottom:"1px solid var(--border)",padding:"12px 0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.4}}>{n.date} · {n.time}</span>
                      {n.via==="voice"&&<span style={{fontSize:10,color:"var(--blue)",fontWeight:600,background:"var(--blue-l)",borderRadius:4,padding:"1px 5px"}}>🎙 voice</span>}
                    </div>
                    <CopyBtn text={n.text}/>
                  </div>
                  <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,margin:0}}>{n.text}</p>
                </div>
              ))}
              {job.photos?.length>0&&<div className="photo-grid" style={{paddingTop:12}}>
                {job.photos.map(ph=>(
                  <div key={ph.id} className="photo-thumb"><img src={ph.src} alt={ph.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                ))}
              </div>}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* Workflow */}
          <div className="section-box mb-16">
            <div className="section-box-head"><span className="st">Workflow Status</span></div>
            {[
              {key:"booked",label:"Booked",hint:"Job confirmed and ready to go"},
              {key:"cert",label:"Certificate",hint:"Upload document to mark done",upload:true},
              {key:"invoice",label:"Invoice",hint:"Upload document to mark done",upload:true},
              {key:"completed",label:"Job Complete",hint:"Requires cert + invoice uploaded first"},
            ].map(({key,label,hint,upload})=>(
              <div key={key} className="wf-row">
                <div className={`wf-check${job.checkboxes[key]?" on":""}`} onClick={()=>toggleWF(key)}>{job.checkboxes[key]&&<Ic n="check" s={12} col="#fff"/>}</div>
                <div style={{flex:1}}><div className="wf-label">{label}</div><div className="wf-hint">{hint}</div></div>
                {upload&&!job.checkboxes[key]&&<button className="btn btn-ghost btn-xs" onClick={()=>upd(key==="cert"?{certUploaded:true,checkboxes:{...job.checkboxes,cert:true}}:{invoiceUploaded:true,checkboxes:{...job.checkboxes,invoice:true}})}><Ic n="upload" s={12}/> Upload</button>}
                {upload&&job.checkboxes[key]&&<span style={{fontSize:11,color:"var(--green)",fontWeight:600}}>✓ Uploaded</span>}
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="section-box mb-16">
            <div className="section-box-head">
              <span className="st">Tasks <span style={{fontWeight:400,color:"var(--text3)",fontSize:12,marginLeft:4}}>{openJobTasks.length} open</span></span>
              <button className="btn btn-ghost btn-xs" onClick={()=>setShowAddTask(true)}><Ic n="plus" s={12}/> Add</button>
            </div>
            {openJobTasks.length===0&&doneJobTasks.length===0&&<div style={{padding:"14px 16px",fontSize:13,color:"var(--text3)"}}>No tasks yet</div>}
            {openJobTasks.map(t=>(
              <div key={t.id} className="task-row">
                <HoldCheck done={false} onComplete={()=>completeTask(t.id)} onUncomplete={()=>{}}/>
                <div className="t-body">
                  <div className="t-title">{t.title}</div>
                  <div className="t-meta"><span className="assign-chip">👤 {t.assignedTo||"Me"}</span><PBadge p={t.priority}/></div>
                </div>
              </div>
            ))}
            {doneJobTasks.length>0&&<>
              <div style={{padding:"7px 16px",fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.5,background:"#FAFBFF",borderTop:"1px solid var(--border)"}}>Completed</div>
              {doneJobTasks.map(t=>(
                <div key={t.id} className="task-row done-row">
                  <HoldCheck done={true} onComplete={()=>{}} onUncomplete={()=>reopenTask(t.id)}/>
                  <div className="t-body"><div className="t-title dn">{t.title}</div></div>
                </div>
              ))}
            </>}
          </div>

          {/* Unfinished Items */}
          <div className="section-box">
            <div className="section-box-head">
              <div><span className="st">Unfinished Items</span>{ufOpen>0&&<span style={{marginLeft:6,fontSize:11.5,color:"var(--amber)",fontWeight:600}}>⚠ {ufOpen} open</span>}</div>
              <button className="btn btn-ghost btn-xs" onClick={()=>setShowUF(true)}><Ic n="plus" s={12}/> Add</button>
            </div>
            {job.unfinished.length===0?<div style={{padding:"14px 16px",fontSize:13,color:"var(--text3)"}}>No loose ends — all clear.</div>
            :job.unfinished.map(u=>(
              <div key={u.id} className="scope-item">
                <div className={`scope-check${u.done?" on":""}`} onClick={()=>toggleUFItem(u.id)}>{u.done&&<Ic n="check" s={10} col="#fff"/>}</div>
                <div style={{fontSize:13.5,color:u.done?"var(--text3)":"var(--text)",textDecoration:u.done?"line-through":"none",flex:1}}>{u.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddTask&&<Mod title="Add Task" onClose={()=>setShowAddTask(false)}
        footer={<><button className="btn btn-ghost" onClick={()=>setShowAddTask(false)}>Cancel</button><button className="btn btn-blue" onClick={addTask}>Add Task</button></>}>
        <div className="fg"><label className="fl">Task Title *</label><input className="fi" value={tf.title} onChange={e=>setTf(f=>({...f,title:e.target.value}))} placeholder="What needs doing?"/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Priority</label><select className="fs" value={tf.priority} onChange={e=>setTf(f=>({...f,priority:e.target.value}))}><option value="P1">P1 — Urgent</option><option value="P2">P2 — High</option><option value="P3">P3 — Low</option></select></div>
          <div className="fg"><label className="fl">Assigned To</label><select className="fs" value={tf.assignedTo} onChange={e=>setTf(f=>({...f,assignedTo:e.target.value}))}>{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select></div>
        </div>
        <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={tf.dueDate} onChange={e=>setTf(f=>({...f,dueDate:e.target.value}))}/></div>
      </Mod>}
      {showNote&&<Mod title="Add Note" onClose={()=>setShowNote(false)} footer={<><button className="btn btn-ghost" onClick={()=>setShowNote(false)}>Cancel</button><button className="btn btn-blue" onClick={()=>addNote(noteText)}>Save</button></>}><textarea className="fta w-full" style={{minHeight:120}} placeholder="Add your note…" value={noteText} onChange={e=>setNoteText(e.target.value)} autoFocus/></Mod>}
      {showUF&&<Mod title="Add Unfinished Item" onClose={()=>setShowUF(false)} footer={<><button className="btn btn-ghost" onClick={()=>setShowUF(false)}>Cancel</button><button className="btn btn-blue" onClick={addUF}>Add</button></>}><input className="fi w-full" value={ufText} onChange={e=>setUfText(e.target.value)} placeholder="e.g. Return to fix socket in loft…" autoFocus/></Mod>}
    </div>
  );
};

// ─── CREATE JOB ───────────────────────────────────────────────────────────────
const CreateJob = ({jobs,onCreated,onCancel,prefill}) => {
  const [f,setF]=useState({name:prefill?.name||"",client:prefill?.name||"",address:prefill?.address||"",phone:prefill?.phone||"",email:prefill?.email||"",scope:prefill?.scope||"",notes:"",value:"",date:"",type:""});
  const sub=()=>{
    if(!f.name.trim()&&!f.client.trim())return;
    const ref=`J-${String(jobs.length+1).padStart(3,"0")}`;
    const name=f.name||`${f.client} Job`;
    const scopeItems=f.scope?f.scope.split(/[.!?]+/).filter(s=>s.trim().length>4).map((s,i)=>({id:`SI${uid()}_${i}`,text:s.trim(),done:false})):[];
    const nj={id:`J${uid()}`,ref,name,client:f.client,address:f.address,phone:f.phone,email:f.email,scope:f.scope,notes:f.notes,status:"upcoming",value:Number(f.value)||0,date:f.date,type:f.type||"Job",checkboxes:{booked:false,cert:false,invoice:false,completed:false},certUploaded:false,invoiceUploaded:false,tasks:[],scopeItems,unfinished:[],notesLog:[],memos:[],photos:[]};
    onCreated(nj);
  };
  return (
    <div className="page">
      <div className="flex ai-c gap-12 mb-20">
        <button className="btn-ic" onClick={onCancel}><Ic n="chevL" s={16}/></button>
        <div><h1 style={{fontSize:20,fontWeight:700}}>Create Job</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>All sections auto-created on save</p></div>
      </div>
      {prefill&&<div className="hint mb-16"><Ic n="alert" s={16}/><span>Pre-filled from client intake — review before saving.</span></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="twocol">
        <div className="card p-20">
          <div className="st mb-12">Client & Job Info</div>
          <div className="fg"><label className="fl">Job Name *</label><input className="fi" placeholder="e.g. Webb House Rewire" value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))}/></div>
          <div className="fr"><div className="fg"><label className="fl">Client Name</label><input className="fi" value={f.client} onChange={e=>setF(p=>({...p,client:e.target.value}))}/></div><div className="fg"><label className="fl">Job Type</label><input className="fi" placeholder="e.g. Rewire" value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))}/></div></div>
          <div className="fg"><label className="fl">Address</label><input className="fi" value={f.address} onChange={e=>setF(p=>({...p,address:e.target.value}))}/></div>
          <div className="fr"><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>setF(p=>({...p,phone:e.target.value}))}/></div><div className="fg"><label className="fl">Email</label><input className="fi" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))}/></div></div>
          <div className="fr"><div className="fg"><label className="fl">Date</label><input type="date" className="fi" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))}/></div><div className="fg"><label className="fl">Value AUD (optional)</label><input type="number" className="fi" placeholder="0" value={f.value} onChange={e=>setF(p=>({...p,value:e.target.value}))}/></div></div>
        </div>
        <div className="card p-20">
          <div className="st mb-12">Scope & Notes</div>
          <div className="fg"><label className="fl">Scope of Works</label><textarea className="fta" style={{minHeight:130}} placeholder="Describe the work. Each sentence becomes a scope checklist item." value={f.scope} onChange={e=>setF(p=>({...p,scope:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Notes</label><textarea className="fta" placeholder="Site access, contacts, other notes…" value={f.notes} onChange={e=>setF(p=>({...p,notes:e.target.value}))}/></div>
          <div style={{background:"var(--teal-l)",borderRadius:9,padding:"10px 13px",fontSize:12.5,color:"var(--teal2)"}}>Auto-created: Workflow checkboxes · Scope checklist · Tasks section · Notes · Unfinished Items</div>
        </div>
      </div>
      <div className="flex gap-12 mt-16"><button className="btn btn-ghost" onClick={onCancel}>Cancel</button><button className="btn btn-teal" onClick={sub}><Ic n="plus" s={15}/> Create Job</button></div>
    </div>
  );
};

// ─── INTAKE FORM (simulated public page) ─────────────────────────────────────
const IntakePage = ({onClose}) => {
  const [f,setF]=useState({name:"",address:"",phone:"",email:"",scope:""});
  const [sent,setSent]=useState(false);
  const link=`https://soletasker.app/intake/jason-miller`;
  return (
    <div className="page">
      <div className="flex ai-c gap-12 mb-20">
        <button className="btn-ic" onClick={onClose}><Ic n="chevL" s={16}/></button>
        <div><h1 style={{fontSize:20,fontWeight:700}}>Client Intake Form</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>Share this link with clients — they fill it in, you review it</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="twocol">
        <div>
          <div className="card p-20 mb-16">
            <div className="st mb-12">Your Shareable Link</div>
            <div style={{background:"var(--bg)",borderRadius:9,padding:"12px 14px",fontFamily:"monospace",fontSize:13,color:"var(--navy)",border:"1px solid var(--border)",marginBottom:12,wordBreak:"break-all"}}>{link}</div>
            <button className="btn btn-blue w-full" onClick={()=>navigator.clipboard?.writeText(link)}><Ic n="copy" s={14}/> Copy Link</button>
            <div style={{marginTop:14,fontSize:12.5,color:"var(--text3)",lineHeight:1.7}}>
              <strong style={{color:"var(--text)"}}>How it works:</strong><br/>
              1. Copy the link above and send it to your client by text, WhatsApp, or email.<br/>
              2. Client opens the link in their browser and fills in their details.<br/>
              3. You receive their submission in <strong>Pending Jobs</strong> on your Dashboard.<br/>
              4. Review, edit if needed, then tap Accept — it becomes a full job automatically.
            </div>
          </div>
          <div className="card p-20">
            <div className="st mb-12">Who creates this form?</div>
            <div className="info-box">
              <p style={{marginBottom:8}}>The form is <strong>built into SoleTasker</strong>. You don't need to create anything.</p>
              <p style={{marginBottom:8}}>Each tradie gets their own unique intake URL when they sign up. In V1 prototype the link above is simulated — in production it would be live at your own URL.</p>
              <p>The client sees a clean, mobile-friendly form with your company name. No SoleTasker branding visible to them.</p>
            </div>
          </div>
        </div>
        <div>
          <div className="card p-20">
            <div className="st mb-12">Preview — What Your Client Sees</div>
            <div style={{border:"1.5px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:"var(--navy)",padding:"16px 20px",color:"#fff"}}>
                <div style={{fontWeight:700,fontSize:15}}>Miller Electrical Services</div>
                <div style={{fontSize:12.5,opacity:.8,marginTop:2}}>Submit a job enquiry</div>
              </div>
              {!sent?<div style={{padding:"16px 16px 20px"}}>
                <div className="fg"><label className="fl">Your Name</label><input className="fi" value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))}/></div>
                <div className="fg"><label className="fl">Address</label><input className="fi" value={f.address} onChange={e=>setF(p=>({...p,address:e.target.value}))}/></div>
                <div className="fr"><div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e=>setF(p=>({...p,phone:e.target.value}))}/></div><div className="fg"><label className="fl">Email</label><input className="fi" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))}/></div></div>
                <div className="fg"><label className="fl">What do you need done?</label><textarea className="fta" style={{minHeight:90}} placeholder="Describe the work…" value={f.scope} onChange={e=>setF(p=>({...p,scope:e.target.value}))}/></div>
                <button className="btn btn-teal w-full" onClick={()=>setSent(true)}>Submit Enquiry</button>
              </div>:<div style={{padding:"32px 20px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:10}}>✅</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Submitted!</div>
                <div style={{fontSize:13,color:"var(--text2)"}}>Jason will be in touch shortly.</div>
                <button className="btn btn-ghost btn-sm mt-12" onClick={()=>setSent(false)}>Reset Preview</button>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ASSETS ───────────────────────────────────────────────────────────────────
const AssetsPage = ({assets,setAssets}) => {
  const [showNew,setShowNew]=useState(false);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({name:"",type:"van",rego:"",notes:"",serviceReminder:""});
  const editAsset=assets.find(a=>a.id===editId);

  const save=()=>{
    if(!form.name.trim())return;
    if(editId){setAssets(p=>p.map(a=>a.id===editId?{...a,...form}:a));setEditId(null);}
    else{setAssets(p=>[{...form,id:`AS${uid()}`},...p]);setShowNew(false);}
    setForm({name:"",type:"van",rego:"",notes:"",serviceReminder:""});
  };
  const del=id=>setAssets(p=>p.filter(a=>a.id!==id));
  const openEdit=a=>{setForm({name:a.name,type:a.type,rego:a.rego||"",notes:a.notes||"",serviceReminder:a.serviceReminder||""});setEditId(a.id)};

  const vans=assets.filter(a=>a.type==="van");
  const tools=assets.filter(a=>a.type==="tool");
  const AssetRow=({a})=>(
    <div className="li" style={{alignItems:"flex-start"}}>
      <div style={{width:40,height:40,borderRadius:10,background:a.type==="van"?"var(--blue-l)":"var(--teal-l)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
        <Ic n={a.type==="van"?"van":"tool"} s={18} col={a.type==="van"?"var(--blue)":"var(--teal)"}/>
      </div>
      <div className="li-main">
        <div className="li-title">{a.name}</div>
        {a.rego&&<div style={{fontSize:11.5,color:"var(--text3)",fontFamily:"monospace",marginTop:1}}>{a.rego}</div>}
        {a.notes&&<div style={{fontSize:12.5,color:"var(--text2)",marginTop:4,lineHeight:1.5}}>{a.notes}</div>}
        {a.serviceReminder&&<div style={{marginTop:5,fontSize:12,color:"var(--amber)",display:"flex",alignItems:"center",gap:4}}><Ic n="clock" s={12} col="var(--amber)"/>Due: {a.serviceReminder}</div>}
      </div>
      <div className="flex gap-8">
        <button className="btn-ic" onClick={()=>openEdit(a)}><Ic n="edit" s={14}/></button>
        <button className="btn-ic" onClick={()=>del(a.id)}><Ic n="trash" s={14} col="var(--red)"/></button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="flex ai-c jb mb-20">
        <div><h1 style={{fontSize:20,fontWeight:700}}>Assets</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>Vans, tools &amp; equipment</p></div>
        <button className="btn btn-teal" onClick={()=>{setForm({name:"",type:"van",rego:"",notes:"",serviceReminder:""});setShowNew(true)}}><Ic n="plus" s={15}/> Add Asset</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="twocol">
        <div><div className="st mb-12">Vehicles</div><div className="card mb-16" style={{padding:0}}>{vans.length===0?<div className="em"><Ic n="van" s={28} col="var(--text3)"/><p style={{marginTop:8,fontSize:13}}>No vehicles</p></div>:vans.map(a=><AssetRow key={a.id} a={a}/>)}</div></div>
        <div><div className="st mb-12">Tools &amp; Equipment</div><div className="card mb-16" style={{padding:0}}>{tools.length===0?<div className="em"><Ic n="tool" s={28} col="var(--text3)"/><p style={{marginTop:8,fontSize:13}}>No tools</p></div>:tools.map(a=><AssetRow key={a.id} a={a}/>)}</div></div>
      </div>

      {(showNew||(editId&&editAsset))&&<Mod title={editId?"Edit Asset":"Add Asset"} onClose={()=>{setShowNew(false);setEditId(null)}}
        footer={<><button className="btn btn-ghost" onClick={()=>{setShowNew(false);setEditId(null)}}>Cancel</button><button className="btn btn-teal" onClick={save}>{editId?"Save Changes":"Add Asset"}</button></>}>
        <div className="fg"><label className="fl">Name *</label><input className="fi" placeholder="e.g. Transit Custom, Fluke 1664FC" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
        <div className="fr">
          <div className="fg"><label className="fl">Type</label><select className="fs" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option value="van">Van / Vehicle</option><option value="tool">Tool / Equipment</option></select></div>
          <div className="fg"><label className="fl">Rego / Serial</label><input className="fi" placeholder="EL22 XRT" value={form.rego} onChange={e=>setForm(p=>({...p,rego:e.target.value}))}/></div>
        </div>
        <div className="fg"><label className="fl">Notes</label><textarea className="fta" placeholder="MOT, calibration, service dates…" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
        <div className="fg"><label className="fl">Service Reminder</label><input className="fi" placeholder="e.g. May 2026" value={form.serviceReminder} onChange={e=>setForm(p=>({...p,serviceReminder:e.target.value}))}/></div>
      </Mod>}
    </div>
  );
};

// ─── WORKERS ──────────────────────────────────────────────────────────────────
const WorkersPage = ({workers,setWorkers,jobs}) => {
  const [showNew,setShowNew]=useState(false);
  const [form,setForm]=useState({name:"",role:"",notes:""});
  const [selW,setSelW]=useState(null);
  const [hf,setHf]=useState({date:TODAY,hrs:"",jobId:""});
  const add=()=>{if(!form.name.trim())return;setWorkers(p=>[{...form,id:`W${uid()}`,hours:[]},...p]);setForm({name:"",role:"",notes:""});setShowNew(false)};
  const addHrs=()=>{if(!hf.hrs||!selW)return;setWorkers(p=>p.map(w=>w.id===selW.id?{...w,hours:[{date:hf.date,hrs:Number(hf.hrs),jobId:hf.jobId},...w.hours]}:w));setHf({date:TODAY,hrs:"",jobId:""});setSelW(null)};
  return (
    <div className="page">
      <div className="flex ai-c jb mb-20">
        <div><h1 style={{fontSize:20,fontWeight:700}}>Workers</h1><p style={{fontSize:13,color:"var(--text3)",marginTop:3}}>{workers.length} team members</p></div>
        <button className="btn btn-blue" onClick={()=>setShowNew(true)}><Ic n="plus" s={15}/> Add Worker</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="twocol">
        {workers.map(w=>{
          const total=w.hours.reduce((s,h)=>s+h.hrs,0);
          return <div key={w.id} className="card p-20">
            <div className="flex ai-c gap-12 mb-12">
              <div className="av" style={{width:44,height:44,fontSize:16,borderRadius:12,flexShrink:0}}>{ini(w.name)}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{w.name}</div>{w.role&&<div style={{fontSize:12.5,color:"var(--text3)"}}>{w.role}</div>}</div>
              <button className="btn btn-ghost btn-xs" onClick={()=>{setSelW(w);setHf({date:TODAY,hrs:"",jobId:""})}}>Log Hours</button>
            </div>
            {w.notes&&<p style={{fontSize:13,color:"var(--text2)",lineHeight:1.5,marginBottom:12}}>{w.notes}</p>}
            <div style={{fontSize:12,color:"var(--text3)",marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Ic n="clock" s={12}/><strong style={{color:"var(--text)"}}>{total}h</strong> logged total</div>
            {w.hours.slice(0,4).map((h,i)=>{const job=jobs.find(j=>j.id===h.jobId);return <div key={i} className="dr" style={{padding:"6px 0"}}><div className="dl">{h.date}</div><div className="dv" style={{fontSize:13}}>{h.hrs}h{job?` — ${job.name}`:""}</div></div>})}
            {w.hours.length===0&&<p style={{fontSize:13,color:"var(--text3)"}}>No hours logged</p>}
          </div>;
        })}
      </div>
      {workers.length===0&&<div className="card em"><Ic n="workers" s={32} col="var(--text3)"/><p style={{marginTop:8,fontSize:13}}>No workers yet</p></div>}
      {showNew&&<Mod title="Add Worker" onClose={()=>setShowNew(false)} footer={<><button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button><button className="btn btn-blue" onClick={add}>Add</button></>}><div className="fg"><label className="fl">Name *</label><input className="fi" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div><div className="fg"><label className="fl">Role</label><input className="fi" placeholder="e.g. Apprentice, VA" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}/></div><div className="fg"><label className="fl">Notes</label><textarea className="fta" style={{minHeight:70}} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div></Mod>}
      {selW&&<Mod title={`Log Hours — ${selW.name}`} onClose={()=>setSelW(null)} footer={<><button className="btn btn-ghost" onClick={()=>setSelW(null)}>Cancel</button><button className="btn btn-blue" onClick={addHrs}>Log Hours</button></>}><div className="fr"><div className="fg"><label className="fl">Date</label><input type="date" className="fi" value={hf.date} onChange={e=>setHf(p=>({...p,date:e.target.value}))}/></div><div className="fg"><label className="fl">Hours *</label><input type="number" className="fi" value={hf.hrs} onChange={e=>setHf(p=>({...p,hrs:e.target.value}))}/></div></div><div className="fg"><label className="fl">Link to Job</label><select className="fs" value={hf.jobId} onChange={e=>setHf(p=>({...p,jobId:e.target.value}))}><option value="">— No job —</option>{jobs.map(j=><option key={j.id} value={j.id}>{j.ref} · {j.name}</option>)}</select></div></Mod>}
    </div>
  );
};

// ─── ACCOUNT ──────────────────────────────────────────────────────────────────
const AccountPage = ({logoUrl, setLogoUrl}) => {
  const [ed,setEd]=useState(false);
  const [f,setF]=useState({...ACCOUNT});
  const logoRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  };

  return (
    <div className="page">
      <div className="flex ai-c jb mb-20"><div><h1 style={{fontSize:20,fontWeight:700}}>My Account</h1></div><button className="btn btn-ghost" onClick={()=>setEd(!ed)}><Ic n="edit" s={14}/> {ed?"Cancel":"Edit"}</button></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="twocol">
        <div>
          <div className="card mb-16">
            <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
              <div className="av" style={{width:56,height:56,fontSize:20,borderRadius:14,flexShrink:0}}>{ini(f.name)}<div className="av-dot"/></div>
              <div><div style={{fontWeight:700,fontSize:17}}>{f.name}</div><div style={{fontSize:13,color:"var(--text2)"}}>{f.trade} · {f.company}</div></div>
            </div>
            <div style={{padding:"0 20px 20px"}}>
              {ed?<>{[["name","Full name"],["company","Company"],["trade","Trade"],["email","Email"],["phone","Phone"],["regNo","Reg No."],["address","Address"]].map(([k,l])=><div key={k} className="fg"><label className="fl">{l}</label><input className="fi" value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/></div>)}<button className="btn btn-blue w-full" onClick={()=>setEd(false)}>Save Changes</button></>
              :[["Name",f.name],["Company",f.company],["Trade",f.trade],["Email",f.email],["Phone",f.phone],["Reg No.",f.regNo],["Address",f.address]].map(([l,v])=><div key={l} className="dr"><div className="dl">{l}</div><div className="dv">{v}</div></div>)}
            </div>
          </div>
          <div className="card p-20">
            {/* Branding / Logo upload */}
            <div className="st mb-8">Company Branding</div>
            <p style={{fontSize:12.5,color:"var(--text3)",marginBottom:12,lineHeight:1.5}}>Your logo appears in the sidebar. Upload a PNG or JPG with a transparent or white background for best results.</p>
            <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogoUpload}/>
            {logoUrl
              ? <div style={{marginBottom:12}}>
                  <div style={{background:"var(--bg)",borderRadius:10,padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,minHeight:80}}>
                    <img src={logoUrl} alt="Company logo" style={{maxHeight:70,maxWidth:"100%",objectFit:"contain"}}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={()=>logoRef.current?.click()}><Ic n="upload" s={13}/> Change Logo</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setLogoUrl("")} style={{color:"var(--red)"}}>Remove</button>
                  </div>
                </div>
              : <button className="btn btn-ghost btn-sm w-full mb-12" onClick={()=>logoRef.current?.click()}><Ic n="upload" s={13}/> Upload Company Logo</button>
            }
            <div className="st mb-12">Plan</div>
            <div style={{background:"linear-gradient(135deg,var(--navy),var(--navy2))",borderRadius:12,padding:"16px 18px",color:"#fff"}}><div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Starter Plan</div><div style={{fontSize:12.5,opacity:.8}}>Voice · Tasks · Jobs · Reminders · Assets · Workers</div></div>
          </div>
        </div>
        <div>
          <div className="card p-20 mb-16">
            <div className="st mb-12">How the App Works — Web vs App</div>
            <div className="info-box">
              <p style={{marginBottom:8,fontWeight:600,color:"var(--text)"}}>SoleTasker is a web app — no download needed.</p>
              <p style={{marginBottom:8}}>It runs in your browser at <span style={{fontFamily:"monospace",color:"var(--navy)"}}>soletasker.app</span> — on desktop, tablet, or phone. Nothing to install.</p>
              <p style={{marginBottom:8}}><strong>On your phone:</strong> Open Chrome or Safari, go to the app URL, tap <strong>Share → Add to Home Screen</strong>. It behaves exactly like an app icon — full screen, no browser bars.</p>
              <p style={{color:"var(--teal2)",fontWeight:500}}>✓ Works on iPhone · Android · Mac · PC · Tablet</p>
            </div>
          </div>
          <div className="card p-20">
            <div className="st mb-12">AI Voice Parsing — How it works</div>
            <div className="info-box">
              <p style={{marginBottom:8,fontWeight:600,color:"var(--text)"}}>Voice → Text → Task in 3 steps</p>
              <p style={{marginBottom:6}}>① <strong>You record</strong> — your browser's built-in speech recognition converts your voice to text in real time (Chrome/Safari, no extra setup).</p>
              <p style={{marginBottom:6}}>② <strong>AI reads it</strong> — Claude AI (Anthropic) reads the transcript and extracts: task title, priority, assigned person, and job link.</p>
              <p style={{marginBottom:8}}>③ <strong>You confirm</strong> — you see the result and can edit before anything is saved. Nothing is created automatically.</p>
              <p style={{color:"var(--teal2)",fontWeight:500,fontSize:12}}>Try saying: "Task for VA, Hargreaves job, chase quote sign-off, priority 2"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MEMOS LIST ───────────────────────────────────────────────────────────────
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [nav,setNav]=useState("dashboard");
  const [jobsMode,setJobsMode]=useState("list");
  const [selJobId,setSelJobId]=useState(null);
  const [createPrefill,setCreatePrefill]=useState(null);
  const [sbOpen,setSbOpen]=useState(false);

  // Capture modal — replaces separate VoiceMemoModal
  const [showCapture,setShowCapture]=useState(false);
  const [captureMode,setCaptureMode]=useState("voice"); // "voice" | "manual"
  const [captureJobId,setCaptureJobId]=useState(null);
  const [showAddTask,setShowAddTask]=useState(false); // Add Task choice modal

  const [jobs,setJobs]=useState(SEED_JOBS);
  const [tasks,setTasks]=useState(SEED_TASKS);
  const [reminders,setReminders]=useState(SEED_REMINDERS);
  const [assets,setAssets]=useState(SEED_ASSETS);
  const [workers,setWorkers]=useState(SEED_WORKERS);
  const [inbox,setInbox]=useState([]); // Capture Inbox — unsorted notes
  const [pendingIntake,setPendingIntake]=useState(PENDING_INTAKE);
  const [logoUrl,setLogoUrl]=useState(""); // company logo — user uploads from Account page

  const go=(page,mode,data)=>{
    setNav(page); setSbOpen(false);
    if(page==="jobs"){
      if(mode==="new"){setJobsMode("create");setCreatePrefill(null);}
      else if(mode==="intake"){setJobsMode("create");setCreatePrefill(data);}
      else if(mode&&typeof mode==="string"&&mode!=="list"){setSelJobId(mode);setJobsMode("detail");}
      else{setJobsMode("list");setSelJobId(null);}
    }
  };

  const openCapture=(mode="voice",jobId=null)=>{setCaptureMode(mode);setCaptureJobId(jobId);setShowCapture(true)};

  // Unified save handlers from CaptureModal
  const handleSaveTask=(taskData)=>{
    const nt={id:taskData.id||`T${uid()}`,title:taskData.title,priority:taskData.priority||"P2",assignedTo:taskData.assignedTo||"Me",jobId:taskData.jobId||null,done:false,dueDate:taskData.dueDate||"",notes:taskData.notes||""};
    setTasks(p=>[nt,...p]);
    if(nt.jobId)setJobs(p=>p.map(j=>j.id===nt.jobId?{...j,tasks:[...j.tasks,nt.id]}:j));
  };
  const handleSaveReminder=(remData)=>{
    setReminders(p=>[{...remData,id:remData.id||`R${uid()}`},...p]);
  };
  const handleSaveNote=(noteData)=>{
    setInbox(p=>[{...noteData,id:noteData.id||`N${uid()}`},...p]);
  };
  const handleCreateJob=(jobEdit,transcript)=>{
    const ref=`J-${String(jobs.length+1).padStart(3,"0")}`;
    const name=jobEdit.name||jobEdit.client||"New Job";
    const scopeItems=(jobEdit.scope||"").split(/[.!?]+/).filter(s=>s.trim().length>4).map((s,i)=>({id:`SI${uid()}_${i}`,text:s.trim(),done:false}));
    const nj={id:`J${uid()}`,ref,name,client:jobEdit.client||"",address:jobEdit.address||"",phone:"",email:"",scope:jobEdit.scope||transcript,notes:"Created from capture",status:"upcoming",value:0,date:"",type:"Job",checkboxes:{booked:false,cert:false,invoice:false,completed:false},certUploaded:false,invoiceUploaded:false,tasks:[],scopeItems,unfinished:[],notesLog:[],memos:[],photos:[]};
    setJobs(p=>[nj,...p]);
    setSelJobId(nj.id);setJobsMode("detail");setNav("jobs");
  };
  const handleAddToJob=(jobId,taskTitle,fullText)=>{
    const nt={id:`T${uid()}`,title:taskTitle,priority:"P2",assignedTo:"Me",jobId,done:false,dueDate:"",notes:fullText};
    setTasks(p=>[nt,...p]);
    setJobs(p=>p.map(j=>j.id===jobId?{...j,tasks:[...j.tasks,nt.id]}:j));
  };
  // Legacy: voice memo from inside a job (still stores raw memo too)
  const openMemo=(jobId=null)=>openCapture("voice",jobId);
  const handleJobCreated=(job)=>{setJobs(p=>[job,...p]);setSelJobId(job.id);setJobsMode("detail")};

  const openCount=tasks.filter(t=>!t.done).length;
  const remCount=reminders.filter(r=>!r.done).length;
  const inboxCount=inbox.length;
  const overdue=tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<TODAY).length
    +reminders.filter(r=>!r.done&&r.dueDate&&r.dueDate<TODAY).length;
  const dueToday=tasks.filter(t=>!t.done&&t.dueDate===TODAY).length
    +reminders.filter(r=>!r.done&&r.dueDate===TODAY).length;
  const done12=tasks.filter(t=>t.done).length;

  const selJob=jobs.find(j=>j.id===selJobId);
  const pageLabel=nav==="jobs"?(jobsMode==="create"?"Create Job":jobsMode==="detail"?"Job Detail":"Jobs")
    :nav==="intake"?"Client Intake Form":nav==="inbox"?"Capture Inbox"
    :({dashboard:"Dashboard",tasks:"Tasks",reminders:"Reminders",assets:"Assets",workers:"Workers",account:"Account"})[nav]||"";

  const render=()=>{
    const back=()=>go("dashboard");
    if(nav==="dashboard") return <Dashboard jobs={jobs} tasks={tasks} setTasks={setTasks} reminders={reminders} setReminders={setReminders} inbox={inbox} pendingIntake={pendingIntake} setPendingIntake={setPendingIntake} onNav={go} onVoiceMemo={()=>openCapture("voice")} onAddTask={()=>setShowAddTask(true)}/>;
    if(nav==="jobs"){
      if(jobsMode==="create") return <CreateJob jobs={jobs} onCreated={handleJobCreated} onCancel={()=>{setJobsMode("list");setCreatePrefill(null)}} prefill={createPrefill}/>;
      if(jobsMode==="detail"&&selJob) return <JobDetail job={selJob} jobs={jobs} tasks={tasks} setTasks={setTasks} setJobs={setJobs} onBack={()=>setJobsMode("list")}/>;
      return <JobsList jobs={jobs} onSelect={id=>{setSelJobId(id);setJobsMode("detail")}} onNew={()=>{setJobsMode("create");setCreatePrefill(null)}} pendingIntake={pendingIntake} onAcceptIntake={(intake,action)=>{if(action==="accept"){setPendingIntake(p=>p.filter(x=>x.id!==intake.id));setCreatePrefill(intake);setJobsMode("create");}else{setPendingIntake(p=>p.filter(x=>x.id!==intake.id));}}}/>;
    }
    if(nav==="tasks") return <TasksPage tasks={tasks} setTasks={setTasks} jobs={jobs} onNav={go}/>;
    if(nav==="reminders") return <RemindersPage reminders={reminders} setReminders={setReminders} tasks={tasks} setTasks={setTasks} jobs={jobs} onAddNote={()=>setShowAddTask(true)}/>;
    if(nav==="assets") return <AssetsPage assets={assets} setAssets={setAssets}/>;
    if(nav==="workers") return <WorkersPage workers={workers} setWorkers={setWorkers} jobs={jobs}/>;
    if(nav==="intake") return <IntakePage onClose={()=>setNav("dashboard")}/>;
    if(nav==="inbox") return <InboxPage inbox={inbox} setInbox={setInbox} tasks={tasks} setTasks={setTasks} reminders={reminders} setReminders={setReminders} jobs={jobs} onNav={go}/>;
    if(nav==="account") return <AccountPage logoUrl={logoUrl} setLogoUrl={setLogoUrl}/>;
    return null;
  };

  const navGroups=[
    {label:null,items:[{id:"dashboard",icon:"dashboard",label:"Dashboard"}]},
    {label:"Work",items:[{id:"jobs",icon:"jobs",label:"Jobs"},{id:"tasks",icon:"tasks",label:"Tasks",badge:openCount},{id:"reminders",icon:"reminders",label:"Reminders",badge:remCount}]},
    {label:"Operations",items:[{id:"assets",icon:"assets",label:"Assets"},{id:"workers",icon:"workers",label:"Workers"}]},
    {label:"Account",items:[{id:"account",icon:"account",label:"Account"}]},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {sbOpen&&<div className="sb-ov" onClick={()=>setSbOpen(false)}/>}
        <aside className={`sb${sbOpen?" open":""}`}>
          {/* Sidebar header — company logo when uploaded, else SoleTasker wordmark */}
          <div className="sb-logo" onClick={()=>go("dashboard")} style={{flexDirection:"column",gap:0,alignItems:"center",justifyContent:"center",padding:"14px 14px 12px"}}>
            {logoUrl
              ? <>
                  <img src={logoUrl} alt="Company logo" style={{maxHeight:48,maxWidth:160,objectFit:"contain"}}/>
                  <div style={{fontSize:9,color:"var(--text3)",fontWeight:500,letterSpacing:.3,marginTop:6}}>powered by <span style={{color:"var(--teal)",fontWeight:700}}>SoleTasker</span></div>
                </>
              : <Logo/>
            }
          </div>
          <nav className="sb-nav">
            {navGroups.map((g,gi)=>(
              <div key={gi}>
                {g.label&&<div className="nav-sec">{g.label}</div>}
                {g.items.map(it=>(
                  <div key={it.id} className={`nav-it${nav===it.id?" on":""}`} onClick={()=>go(it.id)}>
                    <Ic n={it.icon} s={16}/>{it.label}
                    {it.badge>0&&<span className="nav-badge">{it.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-user" onClick={()=>go("account")}>
            <div className="av" style={{width:36,height:36}}>{ini(ACCOUNT.name)}<div className="av-dot"/></div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{ACCOUNT.name}</div><div style={{fontSize:11.5,color:"var(--text3)"}}>{ACCOUNT.trade}</div></div>
            <Ic n="settings" s={15} col="var(--text3)"/>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <Logo/>
            <div className="topbar-div"/>
            <span style={{fontSize:13,color:"var(--text2)",fontWeight:500}}>{new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span>
            <div className="topbar-div"/>
            {overdue>0&&<span style={{fontSize:13,fontWeight:600,color:"var(--red)",display:"flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:"50%",background:"var(--red)",display:"inline-block"}}/>Overdue: {overdue}</span>}
            {dueToday>0&&<span style={{fontSize:13,fontWeight:500,color:"var(--amber)",display:"flex",alignItems:"center",gap:5,marginLeft:10}}><span style={{width:8,height:8,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}}/>Due Today: {dueToday}</span>}
            {done12>0&&<span style={{fontSize:13,fontWeight:500,color:"var(--green)",display:"flex",alignItems:"center",gap:5,marginLeft:10}}><span style={{width:8,height:8,borderRadius:"50%",background:"var(--green)",display:"inline-block"}}/>Done: {done12}</span>}
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
              {nav!=="dashboard"&&<button className="btn btn-ghost btn-sm" onClick={()=>setShowAddTask(true)}><Ic n="plus" s={13}/> Add Task</button>}
              {nav!=="dashboard"&&<button className="btn btn-blue btn-sm" onClick={()=>openCapture("voice")} style={{fontWeight:700,paddingLeft:14,paddingRight:14}}><Ic n="mic" s={14}/> Voice</button>}
              <div className="av" style={{width:34,height:34,cursor:"pointer"}} onClick={()=>go("account")}>{ini(ACCOUNT.name)}<div className="av-dot"/></div>
            </div>
          </div>

          <div className="mob-top">
            <button className="btn-ic" onClick={()=>nav==="dashboard"?setSbOpen(true):go("dashboard")}>
              <Ic n={nav==="dashboard"?"menu":"chevL"} s={18}/>
            </button>
            <span className="mob-top-title">{pageLabel}</span>
            {nav!=="dashboard"&&<div className="flex gap-8">
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowAddTask(true)} style={{padding:"6px 10px"}}><Ic n="plus" s={14}/></button>
              <button className="btn btn-blue btn-sm" onClick={()=>openCapture("voice")} style={{padding:"6px 12px",fontWeight:700}}><Ic n="mic" s={14}/></button>
            </div>}
          </div>

          {render()}

          <div className="mob-bar">
            {[{id:"dashboard",icon:"dashboard",label:"Home"},{id:"jobs",icon:"jobs",label:"Jobs"},{id:"tasks",icon:"tasks",label:"Tasks"},{id:"reminders",icon:"reminders",label:"Remind"},{id:"account",icon:"account",label:"More"}].map(it=>(
              <div key={it.id} className={`mbi${nav===it.id?" on":""}`} onClick={()=>go(it.id)}>
                <Ic n={it.icon} s={20} col={nav===it.id?"var(--blue)":"var(--text3)"}/>
                <span>{it.label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showCapture&&<CaptureModal
        mode={captureMode}
        jobs={jobs}
        onClose={()=>setShowCapture(false)}
        onSaveTask={handleSaveTask}
        onSaveReminder={handleSaveReminder}
        onSaveNote={handleSaveNote}
        onCreateJob={handleCreateJob}
        onAddToJob={handleAddToJob}
      />}
      {showAddTask&&<AddTaskModal
        onVoice={()=>openCapture("voice")}
        onCreateJob={handleCreateJob}
        onSaveTask={handleSaveTask}
        onSaveReminder={handleSaveReminder}
        onNav={go}
        onClose={()=>setShowAddTask(false)}
      />}
    </>
  );
}

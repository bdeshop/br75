import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaReply, FaForward, FaTrash, FaPaperPlane, FaSpinner,
  FaSearch, FaPaperclip, FaStar, FaRegStar, FaPlus,
  FaChevronDown, FaChevronLeft, FaTimes, FaExpandAlt,
  FaCompressAlt, FaCheck, FaEllipsisH, FaArchive,
} from 'react-icons/fa';
import {
  FiMail, FiSend, FiInbox, FiRefreshCw,
} from 'react-icons/fi';
import { MdMarkEmailRead, MdMarkEmailUnread } from 'react-icons/md';
import { toast, Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';
import { FaPencil } from "react-icons/fa6";

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --bg-base:      #0F111A;
      --bg-elevated:  #131720;
      --bg-card:      #161B27;
      --bg-hover:     #1C2235;
      --bg-active:    #1E2840;
      --border:       rgba(255,255,255,.055);
      --border-soft:  rgba(255,255,255,.03);
      --accent:       #5B6EF5;
      --accent-2:     #7C8FF7;
      --accent-glow:  rgba(91,110,245,.18);
      --accent-dim:   rgba(91,110,245,.08);
      --text-primary: #E8ECF4;
      --text-secondary:#8B96B0;
      --text-muted:   #44506A;
      --text-faint:   #282F42;
      --danger:       #F56565;
      --success:      #48BB78;
      --warn:         #ECC94B;
    }

    .email-app * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
    .email-app h1,.email-app h2,.email-app .brand { font-family: 'Syne', sans-serif; }
    .email-app code,.email-app .mono { font-family: 'JetBrains Mono', monospace; }

    .email-app ::-webkit-scrollbar { width: 2px; height: 2px; }
    .email-app ::-webkit-scrollbar-track { background: transparent; }
    .email-app ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
    .email-app ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }

    /* ── Noise texture overlay ── */
    .noise-overlay::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: .5;
    }

    /* ── Quill dark premium ── */
    .quill-noir .ql-toolbar {
      background: var(--bg-elevated);
      border: none !important;
      border-bottom: 1px solid var(--border) !important;
      padding: 10px 16px;
    }
    .quill-noir .ql-toolbar .ql-stroke { stroke: var(--text-muted); transition: stroke .12s; }
    .quill-noir .ql-toolbar .ql-fill   { fill:   var(--text-muted); transition: fill .12s; }
    .quill-noir .ql-toolbar .ql-picker-label { color: var(--text-muted); }
    .quill-noir .ql-toolbar button:hover .ql-stroke,
    .quill-noir .ql-toolbar button.ql-active .ql-stroke { stroke: var(--accent-2); }
    .quill-noir .ql-toolbar button:hover .ql-fill,
    .quill-noir .ql-toolbar button.ql-active .ql-fill   { fill:  var(--accent-2); }
    .quill-noir .ql-container {
      background: var(--bg-base);
      border: none !important;
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      color: var(--text-secondary);
    }
    .quill-noir .ql-editor { min-height: 160px; padding: 18px 20px; line-height: 1.8; }
    .quill-noir .ql-editor.ql-blank::before { color: var(--text-faint); font-style: normal; font-size: 13.5px; }

    /* ── Animations ── */
    @keyframes fadeSlideUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
    @keyframes fadeIn       { from { opacity:0; } to { opacity:1; } }
    @keyframes slideInRight { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:none; } }
    @keyframes floatUp      { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:none; } }
    @keyframes shimmer      { 0%{background-position:-400% center} 100%{background-position:400% center} }
    @keyframes pulse-ring   { 0%{transform:scale(1);opacity:1} 70%{transform:scale(2);opacity:0} 100%{opacity:0} }
    @keyframes glow-pulse   { 0%,100%{box-shadow:0 0 0 0 var(--accent-glow)} 50%{box-shadow:0 0 20px 6px var(--accent-glow)} }
    @keyframes spin         { to { transform: rotate(360deg); } }

    .anim-up     { animation: fadeSlideUp  .28s cubic-bezier(.16,1,.3,1) both; }
    .anim-fade   { animation: fadeIn       .2s ease both; }
    .anim-right  { animation: slideInRight .3s cubic-bezier(.16,1,.3,1) both; }
    .anim-float  { animation: floatUp      .34s cubic-bezier(.16,1,.3,1) both; }
    .d1 { animation-delay:.05s } .d2 { animation-delay:.1s }
    .d3 { animation-delay:.15s } .d4 { animation-delay:.2s } .d5 { animation-delay:.25s }

    .shimmer {
      background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
      background-size: 400% 100%;
      animation: shimmer 1.6s infinite;
    }

    /* ── Email row ── */
    .erow { transition: all .14s ease; position: relative; }
    .erow::after {
      content:''; position:absolute; bottom:0; left:24px; right:24px;
      height:1px; background: var(--border-soft);
    }
    .erow:hover { background: var(--bg-hover) !important; }
    .erow:hover .erow-actions { opacity:1; transform:translateY(0); }
    .erow-actions { opacity:0; transform:translateY(4px); transition: all .15s ease; }
    .erow-sel { background: var(--bg-active) !important; }
    .erow-sel::before {
      content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
      width:3px; height:60%; background:linear-gradient(180deg,var(--accent),var(--accent-2));
      border-radius:0 3px 3px 0;
    }

    /* ── Nav item ── */
    .nav-item { transition: all .14s ease; border: 1px solid transparent; }
    .nav-active {
      background: var(--accent-dim) !important;
      border-color: rgba(91,110,245,.2) !important;
      color: var(--accent-2) !important;
    }
    .nav-active svg { color: var(--accent) !important; }

    /* ── Tooltips ── */
    .tip { position:relative; }
    .tip .tipbox {
      position:absolute; bottom:calc(100%+6px); left:50%; transform:translateX(-50%) translateY(4px);
      background:var(--bg-active); border:1px solid var(--border);
      color:var(--text-secondary); font-size:11px; white-space:nowrap;
      padding:4px 10px; border-radius:8px;
      opacity:0; pointer-events:none; transition:all .13s ease; z-index:300;
      box-shadow: 0 4px 16px rgba(0,0,0,.4);
    }
    .tip:hover .tipbox { opacity:1; transform:translateX(-50%) translateY(0); }

    /* ── Float panel shadow ── */
    .float-shadow {
      box-shadow:
        0 0 0 1px var(--border),
        0 4px 6px rgba(0,0,0,.3),
        0 24px 64px rgba(0,0,0,.7),
        0 0 80px -20px var(--accent-glow);
    }

    /* ── Unread dot ── */
    .unread-dot {
      width:7px; height:7px; border-radius:50%;
      background: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-glow);
      position: relative;
    }
    .unread-dot::after {
      content:''; position:absolute; inset:0; border-radius:50%;
      background: var(--accent); animation: pulse-ring 2s ease-out infinite;
    }

    /* ── Email body ── */
    .email-body { color:var(--text-secondary); line-height:1.85; font-size:14px; }
    .email-body a { color:var(--accent-2); text-decoration:none; border-bottom:1px solid var(--accent-glow); }
    .email-body p { margin-bottom:12px; }
    .email-body img { max-width:100%; border-radius:10px; margin:10px 0; }

    /* ── Chip ── */
    .chip {
      display:inline-flex; align-items:center; gap:5px;
      background:var(--accent-dim); border:1px solid rgba(91,110,245,.2);
      color:var(--accent-2); font-size:11px; padding:3px 10px 3px 7px;
      border-radius:99px; font-weight:600; letter-spacing:.01em;
    }

    /* ── Compose button glow ── */
    .compose-btn {
      background: linear-gradient(135deg, var(--accent) 0%, #4338ca 100%);
      box-shadow: 0 4px 24px rgba(91,110,245,.4), inset 0 1px 0 rgba(255,255,255,.12);
      transition: all .2s ease;
    }
    .compose-btn:hover {
      box-shadow: 0 6px 32px rgba(91,110,245,.55), inset 0 1px 0 rgba(255,255,255,.12);
      transform: translateY(-1px);
    }
    .compose-btn:active { transform: scale(.97); }

    /* ── Send button ── */
    .send-btn {
      transition: all .18s ease;
    }
    .send-btn:hover { transform: translateY(-1px); }
    .send-btn:active { transform: scale(.97); }

    /* ── Icon btn ── */
    .ibtn {
      transition: all .14s ease;
      border-radius: 5px;
    }
    .ibtn:hover { background: var(--bg-hover) !important; }

    /* ── Search focus ring ── */
    .search-focused {
      border-color: rgba(91,110,245,.4) !important;
      box-shadow: 0 0 0 3px var(--accent-glow) !important;
    }

    /* ── Glass panel ── */
    .glass {
      background: var(--bg-card);
      border: 1px solid var(--border);
      backdrop-filter: blur(20px);
    }

    /* ── Reply card ── */
    .reply-card { transition: all .18s ease; }
    .reply-card:hover { background: var(--bg-hover) !important; }

    /* ── Status badge ── */
    .badge {
      font-size:10px; font-weight:700; font-family:'JetBrains Mono',monospace;
      padding:2px 8px; border-radius:6px; letter-spacing:.03em;
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};
const QUILL_FORMATS = ['header','bold','italic','underline','strike','color','list','bullet','link'];

const AVATARS = [
  ['#5B6EF5','#818cf8'],['#0EA5E9','#38bdf8'],['#10B981','#34d399'],
  ['#EF4444','#f87171'],['#F59E0B','#fbbf24'],['#8B5CF6','#c4b5fd'],
  ['#EC4899','#f9a8d4'],['#06B6D4','#67e8f9'],['#84CC16','#bef264'],
];
const avColor = (s='') => AVATARS[(s.charCodeAt(0)||0) % AVATARS.length];
const initials = (n='') => n.replace(/<.*?>/g,'').trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'?';

const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return moment(date).format('h:mm A');
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return moment(date).format('ddd');
  if (diff < 365) return moment(date).format('MMM D');
  return moment(date).format('MMM YYYY');
};

/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */
const Avatar = ({ name='?', size=36 }) => {
  const [bg, hi] = avColor(name);
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`linear-gradient(140deg,${bg}cc,${hi}88)`,
      border:`1.5px solid ${hi}2a`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*.3, fontWeight:700, color:'#fff', letterSpacing:'-.3px',
      fontFamily:'Syne,sans-serif',
      boxShadow:`0 2px 12px ${bg}30`,
    }}>
      {initials(name)}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <>
    {[...Array(7)].map((_,i) => (
      <div key={i} className="flex items-start gap-3 px-5 py-4" style={{ borderBottom:'1px solid var(--border-soft)' }}>
        <div className="shimmer shrink-0" style={{ width:38,height:38,borderRadius:'50%' }} />
        <div className="flex-1 space-y-2 pt-1">
          <div className="shimmer rounded-lg" style={{ height:10, width:`${48+i*6}%` }} />
          <div className="shimmer rounded-lg" style={{ height:9, width:`${60+i*4}%` }} />
          <div className="shimmer rounded-lg" style={{ height:8, width:'38%' }} />
        </div>
        <div className="shimmer rounded-lg shrink-0 mt-1" style={{ height:8, width:34 }} />
      </div>
    ))}
  </>
);

/* ─────────────────────────────────────────────────────────────
   ICON BUTTON
───────────────────────────────────────────────────────────── */
const IBtn = ({ icon, tip, onClick, danger=false, active=false, sm=false, className='' }) => (
  <button
    onClick={onClick}
    className={`ibtn tip inline-flex items-center justify-center border border-transparent transition-all ${sm?'p-1.5':'p-2'} ${
      active
        ? 'text-[var(--accent-2)] !bg-[var(--accent-dim)] !border-[rgba(91,110,245,.2)]'
        : danger
          ? 'text-[var(--text-muted)] hover:!text-[#f87171] hover:!bg-[rgba(239,68,68,.08)]'
          : 'text-[var(--text-muted)] hover:!text-[var(--text-primary)]'
    } ${className}`}
  >
    {icon}
    {tip && <span className="tipbox">{tip}</span>}
  </button>
);

/* ─────────────────────────────────────────────────────────────
   FIELD ROW
───────────────────────────────────────────────────────────── */
const FRow = ({ label, children }) => (
  <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom:'1px solid var(--border-soft)' }}>
    <span style={{ fontSize:10, fontWeight:700, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'1.5px', width:30, flexShrink:0, fontFamily:'JetBrains Mono,monospace' }}>
      {label}
    </span>
    {children}
  </div>
);

const FInput = ({ value, onChange, placeholder, type='text', readOnly=false, ...p }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
    className="flex-1 bg-transparent text-[13px] placeholder-[var(--text-faint)] focus:outline-none"
    style={{ color: readOnly ? 'var(--text-muted)' : 'var(--text-primary)', cursor: readOnly ? 'default' : 'auto' }}
    {...p}
  />
);

/* ─────────────────────────────────────────────────────────────
   FLOAT COMPOSE / REPLY PANEL
───────────────────────────────────────────────────────────── */
const FloatPanel = ({ title, subtitle, accent='#5B6EF5', onClose, onSubmit, loading, isReply=false, fields, quillValue, onQuillChange }) => {
  const [min, setMin] = useState(false);
  const [wide, setWide] = useState(false);

  return (
    <div
      className="float-shadow anim-float fixed z-[1000] rounded-t-2xl overflow-hidden"
      style={{
        bottom:0, right:28,
        width: wide ? 760 : 560,
        maxHeight: min ? 52 : wide ? '88vh' : '74vh',
        background:'var(--bg-elevated)',
        border:'1px solid var(--border)',
        borderBottom:'none',
        transition:'all .26s cubic-bezier(.16,1,.3,1)',
      }}
    >
      {/* Header bar */}
      <div
        onClick={() => setMin(!min)}
        className="flex items-center gap-3 px-5 py-3 cursor-pointer select-none"
        style={{ borderBottom:'1px solid var(--border-soft)', background:'var(--bg-card)' }}
      >
        <div style={{ width:28, height:28, borderRadius:9, background:`${accent}15`, border:`1px solid ${accent}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {isReply ? <FaReply size={10} style={{ color:accent }} /> : <FaPaperPlane size={10} style={{ color:accent }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontFamily:'Syne,sans-serif', lineHeight:1.2 }} className="truncate">{title}</p>
          {subtitle && <p style={{ fontSize:10, color:'var(--text-faint)', marginTop:1 }} className="truncate">{subtitle}</p>}
        </div>
        <div className="flex gap-0.5 shrink-0" onClick={e=>e.stopPropagation()}>
          <IBtn sm icon={wide?<FaCompressAlt size={9}/>:<FaExpandAlt size={9}/>} tip={wide?'Collapse':'Expand'} onClick={()=>setWide(!wide)} />
          <IBtn sm icon={<FaChevronDown size={9} style={{ transform:min?'rotate(180deg)':'none', transition:'transform .2s' }} />} tip={min?'Restore':'Minimize'} onClick={()=>setMin(!min)} />
          <IBtn sm icon={<FaTimes size={9}/>} tip="Discard" onClick={onClose} danger />
        </div>
      </div>

      {!min && (
        <div className="flex flex-col" style={{ maxHeight: wide?'calc(88vh - 52px)':'calc(74vh - 52px)' }}>
          <div className="shrink-0">{fields}</div>
          <div className="flex-1 overflow-y-auto">
            <div className="quill-noir">
              <ReactQuill
                theme="snow" value={quillValue} onChange={onQuillChange}
                modules={QUILL_MODULES} formats={QUILL_FORMATS}
                placeholder={isReply?'Write your reply…':'Write your message…'}
                style={{ minHeight: wide?340:180 }}
              />
            </div>
          </div>
          {/* Footer */}
          <div className="shrink-0 flex items-center gap-3 px-5 py-3" style={{ borderTop:'1px solid var(--border-soft)', background:'var(--bg-base)' }}>
            <button
              onClick={onSubmit} disabled={loading}
              className="send-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white disabled:opacity-40"
              style={{ background:`linear-gradient(135deg,${accent},#4338ca)`, boxShadow:`0 4px 20px ${accent}35`, fontFamily:'Syne,sans-serif' }}
            >
              {loading
                ? <><FaSpinner style={{ animation:'spin 1s linear infinite' }} size={11} /> Sending…</>
                : isReply
                  ? <><FaReply size={11}/> Send Reply</>
                  : <><FaPaperPlane size={11}/> Send Message</>
              }
            </button>
            <div style={{ width:1, height:18, background:'var(--border)' }} />
            <div className="flex-1" />
            <button onClick={onClose} style={{ fontSize:11, color:'var(--text-faint)', display:'flex', alignItems:'center', gap:5, transition:'color .13s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--text-faint)'}>
              <FaTrash size={9}/> Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   REPLY THREAD
───────────────────────────────────────────────────────────── */
const ReplyThread = ({ replies }) => {
  if (!replies?.length) return null;
  return (
    <div className="mt-8 anim-up d3">
      <div className="flex items-center gap-3 mb-5">
        <div style={{ height:1, flex:1, background:'var(--border)' }} />
        <span className="badge" style={{ background:'var(--bg-active)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>
          {replies.length} {replies.length===1?'REPLY':'REPLIES'}
        </span>
        <div style={{ height:1, flex:1, background:'var(--border)' }} />
      </div>
      {replies.map((r,i) => (
        <div key={r._id||i} className="reply-card rounded-2xl p-5 mb-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div className="flex items-start gap-3">
            <Avatar name={r.fromName||r.from||'Support'} size={34} />
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                <div>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', fontFamily:'Syne,sans-serif' }}>{r.fromName||r.from?.split('@')[0]||'Support'}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:8 }}>{r.from}</span>
                </div>
                <span style={{ fontSize:10, color:'var(--text-faint)', fontFamily:'JetBrains Mono,monospace' }}>{moment(r.createdAt||r.sentAt).format('MMM D · h:mm A')}</span>
              </div>
              <div className="email-body" style={{ fontSize:13 }} dangerouslySetInnerHTML={{ __html:r.body||r.message||'No content' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   INLINE REPLY BOX
───────────────────────────────────────────────────────────── */
const InlineReply = ({ email, onSend, loading }) => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  const send = async () => {
    if (!msg||msg==='<p><br></p>') return;
    await onSend(msg);
    setDone(true);
    setTimeout(()=>{ setDone(false); setMsg(''); setOpen(false); }, 2400);
  };

  return (
    <div className="anim-up d5 mt-10">
      {!open ? (
        <div
          onClick={()=>setOpen(true)}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-text group"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border)', transition:'all .18s ease' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(91,110,245,.3)'; e.currentTarget.style.background='var(--bg-hover)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-card)';}}
        >
          <Avatar name="ME" size={34} />
          <span style={{ fontSize:13, color:'var(--text-faint)', flex:1, transition:'color .15s' }} className="group-hover:text-[var(--text-muted)]">
            Reply to {email.from?.split('<')[0].trim()}…
          </span>
          <span className="chip"><FaReply size={9}/> Reply</span>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden anim-up" style={{ border:'1px solid rgba(91,110,245,.25)', boxShadow:'0 0 0 1px var(--accent-glow), 0 12px 48px rgba(0,0,0,.5)', background:'var(--bg-elevated)' }}>
          <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom:'1px solid var(--border-soft)', background:'var(--bg-card)' }}>
            <Avatar name="ME" size={30} />
            <div className="flex-1">
              <p style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>
                Replying to <span style={{ color:'var(--accent-2)' }}>{email.from?.split('<')[0].trim()}</span>
              </p>
              <p style={{ fontSize:10, color:'var(--text-faint)', marginTop:1 }}>{email.from}</p>
            </div>
            <button onClick={()=>{setOpen(false);setMsg('');}} style={{ color:'var(--text-faint)', transition:'color .12s' }} className="p-1 hover:text-white">
              <FaTimes size={11}/>
            </button>
          </div>

          {/* Quoted original */}
          <div className="mx-5 my-3 pl-4" style={{ borderLeft:'2px solid var(--bg-active)' }}>
            <p style={{ fontSize:11, color:'var(--text-faint)', marginBottom:3 }}>
              {moment(email.receivedAt||email.createdAt).format('MMM D, YYYY [at] h:mm A')} · {email.from}
            </p>
            <p style={{ fontSize:12, color:'var(--text-muted)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {email.bodyText?.substring(0,130)||'—'}
            </p>
          </div>

          <div className="quill-noir">
            <ReactQuill theme="snow" value={msg} onChange={setMsg} modules={QUILL_MODULES} formats={QUILL_FORMATS} placeholder="Write your reply…" style={{ minHeight:160 }} />
          </div>

          <div className="flex items-center gap-3 px-5 py-3" style={{ borderTop:'1px solid var(--border-soft)', background:'var(--bg-base)' }}>
            {done ? (
              <div className="flex items-center gap-2 anim-fade" style={{ color:'var(--success)', fontSize:13, fontWeight:600 }}>
                <FaCheck size={12}/> Reply sent!
              </div>
            ) : (
              <>
                <button
                  onClick={send} disabled={loading||!msg||msg==='<p><br></p>'}
                  className="send-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12.5px] font-semibold text-white disabled:opacity-40"
                  style={{ background:'linear-gradient(135deg,#5B6EF5,#4338ca)', boxShadow:'0 4px 20px rgba(91,110,245,.32)', fontFamily:'Syne,sans-serif' }}
                >
                  {loading ? <><FaSpinner style={{ animation:'spin 1s linear infinite' }} size={11}/> Sending…</> : <><FaReply size={11}/> Send Reply</>}
                </button>
                <div className="flex-1" />
                <button onClick={()=>{setOpen(false);setMsg('');}} style={{ fontSize:11, color:'var(--text-faint)', display:'flex', alignItems:'center', gap:5, transition:'color .13s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--text-faint)'}>
                  <FaTimes size={10}/> Discard
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────────────────────── */
const Divider = ({ label }) => (
  <div className="flex items-center gap-3 px-4 py-2">
    <div style={{ height:1, flex:1, background:'var(--border-soft)' }} />
    {label && <span style={{ fontSize:9, fontWeight:700, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'1.5px', fontFamily:'JetBrains Mono,monospace' }}>{label}</span>}
    <div style={{ height:1, flex:1, background:'var(--border-soft)' }} />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const BusinessEmail = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [filter, setFilter] = useState({ folder:'inbox', unreadOnly:false });
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const PER = 20;

  const [compose, setCompose] = useState({ to:'', subject:'', message:'', cc:'', bcc:'', showCc:false });

  const tok = () => localStorage.getItem('admintoken')||localStorage.getItem('token');
  const aH  = () => ({ Authorization:`Bearer ${tok()}` });
  const jH  = () => ({ 'Content-Type':'application/json', ...aH() });

  /* ── Fetch Emails ── */
  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${base_url}/api/admin/emails?page=${page}&limit=${PER}`;
      if (filter.folder==='starred') url += `&folder=starred`;
      else if (filter.folder==='inbox') url += `&folder=inbox`;
      else if (filter.folder==='sent') url += `&folder=sent`;
      else if (filter.folder==='archive') url += `&folder=archived`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const r = await fetch(url, { headers:aH() });
      const d = await r.json();
      if (d.success) {
        setEmails(d.data||[]);
        setTotalPages(d.totalPages||1);
        setTotalEmails(d.total||0);
      } else { toast.error(d.message||'Failed to fetch'); }
    } catch(err) {
      toast.error('Connection error');
    } finally { setLoading(false); }
  }, [base_url, page, filter.folder, search]);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);
  useEffect(() => { const iv = setInterval(fetchEmails, 30000); return ()=>clearInterval(iv); }, [fetchEmails]);

  /* ── Fetch Single ── */
  const fetchSingle = async (id) => {
    try {
      setLoading(true);
      const r = await fetch(`${base_url}/api/admin/emails/${id}`, { headers:aH() });
      const d = await r.json();
      if (d.success) {
        setSelected(d.data);
        setEmails(prev=>prev.map(e=>e._id===id?{...e,isRead:true}:e));
      } else { toast.error(d.message||'Error loading email'); }
    } catch { toast.error('Error loading email'); }
    finally { setLoading(false); }
  };

  /* ── Send Email ── */
  const sendEmail = async (e) => {
    e?.preventDefault();
    if (!compose.to||!compose.subject||!compose.message) { toast.error('Fill in To, Subject, and Message'); return; }
    try {
      setLoading(true);
      const r = await fetch(`${base_url}/api/admin/emails/send`, { method:'POST', headers:jH(), body:JSON.stringify({ to:compose.to, subject:compose.subject, message:compose.message, cc:compose.cc, bcc:compose.bcc }) });
      const d = await r.json();
      if (d.success) {
        toast.success('Email sent!');
        setShowCompose(false);
        setCompose({ to:'', subject:'', message:'', cc:'', bcc:'', showCc:false });
        fetchEmails();
      } else { toast.error(d.message||'Failed to send'); }
    } catch { toast.error('Error sending'); }
    finally { setLoading(false); }
  };

  /* ── Send Reply (panel) ── */
  const sendReply = async (e) => {
    e?.preventDefault();
    if (!compose.message||compose.message==='<p><br></p>') { toast.error('Enter a reply message'); return; }
    try {
      setLoading(true);
      const r = await fetch(`${base_url}/api/admin/emails/${replyTo._id}/reply`, { method:'POST', headers:jH(), body:JSON.stringify({ message:compose.message }) });
      const d = await r.json();
      if (d.success) {
        toast.success('Reply sent!');
        setShowReply(false); setReplyTo(null);
        setCompose({ to:'', subject:'', message:'', cc:'', bcc:'', showCc:false });
        fetchEmails();
        if (selected&&selected._id===replyTo._id) fetchSingle(selected._id);
      } else { toast.error(d.message||'Failed to send reply'); }
    } catch { toast.error('Error sending reply'); }
    finally { setLoading(false); }
  };

  /* ── Inline Reply ── */
  const sendInline = async (msg) => {
    if (!selected) return;
    try {
      setLoading(true);
      const r = await fetch(`${base_url}/api/admin/emails/${selected._id}/reply`, { method:'POST', headers:jH(), body:JSON.stringify({ message:msg }) });
      const d = await r.json();
      if (d.success) { toast.success('Reply sent!'); fetchEmails(); fetchSingle(selected._id); }
      else { toast.error(d.message||'Failed'); }
    } catch { toast.error('Error sending reply'); }
    finally { setLoading(false); }
  };

  /* ── Other actions ── */
  const forward = async (email) => {
    const fwd = prompt('Forward to:'); if (!fwd) return;
    try {
      setLoading(true);
      const r = await fetch(`${base_url}/api/admin/emails/${email._id}/forward`, { method:'POST', headers:jH(), body:JSON.stringify({ to:fwd, includeOriginal:true }) });
      const d = await r.json();
      if (d.success) toast.success('Forwarded!'); else toast.error(d.message||'Failed');
    } catch { toast.error('Error'); } finally { setLoading(false); }
  };

  const del = async (email) => {
    if (!window.confirm('Delete this email?')) return;
    try {
      const r = await fetch(`${base_url}/api/admin/emails/${email._id}`, { method:'DELETE', headers:aH() });
      const d = await r.json();
      if (d.success) { toast.success('Deleted'); if (selected?._id===email._id) setSelected(null); fetchEmails(); }
      else toast.error(d.message||'Failed');
    } catch { toast.error('Error deleting'); }
  };

  const markRead = async (email, current) => {
    try {
      const r = await fetch(`${base_url}/api/admin/emails/${email._id}/read`, { method:'PUT', headers:jH(), body:JSON.stringify({ isRead:!current }) });
      const d = await r.json();
      if (d.success) {
        setEmails(prev=>prev.map(e=>e._id===email._id?{...e,isRead:!current}:e));
        if (selected?._id===email._id) setSelected(p=>({...p,isRead:!current}));
      }
    } catch {}
  };

  const toggleStar = async (email, e) => {
    e.stopPropagation();
    try {
      const ns = !email.isStarred;
      const r = await fetch(`${base_url}/api/admin/emails/${email._id}/star`, { method:'PUT', headers:jH(), body:JSON.stringify({ isStarred:ns }) });
      const d = await r.json();
      if (d.success) {
        setEmails(prev=>prev.map(e=>e._id===email._id?{...e,isStarred:ns}:e));
        if (selected?._id===email._id) setSelected(p=>({...p,isStarred:ns}));
      }
    } catch {}
  };

  const archive = async (email) => {
    try {
      const r = await fetch(`${base_url}/api/admin/emails/${email._id}/archive`, { method:'PUT', headers:aH() });
      const d = await r.json();
      if (d.success) { toast.success('Archived'); if (selected?._id===email._id) setSelected(null); fetchEmails(); }
    } catch { toast.error('Failed to archive'); }
  };

  const openReply = (email) => {
    setReplyTo(email);
    setCompose({ to:email.from, subject:email.subject?.startsWith('Re:')?email.subject:`Re: ${email.subject}`, message:'', cc:'', bcc:'', showCc:false });
    setShowReply(true); setShowCompose(false);
  };

  const unreadCount = emails.filter(e=>!e.isRead).length;

  const NAV = [
    { id:'inbox',   icon:<FiInbox size={14}/>,   label:'Inbox',   count:unreadCount },
    { id:'starred', icon:<FaStar size={12}/>,     label:'Starred', count:emails.filter(e=>e.isStarred).length },
    { id:'sent',    icon:<FiSend size={13}/>,     label:'Sent',    count:0 },
    { id:'archive', icon:<FaArchive size={12}/>,  label:'Archive', count:0 },
  ];

  /* ═══════════════════════════════════════════════════════ */
  return (
    <>
      <GlobalStyles />
      <section className="email-app min-h-screen" style={{ background:'var(--bg-base)', color:'var(--text-primary)' }}>

        <Header toggleSidebar={()=>setSidebarOpen(!sidebarOpen)} />

        <Toaster position="top-center" toastOptions={{
          style:{ background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border)', borderRadius:'14px', fontSize:'13px', boxShadow:'0 12px 40px rgba(0,0,0,.6)', fontFamily:"'DM Sans',sans-serif" },
          success:{ iconTheme:{ primary:'#5B6EF5', secondary:'var(--bg-card)' } },
        }} />

        <div className="flex pt-[10vh]">
          <Sidebar isOpen={sidebarOpen} />

          <main className={`transition-all duration-300 flex-1 overflow-hidden h-[90vh] flex ${sidebarOpen?'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]':'ml-0'}`}>

            {/* ══════════════ LEFT PANEL ══════════════ */}
            <div
              className="flex flex-col border-r overflow-hidden shrink-0 transition-all duration-300"
              style={{ width:selected?360:'100%', borderColor:'var(--border)', background:'var(--bg-base)' }}
            >
              {/* Top controls */}
              <div className="px-4 pt-5 pb-3 shrink-0 space-y-3">

                {/* Compose button */}
                <button
                  onClick={()=>{ setShowCompose(true); setShowReply(false); setSelected(null); setCompose({ to:'', subject:'', message:'', cc:'', bcc:'', showCc:false }); }}
                  className="bg-blue-500 w-full flex items-center gap-2 px-5 py-3 rounded-[5px] text-[13px] font-semibold text-white"
                  style={{ fontFamily:'Syne,sans-serif', letterSpacing:'.01em' }}
                >
                  <div style={{ width:20, height:20, borderRadius:7,display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <FaPencil size={13}/>
                  </div>
                  Compose
                  <span className="ml-auto mono" style={{ fontSize:10, color:'rgba(255,255,255,.4)', fontFamily:'JetBrains Mono,monospace' }}>⌘N</span>
                </button>

                {/* Search */}
                <div
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[5px] transition-all duration-200 `}
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}
                >
                  <FaSearch size={11} style={{ color:searchFocus?'var(--accent)':'text-gray-500', flexShrink:0, transition:'color .15s' }}/>
                  <input
                    type="text" value={search}
                    onChange={e=>{ setSearch(e.target.value); setPage(1); }}
                    onFocus={()=>setSearchFocus(true)} onBlur={()=>setSearchFocus(false)}
                    placeholder="Search mail…"
                    style={{ flex:1, background:'transparent', fontSize:13, color:'var(--text-primary)', outline:'none' }}
                    className=""
                  />
                  {search && (
                    <button onClick={()=>setSearch('')} style={{ color:'var(--text-faint)', transition:'color .12s' }} className="hover:text-white">
                      <FaTimes size={10}/>
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="px-3 mb-1 shrink-0">
                <Divider label="Folders" />
                <div className="space-y-0.5 mt-1">
                  {NAV.map(n => (
                    <button
                      key={n.id}
                      onClick={()=>{ setFilter(p=>({...p,folder:n.id})); setPage(1); }}
                      className={`nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[5px] cursor-pointer text-[13px] font-medium transition-all duration-150 ${filter.folder===n.id?'nav-active':''}`}
                      style={{ color: filter.folder===n.id ? 'var(--accent-2)' : 'var(--text-muted)' }}
                      onMouseEnter={e=>{ if(filter.folder!==n.id){ e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.color='var(--text-primary)'; } }}
                      onMouseLeave={e=>{ if(filter.folder!==n.id){ e.currentTarget.style.background=''; e.currentTarget.style.color='var(--text-muted)'; } }}
                    >
                      <span>{n.icon}</span>
                      <span className="flex-1 text-left">{n.label}</span>
                      {n.count>0 && (
                        <span className="badge" style={{ background:filter.folder===n.id?'var(--accent-dim)':'var(--bg-card)', color:filter.folder===n.id?'var(--accent-2)':'var(--text-faint)', border:`1px solid ${filter.folder===n.id?'rgba(91,110,245,.2)':'var(--border)'}` }}>
                          {n.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <Divider />
                <label className="flex items-center gap-3 px-3.5 py-2 cursor-pointer border-[1px] border-gray-800 rounded-[5px] group" style={{ transition:'all .14s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <div
                    onClick={()=>setFilter(p=>({...p,unreadOnly:!p.unreadOnly}))}
                    className="flex items-center justify-center transition-all"
                    style={{ width:15, height:15, borderRadius:5, background:filter.unreadOnly?'var(--accent)':'transparent', border:`1.5px solid ${filter.unreadOnly?'var(--accent)':'var(--text-faint)'}` }}
                  >
                    {filter.unreadOnly && <FaCheck size={8} color="#fff"/>}
                  </div>
                  <span style={{ fontSize:12, color:'var(--text-muted)', transition:'color .14s' }} className="group-hover:text-[var(--text-secondary)]">
                    Unread only
                  </span>
                </label>
              </div>

              {/* Message count */}
              <div className="flex items-center gap-3 px-5 py-1.5 shrink-0">
                <div style={{ flex:1, height:1, background:'var(--border-soft)' }} />
                <span style={{ fontSize:9, fontWeight:700, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'1.5px', fontFamily:'JetBrains Mono,monospace' }}>
                  {totalEmails} messages
                </span>
                <div style={{ flex:1, height:1, background:'var(--border-soft)' }} />
              </div>

              {/* Email list */}
              <div className="flex-1 overflow-y-auto">
                {loading && emails.length===0 ? (
                  <Skeleton/>
                ) : emails.length===0 ? (
                  <div className="flex flex-col items-center justify-center py-24 px-6 anim-fade">
                    <div style={{ width:72, height:72, borderRadius:24, background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                      <FiInbox size={28} style={{ color:'var(--text-faint)' }}/>
                    </div>
                    <p style={{ fontSize:14, fontWeight:600, color:'var(--text-muted)', fontFamily:'Syne,sans-serif' }}>{search?'No results':'All clear!'}</p>
                    <p style={{ fontSize:12, color:'var(--text-faint)', marginTop:4 }}>{search?'Try different keywords':'Your inbox is empty'}</p>
                  </div>
                ) : (
                  <>
                    {emails.map((email,i) => {
                      if (filter.unreadOnly && email.isRead) return null;
                      return (
                        <div
                          key={email._id}
                          onClick={()=>fetchSingle(email._id)}
                          className={`erow relative flex items-start gap-3 px-5 py-4 cursor-pointer ${selected?._id===email._id?'erow-sel':''}`}
                          style={{ animationDelay:`${i*16}ms`, background: selected?._id===email._id ? 'var(--bg-active)' : !email.isRead ? 'var(--bg-elevated)' : 'transparent' }}
                        >
                          <Avatar name={email.fromName||email.from||'?'} size={38} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p style={{ fontSize:12.5, fontWeight:email.isRead?500:700, color:email.isRead?'var(--text-muted)':'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:email.isRead?'inherit':'Syne,sans-serif' }}>
                                {email.fromName||email.from?.split('<')[0].trim()||email.from}
                              </p>
                              <span style={{ fontSize:9.5, color:email.isRead?'var(--text-faint)':'var(--accent)', fontWeight:600, flexShrink:0, marginLeft:8, fontFamily:'JetBrains Mono,monospace' }}>
                                {fmtDate(email.receivedAt||email.createdAt)}
                              </span>
                            </div>
                            <p style={{ fontSize:12, fontWeight:email.isRead?400:600, color:email.isRead?'var(--text-faint)':'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 }}>
                              {email.subject||'(No Subject)'}
                            </p>
                            <p style={{ fontSize:11, color:'var(--text-faint)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {email.preview||email.bodyText?.substring(0,70)||'—'}
                            </p>
                          </div>
                          {/* Side indicators */}
                          <div className="flex flex-col items-center gap-2 shrink-0 ml-1 pt-1">
                            {!email.isRead && <div className="unread-dot"/>}
                            <div className="erow-actions flex flex-col gap-2">
                              <button onClick={e=>toggleStar(email,e)} style={{ color:email.isStarred?'#F59E0B':'var(--text-faint)', transition:'color .12s' }}>
                                {email.isStarred?<FaStar size={11}/>:<FaRegStar size={11}/>}
                              </button>
                              <button onClick={e=>{e.stopPropagation();markRead(email,email.isRead);}} style={{ color:'var(--text-faint)', transition:'color .12s' }} className="hover:!text-[var(--accent-2)]">
                                {email.isRead?<MdMarkEmailUnread size={13}/>:<MdMarkEmailRead size={13}/>}
                              </button>
                              <button onClick={e=>{e.stopPropagation();archive(email);}} style={{ color:'var(--text-faint)', transition:'color .12s' }} className="hover:!text-[#ECC94B]">
                                <FaArchive size={10}/>
                              </button>
                              <button onClick={e=>{e.stopPropagation();del(email);}} style={{ color:'var(--text-faint)', transition:'color .12s' }} className="hover:!text-[#f87171]">
                                <FaTrash size={10}/>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {totalPages>1 && (
                      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop:'1px solid var(--border-soft)', background:'var(--bg-base)' }}>
                        <span style={{ fontSize:10, color:'var(--text-faint)', fontFamily:'JetBrains Mono,monospace', fontWeight:600 }}>
                          {page} / {totalPages}
                        </span>
                        <div className="flex gap-1.5">
                          {[{lbl:'‹',fn:()=>setPage(p=>Math.max(p-1,1)),dis:page===1},{lbl:'›',fn:()=>setPage(p=>Math.min(p+1,totalPages)),dis:page===totalPages}].map(b=>(
                            <button key={b.lbl} onClick={b.fn} disabled={b.dis}
                              className="w-7 h-7 rounded-lg font-bold text-sm transition-all disabled:opacity-20"
                              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)' }}
                              onMouseEnter={e=>{if(!b.dis){e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent-2)';}}}
                              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)';}}>
                              {b.lbl}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ══════════════ RIGHT PANEL ══════════════ */}
            {selected ? (
              <div className="flex-1 flex flex-col overflow-hidden anim-right" style={{ background:'var(--bg-base)' }}>

                {/* Toolbar */}
                <div className="flex items-center gap-1 px-6 py-3 shrink-0" style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
                  <IBtn icon={<FaChevronLeft size={11}/>} tip="Back" onClick={()=>setSelected(null)} />
                  <div style={{ width:1, height:18, background:'var(--border)', margin:'0 4px' }}/>
                  <IBtn icon={<FaReply size={12}/>} tip="Reply" onClick={()=>openReply(selected)} />
                  <IBtn icon={<FaForward size={12}/>} tip="Forward" onClick={()=>forward(selected)} />
                  <IBtn icon={selected.isRead?<MdMarkEmailUnread size={14}/>:<MdMarkEmailRead size={14}/>} tip={selected.isRead?'Mark unread':'Mark read'} onClick={()=>markRead(selected,selected.isRead)} />
                  <IBtn icon={<FaArchive size={12}/>} tip="Archive" onClick={()=>archive(selected)} />
                  <div className="flex-1"/>
                  {selected.isStarred
                    ? <IBtn icon={<FaStar size={12}/>} tip="Unstar" onClick={e=>toggleStar(selected,e)} active />
                    : <IBtn icon={<FaRegStar size={12}/>} tip="Star" onClick={e=>toggleStar(selected,e)} />
                  }
                  <IBtn icon={<FaTrash size={12}/>} tip="Delete" danger onClick={()=>del(selected)} />
                  <IBtn icon={<FaEllipsisH size={13}/>} tip="More" />
                </div>

                {/* Email content */}
                <div className="flex-1 overflow-y-auto">
                  <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 40px 80px' }}>

                    {/* Subject */}
                    <h1 className="anim-up" style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-.5px', marginBottom:28, lineHeight:1.3, fontFamily:'Syne,sans-serif' }}>
                      {selected.subject||'(No Subject)'}
                    </h1>

                    {/* Sender card */}
                    <div className="glass anim-up d1 rounded-2xl p-5 mb-6">
                      <div className="flex items-start gap-4">
                        <Avatar name={selected.fromName||selected.from||'?'} size={46} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <p style={{ fontSize:14.5, fontWeight:700, color:'var(--text-primary)', fontFamily:'Syne,sans-serif', lineHeight:1.3, marginBottom:3 }}>
                                {selected.fromName||selected.from?.split('<')[0].trim()}
                              </p>
                              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{selected.from}</p>
                            </div>
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              <p style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'JetBrains Mono,monospace' }}>
                                {moment(selected.receivedAt||selected.createdAt).format('MMM D, YYYY · h:mm A')}
                              </p>
                              {selected.hasAttachments && (
                                <p className="flex items-center gap-1.5 justify-end" style={{ fontSize:11, color:'var(--text-faint)', marginTop:4 }}>
                                  <FaPaperclip size={9}/>{selected.attachments?.length} attachment{selected.attachments?.length!==1?'s':''}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="email-body anim-up d2 rounded-2xl p-7 mb-6" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
                      {selected.body
                        ? <div dangerouslySetInnerHTML={{ __html:selected.body }}/>
                        : <p style={{ whiteSpace:'pre-wrap', lineHeight:1.85 }}>{selected.bodyText||'No content'}</p>
                      }
                    </div>

                    {/* Replies */}
                    {selected.replies?.length>0 && <ReplyThread replies={selected.replies}/>}

                    {/* Attachments */}
                    {selected.attachments?.length>0 && (
                      <div className="glass anim-up d3 rounded-2xl p-5 mb-6">
                        <p style={{ fontSize:9, fontWeight:700, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:14, fontFamily:'JetBrains Mono,monospace' }}>
                          Attachments · {selected.attachments.length}
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {selected.attachments.map((a,i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                              style={{ background:'var(--bg-hover)', border:'1px solid var(--border)' }}
                              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(91,110,245,.3)'; e.currentTarget.style.background='var(--bg-active)'; }}
                              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-hover)'; }}
                            >
                              <div style={{ width:30, height:30, borderRadius:9, background:'var(--accent-dim)', border:'1px solid rgba(91,110,245,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <FaPaperclip size={12} style={{ color:'var(--accent-2)' }}/>
                              </div>
                              <div>
                                <p style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)', lineHeight:1.2 }}>{a.filename}</p>
                                <p style={{ fontSize:10, color:'var(--text-faint)', marginTop:2, fontFamily:'JetBrains Mono,monospace' }}>{(a.size/1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inline reply */}
                    <InlineReply email={selected} onSend={sendInline} loading={loading}/>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="hidden lg:flex flex-1 flex-col items-center justify-center" style={{ background:'var(--bg-base)' }}>
                {/* Decorative rings */}
                <div style={{ position:'relative', width:120, height:120, marginBottom:28 }}>
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid var(--border-soft)', transform:'scale(1.6)' }}/>
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid var(--border-soft)', transform:'scale(1.3)' }}/>
                  <div style={{ width:120, height:120, borderRadius:'50%', background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                    <FiMail size={42} style={{ color:'var(--text-faint)' }}/>
                  </div>
                </div>
                <p style={{ fontSize:16, fontWeight:700, color:'var(--text-muted)', fontFamily:'Syne,sans-serif', marginBottom:6 }}>Select an email</p>
                <p style={{ fontSize:13, color:'var(--text-faint)' }}>Choose a message from your inbox</p>
              </div>
            )}
          </main>
        </div>

        {/* ── Compose Panel ── */}
        {showCompose && (
          <FloatPanel
            title="New Message" subtitle="Compose email" accent="#5B6EF5"
            onClose={()=>setShowCompose(false)} onSubmit={sendEmail} loading={loading}
            quillValue={compose.message} onQuillChange={v=>setCompose(p=>({...p,message:v}))}
            fields={
              <>
                <FRow label="To">
                  <FInput type="email" value={compose.to} placeholder="recipient@example.com" onChange={e=>setCompose(p=>({...p,to:e.target.value}))}/>
                  {!compose.showCc && (
                    <button onClick={()=>setCompose(p=>({...p,showCc:true}))}
                      style={{ fontSize:11, color:'var(--text-faint)', flexShrink:0, transition:'color .12s' }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--accent-2)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text-faint)'}>
                      Cc/Bcc
                    </button>
                  )}
                </FRow>
                {compose.showCc && (
                  <>
                    <FRow label="Cc"><FInput value={compose.cc} placeholder="cc@example.com" onChange={e=>setCompose(p=>({...p,cc:e.target.value}))}/></FRow>
                    <FRow label="Bcc"><FInput value={compose.bcc} placeholder="bcc@example.com" onChange={e=>setCompose(p=>({...p,bcc:e.target.value}))}/></FRow>
                  </>
                )}
                <FRow label="Sub"><FInput value={compose.subject} placeholder="Subject line…" onChange={e=>setCompose(p=>({...p,subject:e.target.value}))}/></FRow>
                <div style={{ height:1, background:'var(--border-soft)' }}/>
              </>
            }
          />
        )}

        {/* ── Reply Panel ── */}
        {showReply && replyTo && (
          <FloatPanel
            isReply title={`Re: ${replyTo.subject}`} subtitle={`to ${replyTo.from}`} accent="#7C8FF7"
            onClose={()=>{ setShowReply(false); setReplyTo(null); }} onSubmit={sendReply} loading={loading}
            quillValue={compose.message} onQuillChange={v=>setCompose(p=>({...p,message:v}))}
            fields={
              <>
                <FRow label="To">
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <span className="chip"><Avatar name={replyTo.from||'?'} size={14}/>{replyTo.from?.split('<')[0].trim()}</span>
                  </div>
                </FRow>
                <FRow label="Sub"><FInput value={compose.subject} readOnly/></FRow>
                <div style={{ margin:'4px 20px 10px', paddingLeft:14, borderLeft:'2px solid var(--bg-active)' }}>
                  <p style={{ fontSize:11, color:'var(--text-faint)', marginBottom:3, fontFamily:'JetBrains Mono,monospace' }}>
                    {moment(replyTo.receivedAt||replyTo.createdAt).format('MMM D [at] h:mm A')} · {replyTo.from}
                  </p>
                  <p style={{ fontSize:12, color:'var(--text-muted)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {replyTo.bodyText?.substring(0,120)||'—'}
                  </p>
                </div>
                <div style={{ height:1, background:'var(--border-soft)' }}/>
              </>
            }
          />
        )}
      </section>
    </>
  );
};

export default BusinessEmail;
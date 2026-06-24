import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase";

const BARCOS = ["Golondrina de Mar", "Atlantic Dama"];
const ESTADOS = {
  pendiente: { label: "Pendiente", short: "PE", color: "b-amber" },
  en_proceso: { label: "En proceso", short: "PR", color: "b-blue" },
  cumplido: { label: "Cumplido", short: "C", color: "b-green" },
  parcial: { label: "Parcial", short: "PA", color: "b-purple" },
  anulado: { label: "Anulado", short: "A", color: "b-gray" },
};
const TIPO_REALIZACION = ["Taller externo", "Personal propio", "JDM", "Capitán", "Otro"];
const AREAS = ["Cubierta", "Máquinas"];
const TIPOS_REPARACION = ["Correctiva", "Preventiva"];
const ERP_URL = "https://erp-portal-fawn.vercel.app";
const SUPABASE_URL = "https://mwrhonkvcyyueixbdrat.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cmhvbmt2Y3l5dWVpeGJkcmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTQ1NTMsImV4cCI6MjA5MjU3MDU1M30.LGtCgh7vedh16DATQtJMLBmfhzLwlj21sXsV43001IM";

const BARCO_POR_EMAIL = {
  "golondrinademar@paranalogistica.com.ar": "Golondrina de Mar",
  "atlanticdama@paranalogistica.com.ar": "Atlantic Dama",
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#213363;--blue:#235C96;--mid:#6381A7;--light:#A5B5CC;
  --bg:#F0F4F8;--surface:#FFF;--surface2:#F5F7FA;--border:#D6E0ED;
  --text:#213363;--muted:#6381A7;--muted2:#8FA3BC;--accent:#235C96;
  --accent2:#1E7A4A;
  --warn:#B07D0A;--danger:#C0392B;--purple:#6B4FA0;
  --sans:'Montserrat',sans-serif;--mono:'DM Mono',monospace;--r:6px;--r2:10px;
}

/* [DS-10.5][DS-11.7] Overflow guards obligatorios */
body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:14px;line-height:1.5;min-height:100vh;overflow-x:hidden}
.app{display:flex;min-height:100vh;overflow-x:hidden}

/* ── SIDEBAR [DS-3.2] ── */
.sidebar{width:235px;min-width:235px;background:var(--navy);display:flex;flex-direction:column;box-shadow:2px 0 8px rgba(33,51,99,.15)}
.sidebar-header{border-bottom:1px solid rgba(255,255,255,.1)}
.sidebar-logo-wrap{padding:20px 18px 16px;display:flex;align-items:center;gap:12px}
/* [DS-3.2] logo circular 36×36px con border 2px white 20% */
.sidebar-logo{width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:50%;border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px}
.sidebar-logo-img{width:36px;height:36px;object-fit:cover;border-radius:50%;border:2px solid rgba(255,255,255,.2)}
.sidebar-logo-main{font-size:13px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase}
.sidebar-logo-sub{font-size:9px;color:rgba(255,255,255,.5);letter-spacing:.5px}
.nav-section{padding:12px 18px 4px;font-family:var(--mono);font-size:9px;letter-spacing:2px;color:rgba(255,255,255,.35);text-transform:uppercase}
.ni{display:flex;align-items:center;gap:9px;padding:7px 18px;font-size:12px;font-weight:500;cursor:pointer;color:rgba(255,255,255,.6);border-left:3px solid transparent;transition:all .12s;user-select:none}
.ni:hover{color:#fff;background:rgba(255,255,255,.06)}
.ni.active{color:#fff;border-left-color:var(--light);background:rgba(255,255,255,.1);font-weight:600}
.ni.nueva{background:rgba(35,92,150,.4);color:#fff;border-left-color:#7EB8E8}
.ni.nueva:hover{background:rgba(35,92,150,.6)}
.ni.erp{color:rgba(255,255,255,.4)}.ni.erp:hover{color:rgba(255,255,255,.7)}
.ni-icon{font-size:13px;width:16px;text-align:center;flex-shrink:0}

/* ── MAIN [DS-3.3][DS-3.4] ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:13px 28px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(33,51,99,.06)}
.topbar-title{font-size:12px;font-weight:600;letter-spacing:1px;color:var(--navy);text-transform:uppercase}
/* [DS-10.5] overflow-x:hidden en .content */
.content{flex:1;overflow-y:auto;overflow-x:hidden;padding:24px 28px;background:var(--bg)}

/* ── CARDS [DS-3.5] ── */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:20px;margin-bottom:16px;box-shadow:0 1px 4px rgba(33,51,99,.06)}
.card-title{font-size:10px;font-weight:600;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}

/* ── BADGES [DS-4.4][DS-1.6] ── */
.badge{display:inline-flex;align-items:center;font-family:var(--mono);font-size:9px;font-weight:600;padding:3px 8px;border-radius:4px;white-space:nowrap;letter-spacing:.3px}
.b-amber{background:#FEF3C7;color:#92400E;border:1px solid #FDE68A}
.b-blue{background:#DBEAFE;color:#1E40AF;border:1px solid #BFDBFE}
.b-green{background:#D1FAE5;color:#065F46;border:1px solid #A7F3D0}
.b-purple{background:#EDE9FE;color:#4C1D95;border:1px solid #DDD6FE}
.b-gray{background:#F3F4F6;color:#6B7280;border:1px solid #E5E7EB}
.b-red{background:#FEE2E2;color:#991B1B;border:1px solid #FECACA}
.b-teal{background:#CCFBF1;color:#0F766E;border:1px solid #99F6E4}
.b-orange{background:#FFEDD5;color:#9A3412;border:1px solid #FED7AA}

/* ── BOTONES [DS-4.1] ── */
.btn{display:inline-flex;align-items:center;gap:6px;font-family:var(--sans);font-size:11px;font-weight:600;letter-spacing:.3px;padding:7px 14px;border-radius:var(--r);border:1px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;text-transform:uppercase}
.btn-primary{background:var(--blue);color:#fff}.btn-primary:hover{background:var(--navy)}
.btn-success{background:var(--accent2);color:#fff;border-color:var(--accent2)}.btn-success:hover{background:#145E37}
.btn-ghost{background:transparent;color:var(--muted);border-color:var(--border)}.btn-ghost:hover{color:var(--text);background:var(--surface2)}
.btn-danger{background:transparent;color:var(--danger);border-color:var(--danger)}.btn-danger:hover{background:#FEE2E2}
.btn-sm{padding:4px 10px;font-size:10px}
.btn:disabled{opacity:.4;cursor:not-allowed}

/* ── MODALES [DS-4.6] ── */
.overlay{position:fixed;inset:0;background:rgba(33,51,99,.5);display:flex;align-items:flex-start;justify-content:center;z-index:100;padding:20px;overflow-y:auto;animation:fadeIn .15s}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:800px;margin:auto;animation:slideUp .2s;box-shadow:0 8px 32px rgba(33,51,99,.18)}
.modal-xl{max-width:1000px}
.modal-xxl{max-width:1100px}
.mhdr{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 22px;border-bottom:1px solid var(--border);background:var(--surface2);border-radius:12px 12px 0 0}
.mtitle{font-size:13px;font-weight:700;letter-spacing:.5px;color:var(--navy)}
.mbody{padding:22px}
.mftr{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:var(--surface2);border-radius:0 0 12px 12px}
.mclose{background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer}
.mclose:hover{color:var(--navy)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

/* ── FORMULARIOS [DS-4.2] ── */
.fg{display:flex;flex-direction:column;gap:5px}
.fg label{font-size:10px;color:var(--navy);letter-spacing:.5px;text-transform:uppercase;font-weight:600}
.fg input,.fg select,.fg textarea{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;padding:8px 10px;outline:none;transition:border-color .15s}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--blue)}
.fg textarea{resize:vertical;min-height:60px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px}
.form-grid-4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;margin-bottom:14px}
.form-section{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--blue);text-transform:uppercase;margin:18px 0 12px;padding-bottom:6px;border-bottom:2px solid var(--light)}

/* ── TOGGLE GROUP (componente propio) ── */
.toggle-group{display:flex;gap:8px}
.toggle-btn{flex:1;padding:8px 12px;border-radius:var(--r);border:2px solid var(--border);background:var(--surface);color:var(--muted);font-family:var(--sans);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-align:center;text-transform:uppercase;letter-spacing:.5px}
.toggle-btn.selected{border-color:var(--blue);background:var(--blue);color:#fff}
.toggle-btn.selected.cubierta{border-color:#0E7490;background:#0E7490}
.toggle-btn.selected.maquinas{border-color:#6B4FA0;background:#6B4FA0}
.toggle-btn.selected.correctiva{border-color:#C0392B;background:#C0392B}
.toggle-btn.selected.preventiva{border-color:#1E7A4A;background:#1E7A4A}

/* ── STATS [DS-11.3] ── */
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:18px}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px;box-shadow:0 1px 4px rgba(33,51,99,.06)}
.stat-label{font-size:10px;color:var(--muted);font-weight:600;letter-spacing:.5px;margin-bottom:6px;text-transform:uppercase}
/* [DS-11.3] stat-value 28px desktop */
.stat-value{font-family:var(--mono);font-size:28px;font-weight:700}

/* ── FILTROS [DS-4.8] ── */
.filter-row{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center}
.filter-select{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:11px;padding:6px 10px;outline:none;cursor:pointer}
.filter-input{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:11px;padding:6px 10px;outline:none;min-width:200px}

/* ── SSRR CARD (componente propio) ── */
.ssrr-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);margin-bottom:12px;overflow:hidden;box-shadow:0 1px 4px rgba(33,51,99,.05)}
.ssrr-hdr{padding:12px 16px;border-bottom:1px solid var(--border);background:var(--surface2);display:flex;align-items:center;justify-content:space-between}
.ssrr-hdr-main{flex:1;cursor:pointer;min-width:0}
.ssrr-hdr-main:hover .ssrr-num{color:var(--blue);text-decoration:underline}
.ssrr-expand{padding:4px 8px;background:none;border:none;cursor:pointer;color:var(--muted);font-size:14px;flex-shrink:0;border-radius:4px}
.ssrr-expand:hover{background:var(--border);color:var(--navy)}
.ssrr-num{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--navy);transition:color .15s}
.ssrr-meta{font-size:11px;color:var(--muted);margin-top:2px}

/* ── TABLA DE ITEMS ── */
.items-table{width:100%;border-collapse:collapse}
.items-table th{font-size:9px;font-weight:600;letter-spacing:.5px;color:var(--muted);text-transform:uppercase;padding:8px 12px;text-align:left;border-bottom:1px solid var(--border);background:var(--surface2);white-space:nowrap}
.items-table td{padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;font-size:11px}
.items-table tr:last-child td{border-bottom:none}
.items-table tr:hover td{background:var(--surface2)}
.item-num-cell{font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap}
.item-desc-cell{font-size:12px;color:var(--text);max-width:240px}
.item-obs-cell{font-size:10px;color:var(--muted);max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.item-remito{font-family:var(--mono);font-size:10px;color:var(--blue);font-weight:600}

/* ── ITEM CARD (vista mobile/modal) ── */
.item-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;margin-bottom:10px;transition:all .15s}
.item-card-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}
.item-card-num{font-family:var(--mono);font-size:10px;color:var(--muted);font-weight:600;flex-shrink:0}
.item-card-desc{font-size:13px;color:var(--text);font-weight:500;flex:1;min-width:0}
/* [DS-10.2] acciones al nivel 4, separadas de la info */
.item-card-actions{display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap}
.item-card-body{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.item-card-field{display:flex;flex-direction:column;gap:2px}
.item-card-label{font-size:9px;font-weight:700;letter-spacing:.5px;color:var(--muted2);text-transform:uppercase}
.item-card-value{font-size:11px;color:var(--text)}

/* ── BOTONES ESPECIALIZADOS (propios del módulo) ── */
.clip-btn{background:none;border:1px solid var(--border);border-radius:var(--r);padding:4px 8px;cursor:pointer;color:var(--muted);font-size:14px;transition:all .15s;display:inline-flex;align-items:center;gap:4px}
.clip-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--surface)}
.clip-btn.has-file{border-color:var(--accent2);color:var(--accent2)}
.cumplir-btn{background:none;border:2px solid var(--accent2);border-radius:var(--r);padding:4px 10px;cursor:pointer;color:var(--accent2);font-size:10px;font-weight:700;font-family:var(--sans);text-transform:uppercase;letter-spacing:.5px;transition:all .15s}
.cumplir-btn:hover{background:var(--accent2);color:#fff}
.cumplir-btn:disabled{opacity:.4;cursor:not-allowed}
.adjunto-link{font-size:10px;color:var(--blue);text-decoration:none;font-family:var(--mono);display:inline-flex;align-items:center;gap:3px}
.adjunto-link:hover{text-decoration:underline}

/* ── DETAIL GRID (modal detalle) ── */
.detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px}
.detail-field{display:flex;flex-direction:column;gap:3px}
.detail-label{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase}
.detail-value{font-size:13px;color:var(--text);font-weight:500}

/* ── NOTIFICACIONES [DS-4.5] ── */
.notif{position:fixed;bottom:20px;right:20px;background:var(--surface);border:1px solid var(--border);border-left-width:3px;border-radius:var(--r2);padding:12px 16px;font-size:13px;animation:slideUp .2s;z-index:300;max-width:340px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 16px rgba(33,51,99,.15)}
.n-green{border-left-color:var(--accent2)}.n-red{border-left-color:var(--danger)}.n-amber{border-left-color:var(--warn)}.n-blue{border-left-color:var(--blue)}

/* ── INFO-BOXES [DS-4.9][DS-11.4] ── */
.info-box{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;font-size:12px}
.info-box.accent{border-left:3px solid var(--blue)}
.info-box.warn{border-left:3px solid var(--warn);background:#FFFBEB}
.info-box.danger{border-left:3px solid var(--danger);background:#FEF2F2}

/* ── ACTION CARDS [DS-10.4] ── */
.req-row-actions{display:flex;flex-direction:row;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);justify-content:flex-end}
.form-footer-actions{display:flex;gap:8px;align-items:center;justify-content:flex-end;border-top:1px solid var(--border);padding-top:14px;margin-top:16px}

/* ── UTILITARIOS [DS-6.3][DS-11.8] ── */
/* [DS-10.6] flex-gap con flex-wrap:wrap */
.flex-gap{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.flex-between{display:flex;justify-content:space-between;align-items:center}
.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}
.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}
.pb14{padding-bottom:14px}
.text-mono{font-family:var(--mono)}.text-muted{color:var(--muted)}
.empty-state{text-align:center;padding:48px 20px;color:var(--muted);font-size:13px}
.loading{display:flex;align-items:center;justify-content:center;padding:48px;color:var(--muted);gap:10px;font-size:13px}
.spin{animation:spin 1s linear infinite}

/* ── MOBILE NAV [DS-4.10] ── */
.mobile-nav{display:none}

/* ── RESPONSIVE [DS-5.1][DS-5.2] — breakpoint único 768px ── */
@media(max-width:768px){
  /* Layout */
  .app{flex-direction:column}
  .sidebar{display:none}
  .main{width:100%;padding-bottom:72px}
  .topbar{padding:10px 16px}
  .topbar-title{font-size:11px}
  .content{padding:14px 14px;overflow-x:hidden}
  .card{padding:14px;margin-bottom:12px}

  /* Grids a 1 columna [DS-5.2] */
  .form-grid{grid-template-columns:1fr;gap:10px}
  .form-grid-3{grid-template-columns:1fr;gap:10px}
  .form-grid-4{grid-template-columns:1fr 1fr;gap:10px}
  .detail-grid{grid-template-columns:1fr 1fr;gap:10px}
  .item-card-body{grid-template-columns:1fr}

  /* Stats 2 columnas [DS-11.3] */
  .stats{grid-template-columns:1fr 1fr;gap:8px}
  .stat{padding:12px}
  .stat-value{font-size:22px}

  /* Tablas con scroll interno [DS-5.2] */
  .items-table{min-width:600px}
  .ssrr-card .items-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}

  /* Filtros columna [DS-5.2] */
  .filter-row{flex-direction:column;align-items:stretch}
  .filter-input,.filter-select{min-width:unset;width:100%}
  .filter-row .btn{width:100%;justify-content:center}

  /* Modales bottom-sheet [DS-5.2][DS-4.6] */
  .overlay{padding:0;align-items:flex-end}
  .modal{border-radius:16px 16px 0 0;max-width:100%;max-height:92vh;overflow-y:auto}

  /* Modal footer columna + orden [DS-10.4] */
  .mftr{flex-direction:column;align-items:stretch;gap:6px}
  .mftr .btn{width:100%;justify-content:center;flex:unset;min-height:48px}
  .mftr .btn-success{order:-3}
  .mftr .btn-primary{order:-2}
  .mftr .btn-danger{order:-1}

  /* Action cards columna [DS-10.4] */
  .req-row-actions{flex-direction:column;width:100%}
  .req-row-actions .btn{width:100%;justify-content:center;min-height:48px}
  .form-footer-actions{flex-direction:column;align-items:stretch}
  .form-footer-actions .btn{width:100%;justify-content:center;min-height:48px}
  .form-footer-actions .btn-primary{order:-2}
  .form-footer-actions .btn-success{order:-3}

  /* Item card actions en mobile */
  .item-card-actions{width:100%;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)}
  .cumplir-btn{width:100%;justify-content:center;text-align:center;padding:10px}
  .item-card-header{flex-wrap:wrap}

  /* Toggle group en mobile */
  .toggle-group{flex-direction:column}
  .toggle-btn{padding:10px 12px}

  /* Tap targets mínimos [DS-11.10] */
  .btn{min-height:44px}
  .btn-sm{min-height:36px}
  .fg input,.fg select{min-height:44px}
  .cumplir-btn{min-height:44px}
  .clip-btn{min-height:44px;padding:8px 12px}

  /* Notif encima del bottom-nav [DS-5.2] */
  .notif{bottom:80px;right:10px;left:10px;max-width:unset}

  /* Mobile Nav visible [DS-4.10] */
  .mobile-nav{
    display:flex;
    position:fixed;bottom:0;left:0;right:0;
    background:var(--navy);
    border-top:1px solid rgba(255,255,255,.1);
    z-index:50;height:64px;
    justify-content:space-around;align-items:center;
    padding:0 8px;
    box-shadow:0 -2px 12px rgba(33,51,99,.2);
  }
  .mn-item{
    display:flex;flex-direction:column;align-items:center;gap:3px;
    cursor:pointer;padding:6px 8px;border-radius:8px;
    color:rgba(255,255,255,.5);transition:all .15s;flex:1;
    min-height:44px;justify-content:center;
    background:none;border:none;font-family:var(--sans);
  }
  .mn-item.active{color:#fff;background:rgba(255,255,255,.1)}
  .mn-item:hover{color:#fff}
  .mn-icon{font-size:18px;line-height:1}
  .mn-label{font-size:9px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;font-family:var(--mono)}
}

/* Desktop: mobile-nav oculto [DS-5.3] */
@media(min-width:769px){
  .mobile-nav{display:none !important}
}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d + "T00:00:00").toLocaleDateString("es-AR") : "—";
const today = () => new Date().toISOString().split("T")[0];

const ordenarSolicitudes = (sols) => {
  return [...sols].sort((a, b) => {
    const parseNum = (n) => {
      const parts = (n || "0/0").split("/");
      return { num: parseInt(parts[0]) || 0, anio: parseInt(parts[1]) || 0 };
    };
    const pa = parseNum(a.numero);
    const pb = parseNum(b.numero);
    if (pa.anio !== pb.anio) return pb.anio - pa.anio;
    return pb.num - pa.num;
  });
};

// ─── API ─────────────────────────────────────────────────────────────────────
const api = {
  async getSolicitudes(barco) {
    let q = supabase.from("ssrr_solicitudes").select("*, ssrr_items(*)");
    if (barco) q = q.eq("barco", barco);
    const { data, error } = await q;
    if (error) throw error;
    return ordenarSolicitudes(data || []);
  },
  async crearSolicitud(sol) {
    const { data, error } = await supabase.from("ssrr_solicitudes").insert([sol]).select().single();
    if (error) throw error;
    return data;
  },
  async crearItems(items) {
    const { error } = await supabase.from("ssrr_items").insert(items);
    if (error) throw error;
  },
  async actualizarItem(id, cambios) {
    const { error } = await supabase.from("ssrr_items").update({ ...cambios, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  async eliminarItem(id) {
    const { error } = await supabase.from("ssrr_items").delete().eq("id", id);
    if (error) throw error;
  },
  async eliminarSolicitud(id) {
    const { error: e1 } = await supabase.from("ssrr_items").delete().eq("solicitud_id", id);
    if (e1) throw e1;
    const { error: e2 } = await supabase.from("ssrr_solicitudes").delete().eq("id", id);
    if (e2) throw e2;
  },
  async subirAdjunto(itemId, file) {
    const ext = file.name.split(".").pop();
    const path = `${itemId}_${Date.now()}.${ext}`;
    const { error: upError } = await supabase.storage.from("remitos").upload(path, file, { upsert: true });
    if (upError) throw upError;
    const { data } = supabase.storage.from("remitos").getPublicUrl(path);
    return data.publicUrl;
  },
  async enviarNotificacion(payload) {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/enviar_notificacion_SSRR`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "apikey": SUPABASE_ANON_KEY },
        body: JSON.stringify(payload),
      });
    } catch (e) { console.error("Error enviando notificación:", e); }
  },
};

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────
function Notif({ msg, onClose }) {
  if (!msg) return null;
  const cls = { success: "n-green", error: "n-red", warn: "n-amber", info: "n-blue" }[msg.type] || "n-blue";
  return <div className={`notif ${cls}`}><span>{msg.text}</span><button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>✕</button></div>;
}

function FG({ label, hint, children, full }) {
  return <div className="fg" style={full ? { gridColumn: "1/-1" } : {}}>
    {label && <label>{label}</label>}
    {children}
    {hint && <div style={{ fontSize: 10, color: "var(--muted2)", marginTop: 2 }}>{hint}</div>}
  </div>;
}

function ToggleGroup({ label, options, value, onChange, colorClass }) {
  return (
    <div className="fg">
      {label && <label>{label}</label>}
      <div className="toggle-group">
        {options.map(opt => (
          <button key={opt} className={`toggle-btn ${value === opt ? `selected ${colorClass?.[opt] || ""}` : ""}`} onClick={() => onChange(opt)} type="button">{opt}</button>
        ))}
      </div>
    </div>
  );
}

function BadgeEstado({ estado }) {
  const e = ESTADOS[estado] || { label: estado, color: "b-gray" };
  return <span className={`badge ${e.color}`}>{e.label}</span>;
}
function BadgeArea({ area }) {
  if (!area) return null;
  return <span className={`badge ${area === "Cubierta" ? "b-teal" : "b-purple"}`}>{area}</span>;
}
function BadgeTipoRep({ tipo }) {
  if (!tipo) return null;
  return <span className={`badge ${tipo === "Correctiva" ? "b-red" : "b-green"}`}>{tipo}</span>;
}

// ─── MODAL: CUMPLIR ───────────────────────────────────────────────────────────
function ModalCumplir({ item, onClose, onSave, notify }) {
  const [form, setForm] = useState({ realizado_por: "", fecha_realizacion: today(), nro_remito: "" });
  const [archivo, setArchivo] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.realizado_por.trim()) return alert("Ingresá quién realizó el trabajo");
    setSaving(true);
    try {
      let adjunto_url = item.adjunto_url || null;
      if (archivo) adjunto_url = await api.subirAdjunto(item.id, archivo);
      await api.actualizarItem(item.id, {
        estado: "cumplido",
        realizado_por: form.realizado_por,
        fecha_realizacion: form.fecha_realizacion || null,
        nro_remito: form.nro_remito || null,
        adjunto_url,
      });
      notify("Ítem marcado como cumplido", "success");
      onSave();
    } catch (err) { alert("Error: " + err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 200 }}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="mhdr">
          <div>
            <div className="mtitle">Marcar como Cumplido</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{item.numero_item} — {item.descripcion}</div>
          </div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fg mb12">
            <label>Realizado por *</label>
            <input value={form.realizado_por} onChange={e => set("realizado_por", e.target.value)} placeholder="Nombre / Empresa que realizó el trabajo" autoFocus />
          </div>
          <div className="form-grid">
            <div className="fg">
              <label>Fecha de realización</label>
              <input type="date" value={form.fecha_realizacion} onChange={e => set("fecha_realizacion", e.target.value)} />
            </div>
            <div className="fg">
              <label>N° de Remito</label>
              <input value={form.nro_remito} onChange={e => set("nro_remito", e.target.value)} placeholder="Ej: 1-16190" />
            </div>
          </div>
          <div className="fg">
            <label>Adjunto (remito, foto, etc.)</label>
            <div className="flex-gap">
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()} type="button">
                📎 {archivo ? archivo.name : "Seleccionar archivo"}
              </button>
              {archivo && <button onClick={() => setArchivo(null)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 14 }}>✕</button>}
            </div>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setArchivo(e.target.files[0] || null)} />
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-success" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "✓ Confirmar cumplimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ITEM ACCIONES (barco) ─────────────────────────────────────────────────────
function ItemAccionesBarco({ item, onUpdated, onEliminar, notify }) {
  const [modalCumplir, setModalCumplir] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await api.subirAdjunto(item.id, file);
      await api.actualizarItem(item.id, { adjunto_url: url });
      notify("Archivo adjunto subido correctamente", "success");
      onUpdated();
    } catch (err) { alert("Error al subir archivo: " + err.message); }
    finally { setLoading(false); fileRef.current.value = ""; }
  };

  const handleEliminar = async (e) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el ítem ${item.numero_item}?\n\n"${item.descripcion}"\n\nEsta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      await api.eliminarItem(item.id);
      notify("Ítem eliminado", "warn");
      onEliminar();
    } catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="item-card-actions" onClick={e => e.stopPropagation()}>
      {item.estado !== "cumplido" && (
        <button className="cumplir-btn" onClick={() => setModalCumplir(true)} disabled={loading} title="Marcar como cumplido">
          ✓ Cumplido
        </button>
      )}
      <button className={`clip-btn ${item.adjunto_url ? "has-file" : ""}`} onClick={() => fileRef.current.click()} disabled={loading} title={item.adjunto_url ? "Reemplazar adjunto" : "Subir adjunto"}>
        📎
      </button>
      <button className="clip-btn" onClick={handleEliminar} disabled={loading} title="Eliminar ítem" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
        🗑
      </button>
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
      {modalCumplir && (
        <ModalCumplir item={item} notify={notify} onClose={() => setModalCumplir(false)}
          onSave={() => { setModalCumplir(false); onUpdated(); }} />
      )}
    </div>
  );
}

// ─── MODAL: ITEM ──────────────────────────────────────────────────────────────
function ItemModal({ item, onClose, onSave, esBarco }) {
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.actualizarItem(item.id, form); onSave(); }
    catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mhdr">
          <div><div className="mtitle">Ítem {item.numero_item}</div></div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="form-grid mb12">
            <FG label="Descripción" full>
              <input value={form.descripcion || ""} readOnly style={{ background: "var(--surface2)", color: "var(--text)", fontWeight: 500 }} />
            </FG>
          </div>
          <div className="form-grid">
            <ToggleGroup label="Tipo de reparación" options={TIPOS_REPARACION} value={form.tipo_reparacion || ""} onChange={v => set("tipo_reparacion", v)} colorClass={{ Correctiva: "correctiva", Preventiva: "preventiva" }} />
            <FG label="Estado *">
              {esBarco ? (
                <input value={ESTADOS[form.estado]?.label || form.estado} readOnly style={{ background: "var(--surface2)" }} />
              ) : (
                <select value={form.estado} onChange={e => set("estado", e.target.value)}>
                  {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              )}
            </FG>
            <FG label="Tipo de realización">
              <select value={form.tipo_realizacion || ""} onChange={e => set("tipo_realizacion", e.target.value)}>
                <option value="">—</option>
                {TIPO_REALIZACION.map(t => <option key={t}>{t}</option>)}
              </select>
            </FG>
            <FG label="Realizado por">
              <input value={form.realizado_por || ""} onChange={e => set("realizado_por", e.target.value)} placeholder="Nombre / Empresa" />
            </FG>
            <FG label="Fecha de realización">
              <input type="date" value={form.fecha_realizacion || ""} onChange={e => set("fecha_realizacion", e.target.value)} />
            </FG>
            <FG label="N° de Remito">
              <input value={form.nro_remito || ""} onChange={e => set("nro_remito", e.target.value)} placeholder="Ej: 1-16190" />
            </FG>
          </div>
          <FG label="Observaciones del Capitán/JDM" full>
            <textarea value={form.obs_capitan || ""} onChange={e => set("obs_capitan", e.target.value)} placeholder="Comentarios del embarcado..." />
          </FG>
          {!esBarco && (
            <FG label="Observaciones del Superintendente" full>
              <textarea value={form.obs_superintendente || ""} onChange={e => set("obs_superintendente", e.target.value)} placeholder="Comentarios del superintendente técnico..." />
            </FG>
          )}
          {item.adjunto_url && (
            <div className="mt12">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Adjunto</div>
              <a href={item.adjunto_url} target="_blank" rel="noreferrer" className="adjunto-link">📎 Ver archivo adjunto →</a>
            </div>
          )}
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: SOLICITUD DETALLE ─────────────────────────────────────────────────
function SolicitudModal({ sol, onClose, onItemSaved, esBarco, notify }) {
  const [itemModal, setItemModal] = useState(null);
  const [items, setItems] = useState(sol.ssrr_items || []);
  const pendientes = items.filter(it => it.estado === "pendiente").length;
  const enProceso = items.filter(it => it.estado === "en_proceso").length;
  const cumplidos = items.filter(it => it.estado === "cumplido").length;

  const handleItemUpdated = async () => {
    const { data } = await supabase.from("ssrr_items").select("*").eq("solicitud_id", sol.id);
    if (data) setItems(data);
    onItemSaved();
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xxl">
        <div className="mhdr">
          <div>
            <div className="flex-gap mb8">
              <div className="mtitle">SSRR N° {sol.numero}</div>
              {sol.area && <BadgeArea area={sol.area} />}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{sol.barco} · Emitida: {fmtDate(sol.fecha_emision)} · Por: {sol.emitido_por}</div>
          </div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="detail-grid">
            <div className="detail-field"><div className="detail-label">Barco</div><div className="detail-value">{sol.barco}</div></div>
            <div className="detail-field"><div className="detail-label">Área</div><div className="detail-value">{sol.area ? <BadgeArea area={sol.area} /> : "—"}</div></div>
            <div className="detail-field"><div className="detail-label">N° Solicitud</div><div className="detail-value" style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{sol.numero}</div></div>
            <div className="detail-field"><div className="detail-label">Fecha emisión</div><div className="detail-value">{fmtDate(sol.fecha_emision)}</div></div>
            <div className="detail-field"><div className="detail-label">Emitido por</div><div className="detail-value">{sol.emitido_por}</div></div>
            <div className="detail-field">
              <div className="detail-label">Resumen</div>
              <div className="flex-gap mt8">
                {pendientes > 0 && <span className="badge b-amber">{pendientes} pend.</span>}
                {enProceso > 0 && <span className="badge b-blue">{enProceso} en proc.</span>}
                {cumplidos > 0 && <span className="badge b-green">{cumplidos} cumpl.</span>}
              </div>
            </div>
          </div>

          {sol.observaciones_generales && (
            <div className="info-box accent mb12">
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--blue)", textTransform: "uppercase", marginBottom: 4 }}>Observaciones generales</div>
              <div style={{ fontSize: 12, color: "var(--text)" }}>{sol.observaciones_generales}</div>
            </div>
          )}

          <div className="form-section">Ítems de la solicitud</div>

          {items.map(it => (
            <div key={it.id} className="item-card" style={{ cursor: esBarco ? "default" : "pointer" }} onClick={!esBarco ? () => setItemModal(it) : undefined}>
              {/* [DS-10.2] Jerarquía: identificadores → descripción → metadata → acciones */}
              <div className="item-card-header">
                <span className="item-card-num">{it.numero_item}</span>
                <span className="item-card-desc">{it.descripcion}</span>
                {it.tipo_reparacion && <BadgeTipoRep tipo={it.tipo_reparacion} />}
                <BadgeEstado estado={it.estado} />
              </div>
              {(it.obs_capitan || it.obs_superintendente || it.realizado_por || it.nro_remito || it.adjunto_url) && (
                <div className="item-card-body">
                  {it.obs_capitan && <div className="item-card-field"><div className="item-card-label">Obs. Capitán/JDM</div><div className="item-card-value">{it.obs_capitan}</div></div>}
                  {it.obs_superintendente && <div className="item-card-field"><div className="item-card-label">Obs. Superintendente</div><div className="item-card-value">{it.obs_superintendente}</div></div>}
                  {it.realizado_por && <div className="item-card-field"><div className="item-card-label">Realizado por</div><div className="item-card-value">{it.realizado_por}{it.tipo_realizacion ? ` (${it.tipo_realizacion})` : ""}</div></div>}
                  {it.fecha_realizacion && <div className="item-card-field"><div className="item-card-label">Fecha realización</div><div className="item-card-value">{fmtDate(it.fecha_realizacion)}</div></div>}
                  {it.nro_remito && <div className="item-card-field"><div className="item-card-label">N° Remito</div><div className="item-card-value" style={{ fontFamily: "var(--mono)", color: "var(--blue)" }}>{it.nro_remito}</div></div>}
                  {it.adjunto_url && <div className="item-card-field"><div className="item-card-label">Adjunto</div><a href={it.adjunto_url} target="_blank" rel="noreferrer" className="adjunto-link" onClick={e => e.stopPropagation()}>📎 Ver archivo →</a></div>}
                </div>
              )}
              {/* [DS-10.2] Nivel 4: acciones al fondo */}
              {esBarco && (
                <ItemAccionesBarco item={it} notify={notify} onUpdated={handleItemUpdated} onEliminar={handleItemUpdated} />
              )}
            </div>
          ))}
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>

      {itemModal && (
        <ItemModal item={itemModal} esBarco={esBarco} onClose={() => setItemModal(null)}
          onSave={() => { setItemModal(null); handleItemUpdated(); }} notify={notify} />
      )}
    </div>
  );
}

// ─── MODAL: NUEVA SOLICITUD ───────────────────────────────────────────────────
function NuevaSolicitudModal({ barcoDefault, onClose, onSave, notify }) {
  const [form, setForm] = useState({
    barco: barcoDefault || "Golondrina de Mar",
    area: "", numero: "", fecha_emision: today(), emitido_por: "", observaciones_generales: "",
  });
  const [items, setItems] = useState([{ id: 1, descripcion: "", obs_capitan: "", tipo_reparacion: "" }]);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), descripcion: "", obs_capitan: "", tipo_reparacion: "" }]);
  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));
  const updateItem = (id, k, v) => setItems(prev => prev.map(it => it.id === id ? { ...it, [k]: v } : it));

  const handleSave = async () => {
    if (!form.area) return alert("Seleccioná el área (Cubierta o Máquinas)");
    if (!form.numero.trim()) return alert("Ingresá el número de solicitud");
    if (!form.emitido_por.trim()) return alert("Ingresá quién emite la solicitud");
    const itemsValidos = items.filter(it => it.descripcion.trim());
    if (!itemsValidos.length) return alert("Agregá al menos un ítem con descripción");
    setSaving(true);
    try {
      const sol = await api.crearSolicitud({ ...form, status: "abierta" });
      const itemsCreados = itemsValidos.map((it, i) => ({
        solicitud_id: sol.id, numero_item: `${form.numero}-${i + 1}`,
        descripcion: it.descripcion, obs_capitan: it.obs_capitan || null,
        tipo_reparacion: it.tipo_reparacion || null, estado: "pendiente",
      }));
      await api.crearItems(itemsCreados);
      await api.enviarNotificacion({
        barco: form.barco, area: form.area, numero: form.numero,
        fecha: fmtDate(form.fecha_emision), emitido_por: form.emitido_por,
        observaciones: form.observaciones_generales || "", items: itemsCreados,
      });
      notify("SSRR creada correctamente", "success");
      onSave();
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl">
        <div className="mhdr">
          <div className="mtitle">Nueva Solicitud de Reparación</div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="form-section">Datos de la solicitud</div>
          <div className="form-grid-3">
            <FG label="Barco *"><select value={form.barco} onChange={e => set("barco", e.target.value)}>{BARCOS.map(b => <option key={b}>{b}</option>)}</select></FG>
            <FG label="N° de solicitud *" hint="Ej: 7/26"><input value={form.numero} onChange={e => set("numero", e.target.value)} placeholder="Ej: 7/26" /></FG>
            <FG label="Fecha de emisión *"><input type="date" value={form.fecha_emision} onChange={e => set("fecha_emision", e.target.value)} /></FG>
          </div>
          <div className="form-grid mb12">
            <ToggleGroup label="Área *" options={AREAS} value={form.area} onChange={v => set("area", v)} colorClass={{ Cubierta: "cubierta", "Máquinas": "maquinas" }} />
            <FG label="Emitido por (JDM / Capitán) *"><input value={form.emitido_por} onChange={e => set("emitido_por", e.target.value)} placeholder="Nombre del responsable" /></FG>
          </div>
          <FG label="Observaciones generales" full>
            <textarea value={form.observaciones_generales} onChange={e => set("observaciones_generales", e.target.value)} placeholder="Observaciones generales..." style={{ marginTop: 8 }} />
          </FG>
          <div className="form-section">Ítems a reparar</div>
          <div className="info-box accent mb12">Agregá cada punto de reparación. El número de ítem se asigna automáticamente.</div>
          {items.map((it, i) => (
            <div key={it.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 8 }}>
              <div className="flex-between mb8">
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{form.numero || "XX"}-{i + 1}</span>
                {items.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => removeItem(it.id)} style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>✕</button>}
              </div>
              <div className="form-grid">
                <FG label="Descripción *" full><input value={it.descripcion} onChange={e => updateItem(it.id, "descripcion", e.target.value)} placeholder="Descripción del trabajo a realizar..." /></FG>
                <ToggleGroup label="Tipo de reparación" options={TIPOS_REPARACION} value={it.tipo_reparacion} onChange={v => updateItem(it.id, "tipo_reparacion", v)} colorClass={{ Correctiva: "correctiva", Preventiva: "preventiva" }} />
                <FG label="Observaciones del JDM/Capitán" full><input value={it.obs_capitan || ""} onChange={e => updateItem(it.id, "obs_capitan", e.target.value)} placeholder="Observaciones opcionales..." /></FG>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm mt8" onClick={addItem}>+ Agregar ítem</button>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Crear solicitud"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── SOLICITUD CARD ───────────────────────────────────────────────────────────
function SolicitudCard({ sol, onVerDetalle, onItemClick, esBarco, notify, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [loadingDel, setLoadingDel] = useState(false);
  const items = sol.ssrr_items || [];
  const pendientes = items.filter(it => it.estado === "pendiente").length;
  const enProceso = items.filter(it => it.estado === "en_proceso").length;

  const handleEliminarSol = async (e) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar la SSRR N° ${sol.numero} completa?\n\nSe eliminarán todos sus ítems. Esta acción no se puede deshacer.`)) return;
    setLoadingDel(true);
    try {
      await api.eliminarSolicitud(sol.id);
      notify("Solicitud eliminada", "warn");
      onRefresh();
    } catch (err) { alert("Error: " + err.message); }
    finally { setLoadingDel(false); }
  };

  return (
    <div className="ssrr-card">
      <div className="ssrr-hdr">
        <div className="ssrr-hdr-main" onClick={() => onVerDetalle(sol)}>
          {/* [DS-10.2] Nivel 1: identificadores */}
          <div className="flex-gap">
            <span className="ssrr-num">SSRR N° {sol.numero}</span>
            {sol.area && <BadgeArea area={sol.area} />}
            {pendientes > 0 && <span className="badge b-amber">{pendientes} pendiente{pendientes > 1 ? "s" : ""}</span>}
            {enProceso > 0 && <span className="badge b-blue">{enProceso} en proceso</span>}
          </div>
          {/* [DS-10.2] Nivel 3: metadata */}
          <div className="ssrr-meta">Emitida: {fmtDate(sol.fecha_emision)} · Por: {sol.emitido_por} · {sol.barco}</div>
        </div>
        <div className="flex-gap">
          <span style={{ fontSize: 10, color: "var(--muted)" }}>{items.length} ítem{items.length !== 1 ? "s" : ""}</span>
          {esBarco && (
            <button className="ssrr-expand" onClick={handleEliminarSol} disabled={loadingDel} title="Eliminar solicitud completa" style={{ color: "var(--danger)" }}>
              🗑
            </button>
          )}
          <button className="ssrr-expand" onClick={() => setExpanded(!expanded)} title={expanded ? "Colapsar" : "Expandir"}>{expanded ? "▲" : "▼"}</button>
        </div>
      </div>

      {expanded && (
        <div className="ssrr-card-table-wrap" style={{ overflowX: "auto" }}>
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>N°</th>
                <th>Descripción</th>
                <th style={{ width: 110 }}>Tipo Rep.</th>
                <th style={{ width: 110 }}>Estado</th>
                <th style={{ width: 130 }}>Obs. Capitán</th>
                {!esBarco && <th style={{ width: 150 }}>Obs. Super.</th>}
                <th style={{ width: 120 }}>Quién realizó</th>
                <th style={{ width: 90 }}>Fecha real.</th>
                <th style={{ width: 90 }}>N° Remito</th>
                <th style={{ width: 80 }}>Adjunto</th>
                {esBarco && <th style={{ width: 130 }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0
                ? <tr><td colSpan={esBarco ? 10 : 9} style={{ textAlign: "center", padding: 20, color: "var(--muted2)" }}>Sin ítems</td></tr>
                : items.map(it => (
                  <tr key={it.id} onClick={!esBarco ? () => onItemClick(it) : undefined} style={{ cursor: esBarco ? "default" : "pointer" }}>
                    <td className="item-num-cell">{it.numero_item}</td>
                    <td className="item-desc-cell">{it.descripcion}</td>
                    <td><BadgeTipoRep tipo={it.tipo_reparacion} /></td>
                    <td><BadgeEstado estado={it.estado} /></td>
                    <td className="item-obs-cell">{it.obs_capitan || "—"}</td>
                    {!esBarco && <td className="item-obs-cell">{it.obs_superintendente || "—"}</td>}
                    <td style={{ fontSize: 10, color: "var(--muted)" }}>{it.realizado_por ? `${it.realizado_por}${it.tipo_realizacion ? ` (${it.tipo_realizacion})` : ""}` : "—"}</td>
                    <td style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)" }}>{fmtDate(it.fecha_realizacion)}</td>
                    <td className="item-remito">{it.nro_remito || "—"}</td>
                    <td>{it.adjunto_url ? <a href={it.adjunto_url} target="_blank" rel="noreferrer" className="adjunto-link" onClick={e => e.stopPropagation()}>📎 Ver</a> : "—"}</td>
                    {esBarco && (
                      <td onClick={e => e.stopPropagation()}>
                        <ItemAccionesBarco item={it} notify={notify} onUpdated={onRefresh} onEliminar={onRefresh} />
                      </td>
                    )}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── PAGE PANEL ───────────────────────────────────────────────────────────────
function PagePanel({ barco, notify, esBarco }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemModal, setItemModal] = useState(null);
  const [solicitudModal, setSolicitudModal] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setSolicitudes(await api.getSolicitudes(barco)); }
    finally { setLoading(false); }
  }, [barco]);

  useEffect(() => { load(); }, [load]);

  const todosItems = solicitudes.flatMap(s => s.ssrr_items || []);
  const counts = {
    total: todosItems.length,
    pendiente: todosItems.filter(it => it.estado === "pendiente").length,
    en_proceso: todosItems.filter(it => it.estado === "en_proceso").length,
    cumplido: todosItems.filter(it => it.estado === "cumplido").length,
    anulado: todosItems.filter(it => it.estado === "anulado").length,
  };

  const solFiltradas = solicitudes
    .map(sol => {
      let items = sol.ssrr_items || [];
      if (filtroEstado) items = items.filter(it => it.estado === filtroEstado);
      if (busqueda) {
        const q = busqueda.toLowerCase();
        if (!sol.numero?.toLowerCase().includes(q)) items = items.filter(it => it.descripcion?.toLowerCase().includes(q));
      }
      return { ...sol, ssrr_items: items };
    })
    .filter(sol => sol.ssrr_items.length > 0);

  return (
    <div>
      {/* [DS-11.3] Stats — 5 cols desktop, 2 cols mobile via CSS */}
      <div className="stats">
        <div className="stat"><div className="stat-label">Total ítems</div><div className="stat-value" style={{ color: "var(--blue)" }}>{counts.total}</div></div>
        <div className="stat"><div className="stat-label">Pendientes</div><div className="stat-value" style={{ color: "var(--warn)" }}>{counts.pendiente}</div></div>
        <div className="stat"><div className="stat-label">En proceso</div><div className="stat-value" style={{ color: "var(--blue)" }}>{counts.en_proceso}</div></div>
        <div className="stat"><div className="stat-label">Cumplidos</div><div className="stat-value" style={{ color: "var(--accent2)" }}>{counts.cumplido}</div></div>
        <div className="stat"><div className="stat-label">Anulados</div><div className="stat-value" style={{ color: "var(--muted)" }}>{counts.anulado}</div></div>
      </div>
      <div className="filter-row">
        <input className="filter-input" placeholder="🔍 Buscar ítem o N° SSRR..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(filtroEstado || busqueda) && <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroEstado(""); setBusqueda(""); }}>✕ Limpiar</button>}
        <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{solFiltradas.length} solicitudes</span>
      </div>

      {loading ? <div className="loading"><span className="spin">◌</span> Cargando...</div> :
        solFiltradas.length === 0 ? <div className="empty-state"><div style={{ fontSize: 28, marginBottom: 8 }}>🔧</div>Sin solicitudes registradas</div> :
        solFiltradas.map(sol => (
          <SolicitudCard key={sol.id} sol={sol} onVerDetalle={setSolicitudModal} onItemClick={setItemModal} esBarco={esBarco} notify={notify} onRefresh={load} />
        ))
      }

      {itemModal && !esBarco && (
        <ItemModal item={itemModal} esBarco={false} onClose={() => setItemModal(null)}
          onSave={() => { setItemModal(null); notify("Ítem actualizado", "success"); load(); }} notify={notify} />
      )}
      {solicitudModal && (
        <SolicitudModal sol={solicitudModal} esBarco={esBarco} notify={notify} onClose={() => setSolicitudModal(null)}
          onItemSaved={() => { notify("Ítem actualizado", "success"); load(); setSolicitudModal(null); }} />
      )}
    </div>
  );
}

// ─── LOGIN PAGE — DS §8.7 / §9.1-C / §11.12.3 ────────────────────────────────
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return setError("Completá usuario y contraseña");
    setLoading(true); setError("");
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) { setError("Usuario o contraseña incorrectos"); setLoading(false); }
  };
  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  // [DS-1.5][DS-8.7][DS-9.1-C] paleta scoped: #0B1629, teal #1A7A6E, gold #B8942A
  const loginCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
    .login-page{min-height:100vh;display:flex;background:#0B1629;position:relative;overflow:hidden}
    .login-bg-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(11,22,41,0.92) 0%,rgba(11,22,41,0.75) 60%,rgba(11,22,41,0.92) 100%)}
    /* [DS-9.1-C] grid teal rgba(26,122,110,.06) cada 60px */
    .login-bg-lines{position:absolute;inset:0;z-index:0;background-image:linear-gradient(rgba(26,122,110,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,122,110,0.06) 1px,transparent 1px);background-size:60px 60px}
    .login-split{position:relative;z-index:2;display:flex;width:100%}
    /* [DS-8.7] panel izquierdo */
    .login-left{flex:1;display:flex;flex-direction:column;justify-content:center;padding:80px 60px;border-right:1px solid rgba(26,122,110,0.2)}
    .login-left-integra-wrap{margin-bottom:8px}
    .login-left-integra-img{height:340px;width:auto;object-fit:contain;opacity:0.95}
    .login-left-divider{width:100%;height:1px;background:rgba(255,255,255,0.1);margin:8px 0 20px}
    .login-left-company{display:flex;align-items:center;gap:14px;margin-bottom:4px}
    /* [DS-7.2] logo circular 50% */
    .login-left-company-logo{width:48px;height:48px;border-radius:50%;object-fit:contain;border:1.5px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05)}
    /* [DS-8.7] nombre empresa/módulo 20px/800 */
    .login-left-company-name{font-size:20px;font-weight:800;color:#fff;letter-spacing:0.5px}
    /* [DS-9.1-C] línea teal 3px/48px */
    .login-left-line{width:48px;height:3px;background:#1A7A6E;margin:20px 0}
    /* [DS-9.1-C] tagline itálica */
    .login-left-sub{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.7;max-width:320px;font-style:italic}
    /* [DS-8.7] panel derecho */
    .login-right{width:440px;flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:60px 48px}
    /* [DS-7.3][DS-8.7] card border gold rgba(184,148,42,.2) blur */
    .login-card{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(184,148,42,0.2);border-radius:16px;padding:40px 36px;backdrop-filter:blur(20px)}
    /* [DS-8.7] eyebrow DM Mono 9px gold */
    .login-card-eyebrow{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:#B8942A;text-transform:uppercase;margin-bottom:10px}
    .login-card-title{font-size:16px;font-weight:700;color:#fff;margin-bottom:4px}
    .login-card-sub{font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:1px;margin-bottom:28px;text-transform:uppercase}
    .login-fg{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
    .login-fg label{font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;font-weight:600}
    .login-fg input{border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:11px 14px;font-size:13px;font-family:'Montserrat',sans-serif;color:#fff;background:rgba(255,255,255,0.06);outline:none;transition:border-color .15s}
    .login-fg input::placeholder{color:rgba(255,255,255,0.2)}
    /* [DS-8.7] focus gold */
    .login-fg input:focus{border-color:#B8942A;background:rgba(255,255,255,0.09)}
    /* [DS-8.7] botón fondo gold #B8942A texto #0B1629 */
    .login-btn{width:100%;padding:12px;margin-top:8px;background:#B8942A;color:#0B1629;border:none;border-radius:8px;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s;letter-spacing:.5px}
    .login-btn:hover{background:#D4AA3A}
    .login-btn:disabled{opacity:.5;cursor:not-allowed}
    .login-error{background:rgba(239,68,68,0.12);color:#FCA5A5;border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:10px 14px;font-size:12px;margin-bottom:14px}
    .login-footer{text-align:center;font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.2);margin-top:20px;letter-spacing:1px}
    /* [DS-8.7][DS-11.12.3] mobile — Optical Centering Rule VIGENTE */
    @media(max-width:768px){
      .login-split{flex-direction:column}
      .login-left{padding:48px 32px 32px;border-right:none;border-bottom:1px solid rgba(26,122,110,0.2);align-items:center;text-align:center}
      .login-left-integra-img{height:200px;max-width:90vw}
      .login-left-line{margin:16px auto}
      .login-left-sub{max-width:100%}
      /* [DS-11.12.3] contenedor: flex + center */
      .login-right{width:100%;padding:32px 28px 56px;display:flex;justify-content:center;align-items:flex-start}
      /* [DS-11.12.3] card: 80vw, max 340px */
      .login-card{width:min(340px,80vw);max-width:340px;margin:0 auto;padding:32px 28px}
    }
    @media(max-width:414px){ .login-card{width:min(332px,80vw)} }
    @media(max-width:390px){ .login-card{width:min(312px,80vw);padding:28px 24px} }
  `;

  return (
    <>
      <style>{loginCSS}</style>
      <div className="login-page">
        <div className="login-bg-lines" />
        <div className="login-bg-overlay" />
        <div className="login-split">

          {/* ── Izquierda: marca INTEGRA ── */}
          <div className="login-left">
            <div className="login-left-integra-wrap">
              <img src="/integralogo.png" alt="INTEGRA" className="login-left-integra-img" />
            </div>
            <div className="login-left-divider" />
            <div className="login-left-company">
              <img src="/PL.png" alt="PL Offshore" className="login-left-company-logo" />
              <div className="login-left-company-name">PL Offshore | Reparaciones</div>
            </div>
            <div className="login-left-line" />
            <div className="login-left-sub">We Find the Way, or We Make One.</div>
          </div>

          {/* ── Derecha: formulario ── */}
          <div className="login-right">
            <div className="login-card">
              <div className="login-card-eyebrow">PL Offshore | Reparaciones</div>
              <div className="login-card-title">Acceso al portal</div>
              <div className="login-card-sub">Solo personal autorizado</div>
              {error && <div className="login-error">{error}</div>}
              <div className="login-fg">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} placeholder="correo@paranalogistica.com.ar" autoFocus />
              </div>
              <div className="login-fg">
                <label>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} placeholder="••••••••" />
              </div>
              <button className="login-btn" onClick={handleLogin} disabled={loading || !email || !password}>
                {loading ? "Ingresando..." : "Ingresar →"}
              </button>
              <div className="login-footer">PL Offshore · Reparaciones · Confidencial</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [userEmail, setUserEmail] = useState("");
  const [barcosPermitidos, setBarcosPermitidos] = useState(BARCOS);
  const [barco, setBarco] = useState("Golondrina de Mar");
  const [esBarco, setEsBarco] = useState(false);
  const [notif, setNotif] = useState(null);
  const [nuevaModal, setNuevaModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState("panel");

  const setupSession = (sess) => {
    setSession(sess);
    if (sess) {
      const email = sess.user.email;
      setUserEmail(email);
      const barcoDelUsuario = BARCO_POR_EMAIL[email];
      if (barcoDelUsuario) {
        setBarcosPermitidos([barcoDelUsuario]);
        setBarco(barcoDelUsuario);
        setEsBarco(true);
      } else {
        setBarcosPermitidos(BARCOS);
        setBarco(BARCOS[0]);
        setEsBarco(false);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setupSession(session || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setupSession(session || null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setUserEmail(""); setEsBarco(false); };

  const notify = useCallback((text, type = "info") => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 4000);
  }, []);

  // [DS-8.4] pantalla de carga inicial: fondo navy, DM Mono
  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy, #213363)" }}>
        <style>{CSS}</style>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, textTransform: "uppercase" }}>Cargando...</div>
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── SIDEBAR [DS-3.2] — solo desktop ── */}
        <nav className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo-wrap">
              <img src="/PL.png" alt="PL Offshore" className="sidebar-logo-img" onError={e => { e.currentTarget.style.display = "none"; }} />
              <div>
                <div className="sidebar-logo-main">Reparaciones</div>
                <div className="sidebar-logo-sub">PL Offshore</div>
              </div>
            </div>
          </div>
          <div className="nav-section">Barcos</div>
          {barcosPermitidos.map(b => (
            <div key={b} className={`ni ${barco === b ? "active" : ""}`} onClick={() => barcosPermitidos.length > 1 && setBarco(b)}>
              <span className="ni-icon">🚢</span><span style={{ fontSize: 11 }}>{b}</span>
            </div>
          ))}
          <div className="nav-section">Acciones</div>
          <div className="ni nueva" onClick={() => setNuevaModal(true)}><span className="ni-icon">+</span><span>Nueva SSRR</span></div>
          <div className="ni active"><span className="ni-icon">▦</span><span>Panel de control</span></div>
          <div style={{ flex: 1 }} />
          <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,.1)" }}>
            {/* [DS-8.1] Volver al portal con PORTAL_URL */}
            <div className="ni erp" style={{ padding: "6px 0", borderLeft: "none" }} onClick={() => window.open(ERP_URL, "_self")}>
              <span className="ni-icon" style={{ fontSize: 11 }}>←</span><span style={{ fontSize: 11 }}>Volver al ERP</span>
            </div>
            <div className="ni erp" style={{ padding: "6px 0", borderLeft: "none", marginTop: 4 }} onClick={handleLogout}>
              <span className="ni-icon" style={{ fontSize: 11 }}>⏻</span><span style={{ fontSize: 11 }}>Cerrar sesión</span>
            </div>
            {/* [DS-3.2][DS-9.1-B] versión DM Mono 9px */}
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.25)", fontFamily: "var(--mono)", letterSpacing: 1, marginTop: 8 }}>SSRR v1.5</div>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">{barco} — Panel de control</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* [DS-3.3] avatar circular 28×28 fondo #DBEAFE */}
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--blue)", fontWeight: 700 }}>
                {userEmail ? userEmail[0].toUpperCase() : "U"}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{userEmail || "Usuario"}</span>
            </div>
          </div>
          <div className="content">
            <PagePanel key={`${barco}-${refreshKey}`} barco={barco} notify={notify} esBarco={esBarco} />
          </div>
        </div>
      </div>

      {/* ── MOBILE NAV [DS-4.10] ── */}
      <nav className="mobile-nav">
        <button className={`mn-item ${page === "panel" ? "active" : ""}`} onClick={() => setPage("panel")}>
          <span className="mn-icon">▦</span>
          <span className="mn-label">Panel</span>
        </button>
        <button className="mn-item" onClick={() => setNuevaModal(true)}>
          <span className="mn-icon">+</span>
          <span className="mn-label">Nueva</span>
        </button>
        {barcosPermitidos.length > 1 && barcosPermitidos.map(b => (
          <button key={b} className={`mn-item ${barco === b ? "active" : ""}`} onClick={() => setBarco(b)}>
            <span className="mn-icon">🚢</span>
            <span className="mn-label">{b.split(" ")[0]}</span>
          </button>
        ))}
        <button className="mn-item" onClick={() => window.open(ERP_URL, "_self")}>
          <span className="mn-icon">←</span>
          <span className="mn-label">Portal</span>
        </button>
      </nav>

      {nuevaModal && (
        <NuevaSolicitudModal barcoDefault={barco} onClose={() => setNuevaModal(false)}
          onSave={() => { setNuevaModal(false); setRefreshKey(k => k + 1); }} notify={notify} />
      )}

      <Notif msg={notif} onClose={() => setNotif(null)} />
    </>
  );
}

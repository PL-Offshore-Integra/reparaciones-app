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
  "golondrinademar@ploffshore.com": "Golondrina de Mar",
  "atlanticdama@ploffshore.com": "Atlantic Dama",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#082F4E;--blue:#056D76;--mid:#4A5560;--light:#C9D0D6;
  --bg:#FAFBFC;--surface:#FFFFFF;--surface2:#F4F6F8;--surface3:#E4E8EC;
  --border:#E4E8EC;--border2:#C9D0D6;
  --text:#0F1419;--muted:#4A5560;--muted2:#7A8792;
  --accent:#056D76;--accent2:#0E7A5F;--warn:#8F5A0B;--danger:#B3261E;
  --purple:#4A5560;--teal:#056D76;--orange:#8F5A0B;
  --mono:'IBM Plex Mono',monospace;--sans:'IBM Plex Sans',sans-serif;--r:4px;--r2:4px;
  --nav:#082F4E;--action:#056D76;--action-press:#04565D;
  --tr:color 120ms,background-color 120ms,border-color 120ms;
}
body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:15px;line-height:1.55;min-height:100vh;overflow-x:hidden}
*:focus-visible{outline:2px solid var(--action);outline-offset:2px}
.app{display:flex;min-height:100vh;overflow-x:hidden}
.sidebar{width:240px;min-width:240px;background:var(--nav);display:flex;flex-direction:column}
.sidebar-header{border-bottom:1px solid rgba(255,255,255,.14)}
.sidebar-logo-wrap{padding:14px 16px;display:flex;align-items:center;gap:12px;height:56px}
.sidebar-logo-main{font-size:14px;font-weight:600;color:#fff}
.sidebar-logo-sub{font-family:var(--mono);font-size:11px;color:rgba(255,255,255,.72);margin-top:2px;letter-spacing:.06em;text-transform:uppercase}
.nav-section{padding:16px 16px 6px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:rgba(255,255,255,.72);text-transform:uppercase}
.ni{display:flex;align-items:center;gap:10px;padding:9px 16px;font-size:14px;font-weight:500;cursor:pointer;color:rgba(255,255,255,.72);border-left:3px solid transparent;transition:var(--tr);user-select:none;min-height:36px;background:none;border-right:none;border-top:none;border-bottom:none;width:100%;text-align:left}
.ni:hover{color:#fff;background:rgba(255,255,255,.08)}
.ni.active{color:#fff;border-left-color:var(--action);background:rgba(255,255,255,.12)}
.ni-ico{display:block;flex:0 0 auto;color:rgba(255,255,255,.72)}
.ni.active .ni-ico{color:#fff}
.ni-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
.topbar-title{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}
.content{flex:1;overflow-y:auto;overflow-x:hidden;padding:24px;background:var(--bg)}
.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:20px}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px}
.stat-label{font-family:var(--mono);font-size:10px;color:var(--muted);font-weight:500;letter-spacing:.08em;margin-bottom:6px;text-transform:uppercase}
.stat-value{font-family:var(--mono);font-size:28px;font-weight:600;color:var(--navy)}
.filter-row{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.filter-input,.filter-select{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:14px;height:36px;padding:0 10px;outline:none;min-width:150px;transition:var(--tr)}
.filter-select{cursor:pointer}
.filter-input:focus,.filter-select:focus{border-width:2px;border-color:var(--action);padding:0 9px}
.badge{display:inline-flex;align-items:center;font-family:var(--mono);font-size:11px;font-weight:500;padding:3px 8px;border-radius:3px;white-space:nowrap;letter-spacing:.06em;text-transform:uppercase}
.b-amber{background:#FBF1E3;color:#8F5A0B}
.b-blue{background:#E6F1F2;color:#056D76}
.b-teal{background:#E8F3EF;color:#0E7A5F}
.b-red{background:#FAEAE8;color:#B3261E}
.b-purple{background:#F4F6F8;color:#4A5560}
.b-green{background:#E8F3EF;color:#0E7A5F}
.b-gray{background:#F4F6F8;color:#4A5560}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--sans);font-size:14px;font-weight:500;height:36px;padding:0 16px;border-radius:var(--r);border:1px solid transparent;cursor:pointer;transition:var(--tr);white-space:nowrap}
.btn-primary{background:var(--action);color:#fff}.btn-primary:hover{background:var(--navy)}
.btn-success{background:var(--accent2);color:#fff}.btn-success:hover{background:#0B6249}
.btn-ghost{background:var(--surface);color:var(--muted);border-color:var(--border2)}.btn-ghost:hover{color:var(--text);background:var(--surface2)}
.btn-danger{background:var(--surface);color:var(--danger);border-color:var(--border2)}.btn-danger:hover{background:#FAEAE8;border-color:var(--danger)}
.btn-sm{height:28px;padding:0 12px;font-size:13px}
.btn:disabled{background:var(--surface3);color:var(--muted2);border-color:transparent;cursor:not-allowed}
.overlay{position:fixed;inset:0;background:rgba(15,20,25,.45);display:flex;align-items:flex-start;justify-content:center;z-index:100;padding:24px;overflow-y:auto}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);width:100%;max-width:860px;margin:auto;box-shadow:0 8px 24px rgba(15,20,25,.14)}
.modal-xl{max-width:1000px}
.modal-xxl{max-width:1100px}
.mhdr{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:20px 24px;border-bottom:1px solid var(--border);background:var(--surface);border-radius:var(--r) var(--r) 0 0}
.mtitle{font-size:18px;font-weight:600;color:var(--navy)}
.mbody{padding:24px}
.mftr{padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:var(--surface2);border-radius:0 0 var(--r) var(--r)}
.mclose{background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;line-height:1}
.mclose:hover{color:var(--navy)}
.fg{display:flex;flex-direction:column;gap:6px}
.fg label{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;font-weight:500}
.fg input,.fg select,.fg textarea{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:14px;height:36px;padding:0 12px;outline:none;transition:var(--tr)}
.fg textarea{resize:vertical;min-height:72px;height:auto;padding:10px 12px}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-width:2px;border-color:var(--action);padding:0 11px}
.fg textarea:focus{padding:9px 11px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}
.form-section{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;margin:24px 0 16px;padding-bottom:8px;border-bottom:1px solid var(--border)}
.toggle-group{display:flex;gap:8px}
.toggle-btn{flex:1;padding:8px 12px;border-radius:var(--r);border:1px solid var(--border2);background:var(--surface);color:var(--muted);font-family:var(--sans);font-size:13px;font-weight:500;cursor:pointer;transition:var(--tr);text-align:center;text-transform:uppercase;letter-spacing:.5px}
.toggle-btn:hover{border-color:var(--action);color:var(--action)}
.toggle-btn.selected{border-color:var(--action);background:var(--action);color:#fff}
.toggle-btn.selected.cubierta{border-color:#0E7490;background:#0E7490}
.toggle-btn.selected.maquinas{border-color:#4A5560;background:#4A5560}
.toggle-btn.selected.correctiva{border-color:#B3261E;background:#B3261E}
.toggle-btn.selected.preventiva{border-color:#0E7A5F;background:#0E7A5F}

/* SSRR CARD */
.ssrr-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px;overflow:hidden}
.ssrr-card:hover{border-color:var(--border2)}
.ssrr-hdr{padding:14px 18px;background:var(--surface);display:flex;align-items:center;justify-content:space-between;gap:12px}
.ssrr-hdr-main{flex:1;cursor:pointer;min-width:0}
.ssrr-hdr-main:hover .ssrr-num{color:var(--action);text-decoration:underline}
.ssrr-num{font-family:var(--mono);font-size:13px;font-weight:600;color:var(--navy);transition:var(--tr)}
.ssrr-meta{font-size:12px;color:var(--muted);margin-top:4px;font-family:var(--mono)}
.ssrr-expand{padding:4px 8px;background:none;border:1px solid var(--border);cursor:pointer;color:var(--muted);font-size:12px;flex-shrink:0;border-radius:var(--r);transition:var(--tr)}
.ssrr-expand:hover{border-color:var(--border2);color:var(--navy);background:var(--surface2)}
.items-table{width:100%;border-collapse:collapse;font-size:13px}
.items-table th{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;padding:9px 12px;text-align:left;border-bottom:2px solid var(--navy);white-space:nowrap;background:var(--surface2)}
.items-table td{padding:11px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
.items-table tr:last-child td{border-bottom:none}
.items-table tr:hover td{background:var(--surface2)}
.item-num-cell{font-family:var(--mono);font-size:11px;color:var(--muted);white-space:nowrap}
.item-desc-cell{font-size:13px;color:var(--text);max-width:260px}
.item-obs-cell{font-size:12px;color:var(--muted);max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.item-remito{font-family:var(--mono);font-size:11px;color:var(--action);font-weight:500}
.adjunto-link{font-size:12px;color:var(--action);text-decoration:none;font-family:var(--mono);display:inline-flex;align-items:center;gap:3px}
.adjunto-link:hover{text-decoration:underline}

/* ITEM CARD (en modal de detalle) */
.item-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;margin-bottom:8px;transition:var(--tr)}
.item-card:hover{border-color:var(--border2)}
.item-card-header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.item-card-num{font-family:var(--mono);font-size:11px;color:var(--muted);font-weight:500;flex-shrink:0;background:var(--surface2);padding:3px 8px;border-radius:3px;border:1px solid var(--border)}
.item-card-desc{font-size:14px;color:var(--navy);font-weight:500;flex:1;min-width:0}
.item-card-actions{display:flex;gap:6px;align-items:center;flex-shrink:0;margin-left:auto}
.item-card-body{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}
.item-card-field{display:flex;flex-direction:column;gap:3px}
.item-card-label{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.06em;color:var(--muted2);text-transform:uppercase}
.item-card-value{font-size:13px;color:var(--text)}

/* DETAIL GRID (en modal de SSRR) */
.detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px;background:var(--surface2);border-radius:var(--r);padding:16px;border:1px solid var(--border)}
.detail-field{display:flex;flex-direction:column;gap:4px}
.detail-label{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}
.detail-value{font-size:14px;color:var(--navy);font-weight:500}

/* ACCIONES BARCO */
.cumplir-btn{background:var(--surface);border:1px solid var(--accent2);border-radius:var(--r);padding:4px 10px;cursor:pointer;color:var(--accent2);font-size:12px;font-weight:600;font-family:var(--sans);text-transform:uppercase;letter-spacing:.5px;transition:var(--tr);height:28px}
.cumplir-btn:hover{background:var(--accent2);color:#fff}
.cumplir-btn:disabled{opacity:.4;cursor:not-allowed}
.clip-btn{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:4px 8px;cursor:pointer;color:var(--muted);font-size:14px;transition:var(--tr);display:inline-flex;align-items:center;gap:4px;height:28px}
.clip-btn:hover{border-color:var(--action);color:var(--action);background:var(--surface)}
.clip-btn.has-file{border-color:var(--accent2);color:var(--accent2)}

/* INFO BOX */
.info-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;font-size:14px}
.info-box.accent{border-left:3px solid var(--action)}

/* NOTIF */
.notif{position:fixed;bottom:24px;right:24px;background:var(--surface);border:1px solid var(--border);border-left-width:3px;border-radius:var(--r);padding:14px 16px;font-size:14px;z-index:300;max-width:360px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(15,20,25,.14)}
.n-green{border-left-color:var(--accent2)}.n-red{border-left-color:var(--danger)}.n-amber{border-left-color:var(--warn)}.n-blue{border-left-color:var(--action)}

/* UTILS */
.flex-gap{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.flex-between{display:flex;justify-content:space-between;align-items:center;gap:12px}
.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}
.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}
.empty-state{text-align:center;padding:48px 24px;color:var(--muted);font-size:15px}
.loading{display:flex;align-items:center;justify-content:center;padding:48px;color:var(--muted);gap:12px;font-size:15px}
.spin{animation:spin 1s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

/* APPBAR */
.appbar{height:56px;background:var(--nav);display:flex;align-items:center;gap:24px;padding:0 24px;flex:0 0 auto}
.appbar-div{width:1px;height:24px;background:rgba(255,255,255,.14);flex:0 0 auto}
.appbar-instance{font:500 14px/1.2 var(--sans);color:#fff;white-space:nowrap;flex:0 0 auto}
.appbar-tools{margin-left:auto;display:flex;align-items:center;gap:16px}
.appbar-avatar{width:28px;height:28px;border-radius:var(--r);background:rgba(255,255,255,.14);color:#fff;font-family:var(--mono);font-size:12px;font-weight:500;line-height:28px;text-align:center;flex:0 0 auto}
.appbar-user{font:500 13px/1.25 var(--sans);color:#fff;white-space:nowrap}
.appbar-link{background:none;border:0;padding:0;cursor:pointer;font:500 13px/1.2 var(--sans);color:rgba(255,255,255,.86);white-space:nowrap}
.appbar-link:hover{color:#fff;text-decoration:underline}

/* SHELL / PAGEHEAD */
.shell{display:grid;grid-template-columns:248px minmax(0,1fr);align-items:stretch;min-height:calc(100vh - 56px)}
.sidebar{width:auto;min-width:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column}
.sidebar-header{border-bottom:1px solid var(--border);padding:16px;display:flex;align-items:center;gap:12px;min-height:69px}
.sidebar-logo-img{width:32px;height:32px;object-fit:contain;border:0;border-radius:0;background:none;flex:0 0 auto}
.sidebar-logo-main{font:600 15px/1.3 var(--sans);color:var(--navy)}
.sidebar-logo-sub{font-family:var(--mono);font-size:11px;font-weight:500;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}
.sidebar-nav{flex:1;padding:12px 0;overflow-y:auto}
.nav-section{padding:14px 16px 8px;font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;text-align:left}
.ni{display:flex;align-items:center;gap:12px;width:100%;padding:9px 16px 9px 13px;background:transparent;border:0;border-left:3px solid transparent;cursor:pointer;text-align:left;font:400 14px/1.3 var(--sans);color:var(--muted);transition:var(--tr);min-height:38px}
.ni:hover{background:var(--surface2);color:var(--navy)}
.ni.active{background:var(--surface2);border-left-color:var(--action);color:var(--navy);font-weight:500}
.ni-ico{display:block;flex:0 0 auto;color:var(--muted2)}
.ni.active .ni-ico{color:var(--action)}
.ni-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sidebar-foot{border-top:1px solid var(--border);padding:12px 8px;display:flex;flex-direction:column;gap:2px}
.sidebar-foot-btn{display:flex;align-items:center;gap:12px;width:100%;padding:9px 10px;background:none;border:0;border-radius:var(--r);cursor:pointer;font:500 13px/1.2 var(--sans);color:var(--muted);transition:var(--tr)}
.sidebar-foot-btn:hover{background:var(--surface2);color:var(--navy)}
.sidebar-foot-meta{padding:8px 10px 0;font-family:var(--mono);font-size:11px;font-weight:500;line-height:1.6;letter-spacing:.06em;color:var(--muted2)}
.pagehead{background:var(--surface);border-bottom:1px solid var(--border);padding:16px 24px;flex:0 0 auto}
.crumb{display:flex;align-items:center;gap:8px;font:400 13px/1.2 var(--sans);color:var(--muted)}
.crumb button{background:none;border:0;padding:0;cursor:pointer;font:400 13px/1.2 var(--sans);color:var(--action)}
.crumb button:hover{text-decoration:underline;color:var(--navy)}
.crumb-current{color:var(--text)}
.pagehead-row{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-top:10px}
.pagehead h1{font:600 22px/1.25 var(--sans);color:var(--navy);margin:0}
.pagehead p{font:400 13px/1.45 var(--sans);color:var(--muted);margin:6px 0 0}
.pagehead-actions{display:flex;gap:8px;flex:0 0 auto}

/* MOBILE NAV */
@media(max-width:768px){
  .shell{grid-template-columns:1fr}
  .sidebar{display:none}
  .main{padding-bottom:72px}
  .stats{grid-template-columns:1fr 1fr;gap:10px}
  .form-grid,.form-grid-3{grid-template-columns:1fr;gap:12px}
  .overlay{padding:0;align-items:flex-end}
  .modal{border-radius:var(--r) var(--r) 0 0;max-width:100%;max-height:92vh;overflow-y:auto}
  .notif{bottom:80px;right:12px;left:12px;max-width:unset}
  .detail-grid{grid-template-columns:1fr 1fr}
  .item-card-body{grid-template-columns:1fr}
  .mobile-nav{display:flex !important;position:fixed;bottom:0;left:0;right:0;background:var(--nav);border-top:1px solid rgba(255,255,255,.14);z-index:50;height:64px;justify-content:space-around;align-items:center;padding:0 4px}
  .mobile-nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:8px;border-radius:var(--r);color:rgba(255,255,255,.72);transition:var(--tr);flex:1;min-width:48px;min-height:48px;justify-content:center}
  .mobile-nav-item.active{color:#fff;background:rgba(255,255,255,.12)}
  .mobile-nav-icon{font-size:16px;line-height:1}
  .mobile-nav-label{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;text-align:center}
}
@media(min-width:769px){.mobile-nav{display:none !important}}
`;

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

function Notif({ msg, onClose }) {
  if (!msg) return null;
  const cls = { success: "n-green", error: "n-red", warn: "n-amber", info: "n-blue" }[msg.type] || "n-blue";
  return <div className={`notif ${cls}`}><span>{msg.text}</span><button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>✕</button></div>;
}

function FG({ label, hint, children, full }) {
  return <div className="fg" style={full ? { gridColumn: "1/-1" } : {}}>
    {label && <label>{label}</label>}
    {children}
    {hint && <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 2 }}>{hint}</div>}
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
      await api.actualizarItem(item.id, { estado: "cumplido", realizado_por: form.realizado_por, fecha_realizacion: form.fecha_realizacion || null, nro_remito: form.nro_remito || null, adjunto_url });
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
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{item.numero_item} — {item.descripcion}</div>
          </div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fg mb12">
            <label>Realizado por *</label>
            <input value={form.realizado_por} onChange={e => set("realizado_por", e.target.value)} placeholder="Nombre / Empresa que realizó el trabajo" autoFocus />
          </div>
          <div className="form-grid">
            <div className="fg"><label>Fecha de realización</label><input type="date" value={form.fecha_realizacion} onChange={e => set("fecha_realizacion", e.target.value)} /></div>
            <div className="fg"><label>N° de Remito</label><input value={form.nro_remito} onChange={e => set("nro_remito", e.target.value)} placeholder="Ej: 1-16190" /></div>
          </div>
          <div className="fg">
            <label>Adjunto (remito, foto, etc.)</label>
            <div className="flex-gap">
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()} type="button">📎 {archivo ? archivo.name : "Seleccionar archivo"}</button>
              {archivo && <button onClick={() => setArchivo(null)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 16 }}>✕</button>}
            </div>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setArchivo(e.target.files[0] || null)} />
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-success" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "✓ Confirmar cumplimiento"}</button>
        </div>
      </div>
    </div>
  );
}

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
    try { await api.eliminarItem(item.id); notify("Ítem eliminado", "warn"); onEliminar(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="item-card-actions" onClick={e => e.stopPropagation()}>
      {item.estado !== "cumplido" && (
        <button className="cumplir-btn" onClick={() => setModalCumplir(true)} disabled={loading}>✓ Cumplido</button>
      )}
      <button className={`clip-btn ${item.adjunto_url ? "has-file" : ""}`} onClick={() => fileRef.current.click()} disabled={loading} title={item.adjunto_url ? "Reemplazar adjunto" : "Subir adjunto"}>📎</button>
      <button className="clip-btn" onClick={handleEliminar} disabled={loading} title="Eliminar ítem" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>🗑</button>
      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
      {modalCumplir && <ModalCumplir item={item} notify={notify} onClose={() => setModalCumplir(false)} onSave={() => { setModalCumplir(false); onUpdated(); }} />}
    </div>
  );
}

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
        <div className="mhdr"><div><div className="mtitle">Ítem {item.numero_item}</div></div><button className="mclose" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg mb16"><label>Descripción</label><input value={form.descripcion || ""} readOnly style={{ background: "var(--surface2)" }} /></div>
          <div className="form-grid">
            <ToggleGroup label="Tipo de reparación" options={TIPOS_REPARACION} value={form.tipo_reparacion || ""} onChange={v => set("tipo_reparacion", v)} colorClass={{ Correctiva: "correctiva", Preventiva: "preventiva" }} />
            <FG label="Estado *">
              {esBarco ? <input value={ESTADOS[form.estado]?.label || form.estado} readOnly style={{ background: "var(--surface2)" }} /> :
                <select value={form.estado} onChange={e => set("estado", e.target.value)}>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>}
            </FG>
            <FG label="Tipo de realización"><select value={form.tipo_realizacion || ""} onChange={e => set("tipo_realizacion", e.target.value)}><option value="">—</option>{TIPO_REALIZACION.map(t => <option key={t}>{t}</option>)}</select></FG>
            <FG label="Realizado por"><input value={form.realizado_por || ""} onChange={e => set("realizado_por", e.target.value)} placeholder="Nombre / Empresa" /></FG>
            <FG label="Fecha de realización"><input type="date" value={form.fecha_realizacion || ""} onChange={e => set("fecha_realizacion", e.target.value)} /></FG>
            <FG label="N° de Remito"><input value={form.nro_remito || ""} onChange={e => set("nro_remito", e.target.value)} placeholder="Ej: 1-16190" /></FG>
          </div>
          <FG label="Observaciones del Capitán/JDM" full><textarea value={form.obs_capitan || ""} onChange={e => set("obs_capitan", e.target.value)} placeholder="Comentarios del embarcado..." /></FG>
          {!esBarco && <FG label="Observaciones del Superintendente" full><textarea value={form.obs_superintendente || ""} onChange={e => set("obs_superintendente", e.target.value)} placeholder="Comentarios del superintendente técnico..." /></FG>}
          {item.adjunto_url && <div className="mt12"><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Adjunto</div><a href={item.adjunto_url} target="_blank" rel="noreferrer" className="adjunto-link">📎 Ver archivo adjunto →</a></div>}
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

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
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>{sol.barco} · Emitida: {fmtDate(sol.fecha_emision)} · Por: {sol.emitido_por}</div>
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
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--action)", textTransform: "uppercase", marginBottom: 6 }}>Observaciones generales</div>
              <div style={{ fontSize: 14, color: "var(--text)" }}>{sol.observaciones_generales}</div>
            </div>
          )}

          <div className="form-section">Ítems de la solicitud</div>

          {items.map(it => (
            <div key={it.id} className="item-card" style={{ cursor: esBarco ? "default" : "pointer" }} onClick={!esBarco ? () => setItemModal(it) : undefined}>
              <div className="item-card-header">
                <span className="item-card-num">{it.numero_item}</span>
                <span className="item-card-desc">{it.descripcion}</span>
                {it.tipo_reparacion && <BadgeTipoRep tipo={it.tipo_reparacion} />}
                <BadgeEstado estado={it.estado} />
                {esBarco && <ItemAccionesBarco item={it} notify={notify} onUpdated={handleItemUpdated} onEliminar={handleItemUpdated} />}
              </div>
              {(it.obs_capitan || it.obs_superintendente || it.realizado_por || it.nro_remito || it.adjunto_url) && (
                <div className="item-card-body">
                  {it.obs_capitan && <div className="item-card-field"><div className="item-card-label">Obs. Capitán/JDM</div><div className="item-card-value">{it.obs_capitan}</div></div>}
                  {it.obs_superintendente && <div className="item-card-field"><div className="item-card-label">Obs. Superintendente</div><div className="item-card-value">{it.obs_superintendente}</div></div>}
                  {it.realizado_por && <div className="item-card-field"><div className="item-card-label">Realizado por</div><div className="item-card-value">{it.realizado_por}{it.tipo_realizacion ? ` (${it.tipo_realizacion})` : ""}</div></div>}
                  {it.fecha_realizacion && <div className="item-card-field"><div className="item-card-label">Fecha realización</div><div className="item-card-value">{fmtDate(it.fecha_realizacion)}</div></div>}
                  {it.nro_remito && <div className="item-card-field"><div className="item-card-label">N° Remito</div><div className="item-card-value" style={{ fontFamily: "var(--mono)", color: "var(--action)" }}>{it.nro_remito}</div></div>}
                  {it.adjunto_url && <div className="item-card-field"><div className="item-card-label">Adjunto</div><a href={it.adjunto_url} target="_blank" rel="noreferrer" className="adjunto-link" onClick={e => e.stopPropagation()}>📎 Ver archivo →</a></div>}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
      {itemModal && <ItemModal item={itemModal} esBarco={esBarco} onClose={() => setItemModal(null)} onSave={() => { setItemModal(null); handleItemUpdated(); }} notify={notify} />}
    </div>
  );
}

function NuevaSolicitudModal({ barcoDefault, onClose, onSave, notify }) {
  const [form, setForm] = useState({ barco: barcoDefault || "Golondrina de Mar", area: "", numero: "", fecha_emision: today(), emitido_por: "", observaciones_generales: "" });
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
      const itemsCreados = itemsValidos.map((it, i) => ({ solicitud_id: sol.id, numero_item: `${form.numero}-${i + 1}`, descripcion: it.descripcion, obs_capitan: it.obs_capitan || null, tipo_reparacion: it.tipo_reparacion || null, estado: "pendiente" }));
      await api.crearItems(itemsCreados);
      await api.enviarNotificacion({ barco: form.barco, area: form.area, numero: form.numero, fecha: fmtDate(form.fecha_emision), emitido_por: form.emitido_por, observaciones: form.observaciones_generales || "", items: itemsCreados });
      notify("SSRR creada correctamente", "success");
      onSave();
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl">
        <div className="mhdr"><div className="mtitle">Nueva Solicitud de Reparación</div><button className="mclose" onClick={onClose}>✕</button></div>
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
          <FG label="Observaciones generales" full><textarea value={form.observaciones_generales} onChange={e => set("observaciones_generales", e.target.value)} placeholder="Observaciones generales..." /></FG>
          <div className="form-section">Ítems a reparar</div>
          <div className="info-box accent mb12">Agregá cada punto de reparación. El número de ítem se asigna automáticamente.</div>
          {items.map((it, i) => (
            <div key={it.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px", marginBottom: 8 }}>
              <div className="flex-between mb8">
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{form.numero || "XX"}-{i + 1}</span>
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
    try { await api.eliminarSolicitud(sol.id); notify("Solicitud eliminada", "warn"); onRefresh(); }
    catch (err) { alert("Error: " + err.message); }
    finally { setLoadingDel(false); }
  };

  return (
    <div className="ssrr-card">
      <div className="ssrr-hdr">
        <div className="ssrr-hdr-main" onClick={() => onVerDetalle(sol)}>
          <div className="flex-gap">
            <span className="ssrr-num">SSRR N° {sol.numero}</span>
            {sol.area && <BadgeArea area={sol.area} />}
            {pendientes > 0 && <span className="badge b-amber">{pendientes} pendiente{pendientes > 1 ? "s" : ""}</span>}
            {enProceso > 0 && <span className="badge b-blue">{enProceso} en proceso</span>}
          </div>
          <div className="ssrr-meta">Emitida: {fmtDate(sol.fecha_emision)} · Por: {sol.emitido_por} · {sol.barco}</div>
        </div>
        <div className="flex-gap">
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>{items.length} ítem{items.length !== 1 ? "s" : ""}</span>
          {esBarco && <button className="ssrr-expand" onClick={handleEliminarSol} disabled={loadingDel} title="Eliminar solicitud" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>🗑</button>}
          <button className="ssrr-expand" onClick={() => setExpanded(!expanded)} title={expanded ? "Colapsar" : "Expandir"}>{expanded ? "▲" : "▼"}</button>
        </div>
      </div>

      {expanded && (
        <div style={{ overflowX: "auto" }}>
          <table className="items-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Descripción</th>
                <th>Tipo Rep.</th>
                <th>Estado</th>
                <th>Obs. Capitán</th>
                {!esBarco && <th>Obs. Super.</th>}
                <th>Quién realizó</th>
                <th>Fecha real.</th>
                <th>N° Remito</th>
                <th>Adjunto</th>
                {esBarco && <th>Acciones</th>}
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
                    <td style={{ fontSize: 12, color: "var(--muted)" }}>{it.realizado_por ? `${it.realizado_por}${it.tipo_realizacion ? ` (${it.tipo_realizacion})` : ""}` : "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>{fmtDate(it.fecha_realizacion)}</td>
                    <td className="item-remito">{it.nro_remito || "—"}</td>
                    <td>{it.adjunto_url ? <a href={it.adjunto_url} target="_blank" rel="noreferrer" className="adjunto-link" onClick={e => e.stopPropagation()}>📎 Ver</a> : "—"}</td>
                    {esBarco && <td onClick={e => e.stopPropagation()}><ItemAccionesBarco item={it} notify={notify} onUpdated={onRefresh} onEliminar={onRefresh} /></td>}
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
  const counts = { total: todosItems.length, pendiente: todosItems.filter(it => it.estado === "pendiente").length, en_proceso: todosItems.filter(it => it.estado === "en_proceso").length, cumplido: todosItems.filter(it => it.estado === "cumplido").length, anulado: todosItems.filter(it => it.estado === "anulado").length };

  const solFiltradas = solicitudes.map(sol => {
    let items = sol.ssrr_items || [];
    if (filtroEstado) items = items.filter(it => it.estado === filtroEstado);
    if (busqueda) { const q = busqueda.toLowerCase(); if (!sol.numero?.toLowerCase().includes(q)) items = items.filter(it => it.descripcion?.toLowerCase().includes(q)); }
    return { ...sol, ssrr_items: items };
  }).filter(sol => sol.ssrr_items.length > 0);

  return (
    <div>
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
        solFiltradas.map(sol => <SolicitudCard key={sol.id} sol={sol} onVerDetalle={setSolicitudModal} onItemClick={setItemModal} esBarco={esBarco} notify={notify} onRefresh={load} />)
      }
      {itemModal && !esBarco && <ItemModal item={itemModal} esBarco={false} onClose={() => setItemModal(null)} onSave={() => { setItemModal(null); notify("Ítem actualizado", "success"); load(); }} notify={notify} />}
      {solicitudModal && <SolicitudModal sol={solicitudModal} esBarco={esBarco} notify={notify} onClose={() => setSolicitudModal(null)} onItemSaved={() => { notify("Ítem actualizado", "success"); load(); setSolicitudModal(null); }} />}
    </div>
  );
}

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

  const loginCSS = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    .login-page{min-height:100vh;display:grid;grid-template-columns:minmax(0,1fr) 560px;background:#FFFFFF;font-family:'IBM Plex Sans',sans-serif}
    .login-left{display:flex;flex-direction:column;justify-content:space-between;gap:48px;padding:56px 64px;background:#002247}
    .login-left-integra-img{height:52px;width:auto;object-fit:contain;display:block}
    .login-left-divider{width:100%;height:1px;background:rgba(255,255,255,.14);margin:24px 0}
    .login-left-company{display:flex;align-items:center;gap:14px}
    .login-left-company-logo{width:40px;height:40px;border-radius:4px;object-fit:contain;background:rgba(255,255,255,.14);padding:4px}
    .login-left-company-name{font:600 24px/1.25 'IBM Plex Sans',sans-serif;color:#fff}
    .login-left-line{width:56px;height:3px;background:#F8BC05;margin:24px 0}
    .login-left-sub{font:400 15px/1.55 'IBM Plex Sans',sans-serif;color:rgba(255,255,255,.82);max-width:420px}
    .login-right{display:flex;align-items:center;justify-content:center;padding:56px 64px;background:#FFFFFF}
    .login-card{width:100%;max-width:420px}
    .login-card-eyebrow{font:500 11px/1.2 'IBM Plex Mono',monospace;letter-spacing:.08em;color:#4A5560;text-transform:uppercase;margin-bottom:12px}
    .login-card-title{font:600 24px/1.25 'IBM Plex Sans',sans-serif;color:#082F4E;margin-bottom:8px}
    .login-card-sub{font:400 15px/1.55 'IBM Plex Sans',sans-serif;color:#4A5560;margin-bottom:28px}
    .login-fg{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
    .login-fg label{font:500 11px/1.2 'IBM Plex Mono',monospace;color:#4A5560;letter-spacing:.08em;text-transform:uppercase}
    .login-fg input{border:1px solid #C9D0D6;border-radius:4px;height:40px;padding:0 12px;font:400 14px/1.2 'IBM Plex Sans',sans-serif;color:#0F1419;background:#FFFFFF;outline:none}
    .login-fg input:focus{border-width:2px;border-color:#002247;padding:0 11px}
    .login-btn{width:100%;height:44px;padding:0 16px;margin-top:24px;background:#F8BC05;color:#002247;border:none;border-radius:4px;font:600 15px/1.2 'IBM Plex Sans',sans-serif;cursor:pointer}
    .login-btn:hover{background:#DCA704}
    .login-btn:disabled{background:#E4E8EC;color:#7A8792;cursor:not-allowed}
    .login-error{background:#FFFFFF;color:#0F1419;border:1px solid #E4E8EC;border-left:3px solid #B3261E;border-radius:4px;padding:12px 16px;font:400 13px/1.45 'IBM Plex Sans',sans-serif;margin-bottom:16px}
    .login-footer{font:500 11px/1.2 'IBM Plex Mono',monospace;color:#4A5560;margin-top:32px;letter-spacing:.06em}
    @media(max-width:900px){.login-page{grid-template-columns:1fr}.login-left{padding:40px 24px}.login-right{padding:40px 24px}}
  `;

  return (
    <>
      <style>{loginCSS}</style>
      <div className="login-page">
        <div className="login-left">
          <img src="/integra-logo-white-noclaim.svg" alt="INTEGRA" className="login-left-integra-img" />
          <div className="login-left-divider" />
          <div className="login-left-company">
            <img src="/PL.png" alt="PL Offshore" className="login-left-company-logo" />
            <div className="login-left-company-name">PL Offshore | Reparaciones</div>
          </div>
          <div className="login-left-line" />
          <div className="login-left-sub">We Find the Way, or We Make One.</div>
        </div>
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-eyebrow">PL Offshore | Reparaciones</div>
            <div className="login-card-title">Acceso al portal</div>
            <div className="login-card-sub">Solo personal autorizado</div>
            {error && <div className="login-error">{error}</div>}
            <div className="login-fg"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} placeholder="correo@paranalogistica.com.ar" autoFocus /></div>
            <div className="login-fg"><label>Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} placeholder="••••••••" /></div>
            <button className="login-btn" onClick={handleLogin} disabled={loading || !email || !password}>{loading ? "Ingresando..." : "Ingresar →"}</button>
            <div className="login-footer">PL Offshore · Reparaciones · Confidencial</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [navOpen, setNavOpen] = useState(true);
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

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#082F4E" }}>
        <style>{CSS}</style>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, textTransform: "uppercase" }}>Cargando...</div>
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  const Ico = ({ d, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  );
  const ICONS = {
    ship: <><path d="M4 17l1.6-5.4h12.8L20 17a10 10 0 0 1-16 0z" /><path d="M12 11.6V5.5M8.5 5.5h7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    grid: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9.5 4v16" /></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.3c-.7.4-1.1 1-1.1 1.7v.3" /><path d="M12 17.5h.01" /></>,
    back: <><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>,
  };

  const inicial = (userEmail || "U").replace(/@.*$/, "").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{CSS}</style>

      <header className="appbar">
        <img src="/integra-isotipo-white.svg" alt="INTEGRA" style={{ height: 26, width: "auto" }} onError={e => { e.currentTarget.style.display = "none"; }} />
        <span className="appbar-div" />
        <span className="appbar-instance">PL Offshore</span>
        <div className="appbar-tools">
          <span className="appbar-avatar">{inicial}</span>
          <span className="appbar-user">{userEmail || "Usuario"}</span>
          <button className="appbar-link" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <div className={`shell ${navOpen ? "" : "is-collapsed"}`} style={{ display: "grid", gridTemplateColumns: navOpen ? "248px minmax(0,1fr)" : "68px minmax(0,1fr)", minHeight: "calc(100vh - 56px)" }}>
        <nav className="sidebar">
          <div className="sidebar-header">
            <img src="/PL.png" alt="PL Offshore" className="sidebar-logo-img" onError={e => { e.currentTarget.style.display = "none"; }} />
            {navOpen && <div><div className="sidebar-logo-main">Reparaciones</div><div className="sidebar-logo-sub">PL Offshore</div></div>}
          </div>

          <div className="sidebar-nav">
            {navOpen && <div className="nav-section">Barcos</div>}
            {barcosPermitidos.map(b => (
              <button key={b} className={`ni ${barco === b ? "active" : ""}`} onClick={() => barcosPermitidos.length > 1 && setBarco(b)} title={b}>
                <span className="ni-ico"><Ico d={ICONS.ship} /></span>
                {navOpen && <span className="ni-label">{b}</span>}
              </button>
            ))}
            {navOpen && <div className="nav-section">Acciones</div>}
            <button className="ni" onClick={() => setNuevaModal(true)} title="Nueva solicitud">
              <span className="ni-ico"><Ico d={ICONS.plus} /></span>
              {navOpen && <span className="ni-label">Nueva solicitud</span>}
            </button>
            <button className="ni active" title="Panel de control">
              <span className="ni-ico"><Ico d={ICONS.grid} /></span>
              {navOpen && <span className="ni-label">Panel de control</span>}
            </button>
          </div>

          <div className="sidebar-foot">
            <button className="sidebar-foot-btn" onClick={() => setNavOpen(v => !v)}>
              <span style={{ display: "block", color: "var(--muted2)" }}><Ico d={ICONS.panel} size={16} /></span>
              {navOpen && <span style={{ flex: 1, textAlign: "left" }}>Colapsar menú</span>}
            </button>
            {navOpen && <div className="sidebar-foot-meta"><div>SSRR v1.5</div><div>POWERED BY INTEGRA</div></div>}
          </div>
        </nav>

        <div className="main">
          <div className="pagehead">
            <div className="crumb">
              <button onClick={() => window.open(ERP_URL, "_self")}>Portal</button>
              <span>/</span>
              <span className="crumb-current">Solicitudes de reparación</span>
            </div>
            <div className="pagehead-row">
              <div>
                <h1>{barco}</h1>
                <p>Solicitudes de reparación del barco, con estado, tipo y responsable técnico.</p>
              </div>
              <div className="pagehead-actions">
                <button className="btn btn-primary" onClick={() => setNuevaModal(true)}>Nueva solicitud</button>
              </div>
            </div>
          </div>

          <div className="content">
            <PagePanel key={`${barco}-${refreshKey}`} barco={barco} notify={notify} esBarco={esBarco} />
          </div>
        </div>
      </div>

      <nav className="mobile-nav">
        <div className={`mobile-nav-item ${page === "panel" ? "active" : ""}`} onClick={() => setPage("panel")}>
          <span className="mobile-nav-icon"><Ico d={ICONS.grid} size={18} /></span>
          <span className="mobile-nav-label">Panel</span>
        </div>
        <div className="mobile-nav-item" onClick={() => setNuevaModal(true)}>
          <span className="mobile-nav-icon"><Ico d={ICONS.plus} size={18} /></span>
          <span className="mobile-nav-label">Nueva</span>
        </div>
        {barcosPermitidos.length > 1 && barcosPermitidos.map(b => (
          <div key={b} className={`mobile-nav-item ${barco === b ? "active" : ""}`} onClick={() => setBarco(b)}>
            <span className="mobile-nav-icon"><Ico d={ICONS.ship} size={18} /></span>
            <span className="mobile-nav-label">{b.split(" ")[0]}</span>
          </div>
        ))}
        <div className="mobile-nav-item" onClick={() => window.open(ERP_URL, "_self")}>
          <span className="mobile-nav-icon"><Ico d={ICONS.back} size={18} /></span>
          <span className="mobile-nav-label">Portal</span>
        </div>
      </nav>

      {nuevaModal && <NuevaSolicitudModal barcoDefault={barco} onClose={() => setNuevaModal(false)} onSave={() => { setNuevaModal(false); setRefreshKey(k => k + 1); }} notify={notify} />}
      <Notif msg={notif} onClose={() => setNotif(null)} />
    </>
  );
}

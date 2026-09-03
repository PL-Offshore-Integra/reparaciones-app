import { useState, useEffect, useCallback } from "react";

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

const ERP_URL = "https://erp-portal-fawn.vercel.app";
const SUPABASE_URL = "https://mwrhonkvcyyueixbdrat.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cmhvbmt2Y3l5dWVpeGJkcmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTQ1NTMsImV4cCI6MjA5MjU3MDU1M30.LGtCgh7vedh16DATQtJMLBmfhzLwlj21sXsV43001IM";
const BARCO_POR_EMAIL = {
  "golondrinademar@ploffshore.com": "Golondrina de Mar",
  "atlanticdama@ploffshore.com": "Atlantic Dama",
};

const CSS = `

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{

  --navy:#213363;--blue:#235C96;--mid:#6381A7;--light:#A5B5CC;

  --bg:#F0F4F8;--surface:#FFF;--surface2:#F5F7FA;--border:#D6E0ED;

  --text:#213363;--muted:#6381A7;--muted2:#8FA3BC;--accent:#235C96;--accent2:#1E7E4A;

  --warn:#B07D0A;--danger:#C0392B;--purple:#6B4FA0;

  --sans:'Montserrat',sans-serif;--mono:'DM Mono',monospace;--r:6px;--r2:10px;

}

body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:14px;line-height:1.5;min-height:100vh}

.app{display:flex;min-height:100vh}

.sidebar{width:235px;min-width:235px;background:var(--navy);display:flex;flex-direction:column;box-shadow:2px 0 8px rgba(33,51,99,.15)}

.sidebar-header{border-bottom:1px solid rgba(255,255,255,.1)}

.sidebar-logo-wrap{padding:20px 18px 16px;display:flex;align-items:center;gap:12px}

.sidebar-logo{width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px}

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

.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:13px 28px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(33,51,99,.06)}

.topbar-title{font-size:12px;font-weight:600;letter-spacing:1px;color:var(--navy);text-transform:uppercase}

.content{flex:1;overflow-y:auto;padding:24px 28px;background:var(--bg)}

.badge{display:inline-flex;align-items:center;font-family:var(--mono);font-size:9px;font-weight:600;padding:3px 8px;border-radius:4px;white-space:nowrap;letter-spacing:.3px}

.b-amber{background:#FEF3C7;color:#92400E;border:1px solid #FDE68A}

.b-blue{background:#DBEAFE;color:#1E40AF;border:1px solid #BFDBFE}

.b-green{background:#D1FAE5;color:#065F46;border:1px solid #A7F3D0}

.b-purple{background:#EDE9FE;color:#4C1D95;border:1px solid #DDD6FE}

.b-gray{background:#F3F4F6;color:#6B7280;border:1px solid #E5E7EB}

.b-red{background:#FEE2E2;color:#991B1B;border:1px solid #FECACA}

.btn{display:inline-flex;align-items:center;gap:6px;font-family:var(--sans);font-size:11px;font-weight:600;letter-spacing:.3px;padding:7px 14px;border-radius:var(--r);border:1px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;text-transform:uppercase}

.btn-primary{background:var(--blue);color:#fff}.btn-primary:hover{background:var(--navy)}

.btn-ghost{background:transparent;color:var(--muted);border-color:var(--border)}.btn-ghost:hover{color:var(--text);background:var(--surface2)}

.btn-sm{padding:4px 10px;font-size:10px}

.btn:disabled{opacity:.4;cursor:not-allowed}

.overlay{position:fixed;inset:0;background:rgba(33,51,99,.5);display:flex;align-items:flex-start;justify-content:center;z-index:100;padding:20px;overflow-y:auto;animation:fadeIn .15s}

.modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:800px;margin:auto;animation:slideUp .2s;box-shadow:0 8px 32px rgba(33,51,99,.18)}

.modal-xl{max-width:1000px}

.mhdr{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 22px;border-bottom:1px solid var(--border);background:var(--surface2);border-radius:12px 12px 0 0}

.mtitle{font-size:13px;font-weight:700;letter-spacing:.5px;color:var(--navy)}

.mbody{padding:22px}

.mftr{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:var(--surface2);border-radius:0 0 12px 12px}

.mclose{background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer}

.mclose:hover{color:var(--navy)}

@keyframes fadeIn{from{opacity:0}to{opacity:1}}

@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}

.fg{display:flex;flex-direction:column;gap:5px}

.fg label{font-size:10px;color:var(--navy);letter-spacing:.5px;text-transform:uppercase;font-weight:600}

.fg input,.fg select,.fg textarea{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;padding:8px 10px;outline:none;transition:border-color .15s}

.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--blue)}

.fg textarea{resize:vertical;min-height:60px}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}

.form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px}

.form-section{font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--blue);text-transform:uppercase;margin:18px 0 12px;padding-bottom:6px;border-bottom:2px solid var(--light)}

.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:18px}

.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px}

.stat-label{font-size:10px;color:var(--muted);font-weight:600;letter-spacing:.5px;margin-bottom:6px;text-transform:uppercase}

.stat-value{font-family:var(--mono);font-size:24px;font-weight:600}

.filter-row{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center}

.filter-select{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:11px;padding:6px 10px;outline:none;cursor:pointer}

.filter-input{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:11px;padding:6px 10px;outline:none;min-width:200px}

.ssrr-card{background:var(--surface);border:2px solid var(--navy);border-radius:var(--r2);margin-bottom:14px;overflow:hidden}

.ssrr-hdr{padding:14px 18px;background:var(--navy);display:flex;align-items:center;justify-content:space-between;gap:12px}

.ssrr-hdr-main{flex:1;cursor:pointer;min-width:0}

.ssrr-hdr-main:hover .ssrr-num{color:#7EB8E8;text-decoration:underline}

.ssrr-num{font-family:var(--mono);font-size:16px;font-weight:700;color:#fff;transition:all .12s}

.ssrr-meta{font-size:12px;color:rgba(255,255,255,.7);margin-top:5px;font-family:var(--mono)}

.ssrr-expand{padding:4px 8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);cursor:pointer;color:#fff;font-size:12px;flex-shrink:0;border-radius:var(--r)}

.ssrr-expand:hover{background:rgba(255,255,255,.22)}

.items-table{width:100%;border-collapse:collapse}

.items-table th{font-size:9px;font-weight:600;letter-spacing:.5px;color:var(--muted);text-transform:uppercase;padding:8px 12px;text-align:left;border-bottom:1px solid var(--border);background:var(--surface2);white-space:nowrap}

.items-table td{padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;font-size:11px}

.items-table tr:last-child td{border-bottom:none}

.items-table tr:hover td{background:var(--surface2);cursor:pointer}

.item-num-cell{font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap}

.item-desc-cell{font-size:12px;color:var(--text);max-width:240px}

.item-obs-cell{font-size:10px;color:var(--muted);max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.item-remito{font-family:var(--mono);font-size:10px;color:var(--blue);font-weight:600}

.empty-state{text-align:center;padding:48px 20px;color:var(--muted);font-size:13px}

.loading{display:flex;align-items:center;justify-content:center;padding:48px;color:var(--muted);gap:10px;font-size:13px}

.spin{animation:spin 1s linear infinite}

@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.notif{position:fixed;bottom:20px;right:20px;background:var(--surface);border:1px solid var(--border);border-left-width:3px;border-radius:var(--r2);padding:12px 16px;font-size:13px;animation:slideUp .2s;z-index:300;max-width:340px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 16px rgba(33,51,99,.15)}

.n-green{border-left-color:var(--accent2)}.n-red{border-left-color:var(--danger)}.n-amber{border-left-color:var(--warn)}.n-blue{border-left-color:var(--blue)}

.info-box{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;font-size:12px}

.info-box.accent{border-left:3px solid var(--blue)}

.flex-gap{display:flex;gap:8px;align-items:center}

.flex-between{display:flex;justify-content:space-between;align-items:center}

.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}

.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}

`;



const fmtDate = d => d ? new Date(d + "T00:00:00").toLocaleDateString("es-AR") : "—";

const today = () => new Date().toISOString().split("T")[0];



const api = {

  async getSolicitudes(barco) {

    let q = supabase.from("ssrr_solicitudes").select("*, ssrr_items(*)").order("fecha_emision", { ascending: false }).order("numero", { ascending: false });

    if (barco) q = q.eq("barco", barco);

    const { data, error } = await q;

    if (error) throw error;

    return data || [];

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

    const { error } = await supabase.storage.from("remitos").upload(path, file, { upsert: true });

    if (error) throw error;

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

    } catch(e) { console.error("Error notificación:", e); }

  },

};



const ordenarSolicitudes = (sols) => [...sols].sort((a, b) => {

  const p = n => { const pts = (n||"0/0").split("/"); return {num:parseInt(pts[0])||0,anio:parseInt(pts[1])||0}; };

  const pa=p(a.numero),pb=p(b.numero);

  if(pa.anio!==pb.anio) return pb.anio-pa.anio;

  return pb.num-pa.num;

});

const ordenarItems = (items) => [...items].sort((a,b) => {

  const n = s => { const pts=(s||"").split("-"); return parseInt(pts[pts.length-1])||0; };

  return n(a.numero_item)-n(b.numero_item);

});



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



function BadgeEstado({ estado }) {

  const e = ESTADOS[estado] || { label: estado, color: "b-gray" };

  return <span className={`badge ${e.color}`}>{e.label}</span>;

}


function BadgeArea({ area }) {
  if (!area) return null;
  return <span className={`badge ${area==="Cubierta"?"b-teal":"b-purple"}`}>{area}</span>;
}
function BadgeTipoRep({ tipo }) {
  if (!tipo) return null;
  return <span className={`badge ${tipo==="Correctiva"?"b-red":"b-green"}`}>{tipo}</span>;
}
function ToggleGroup({ label, options, value, onChange, colorClass }) {
  return (
    <div className="fg">
      {label && <label>{label}</label>}
      <div className="toggle-group">
        {options.map(opt => (
          <button key={opt} className={`toggle-btn ${value===opt?`selected ${colorClass?.[opt]||""}`:""}`} onClick={() => onChange(opt)} type="button">{opt}</button>
        ))}
      </div>
    </div>
  );
}

function ModalCumplir({ item, onClose, onSave, notify }) {
  const [form, setForm] = useState({ realizado_por:"", fecha_realizacion:today(), nro_remito:"" });
  const [archivo, setArchivo] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const handleSave = async () => {
    if (!form.realizado_por.trim()) return alert("Ingresá quién realizó el trabajo");
    setSaving(true);
    try {
      let adjunto_url = item.adjunto_url||null;
      if (archivo) adjunto_url = await api.subirAdjunto(item.id, archivo);
      await api.actualizarItem(item.id, {estado:"cumplido",realizado_por:form.realizado_por,fecha_realizacion:form.fecha_realizacion||null,nro_remito:form.nro_remito||null,adjunto_url});
      notify("Ítem marcado como cumplido","success"); onSave();
    } catch(err) { alert("Error: "+err.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()} style={{zIndex:200}}>
      <div className="modal" style={{maxWidth:480}}>
        <div className="mhdr" style={{background:"var(--navy)",borderRadius:"12px 12px 0 0"}}>
          <div><div className="mtitle" style={{color:"#fff"}}>Marcar como Cumplido</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:3}}>{item.numero_item} — {item.descripcion}</div></div>
          <button className="mclose" style={{color:"rgba(255,255,255,.7)"}} onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="fg mb12"><label>Realizado por *</label><input value={form.realizado_por} onChange={e=>set("realizado_por",e.target.value)} placeholder="Nombre / Empresa que realizó el trabajo" autoFocus /></div>
          <div className="form-grid">
            <div className="fg"><label>Fecha de realización</label><input type="date" value={form.fecha_realizacion} onChange={e=>set("fecha_realizacion",e.target.value)} /></div>
            <div className="fg"><label>N° de Remito</label><input value={form.nro_remito} onChange={e=>set("nro_remito",e.target.value)} placeholder="Ej: 1-16190" /></div>
          </div>
          <div className="fg">
            <label>Adjunto (remito, foto, etc.)</label>
            <div className="flex-gap">
              <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current.click()} type="button">📎 {archivo?archivo.name:"Seleccionar archivo"}</button>
              {archivo && <button onClick={()=>setArchivo(null)} style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:16}}>✕</button>}
            </div>
            <input ref={fileRef} type="file" style={{display:"none"}} onChange={e=>setArchivo(e.target.files[0]||null)} />
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-success" onClick={handleSave} disabled={saving}>{saving?"Guardando...":"✓ Confirmar cumplimiento"}</button>
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
    const file = e.target.files[0]; if (!file) return;
    setLoading(true);
    try { const url=await api.subirAdjunto(item.id,file); await api.actualizarItem(item.id,{adjunto_url:url}); notify("Adjunto subido","success"); onUpdated(); }
    catch(err) { alert("Error: "+err.message); }
    finally { setLoading(false); fileRef.current.value=""; }
  };
  const handleEliminar = async (e) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el ítem ${item.numero_item}?\n\n"${item.descripcion}"\n\nEsta acción no se puede deshacer.`)) return;
    setLoading(true);
    try { await api.eliminarItem(item.id); notify("Ítem eliminado","warn"); onEliminar(); }
    catch(err) { alert("Error: "+err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="item-card-actions" onClick={e=>e.stopPropagation()}>
      {item.estado!=="cumplido"&&<button className="cumplir-btn" onClick={()=>setModalCumplir(true)} disabled={loading}>✓ Cumplido</button>}
      <button className={`clip-btn ${item.adjunto_url?"has-file":""}`} onClick={()=>fileRef.current.click()} disabled={loading} title="Subir adjunto">📎</button>
      <button className="clip-btn" onClick={handleEliminar} disabled={loading} title="Eliminar ítem" style={{color:"var(--danger)",borderColor:"var(--danger)"}}>🗑</button>
      <input ref={fileRef} type="file" style={{display:"none"}} onChange={handleFileChange} />
      {modalCumplir&&<ModalCumplir item={item} notify={notify} onClose={()=>setModalCumplir(false)} onSave={()=>{setModalCumplir(false);onUpdated();}} />}
    </div>
  );
}

function SolicitudModal({ sol, onClose, onItemSaved, esBarco, notify }) {
  const [itemModal, setItemModal] = useState(null);
  const [items, setItems] = useState(ordenarItems(sol.ssrr_items||[]));
  const pendientes=items.filter(it=>it.estado==="pendiente").length;
  const enProceso=items.filter(it=>it.estado==="en_proceso").length;
  const cumplidos=items.filter(it=>it.estado==="cumplido").length;
  const handleItemUpdated = async () => {
    const {data} = await supabase.from("ssrr_items").select("*").eq("solicitud_id",sol.id);
    if (data) setItems(ordenarItems(data));
    onItemSaved();
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-xxl">
        <div className="mhdr" style={{background:"var(--navy)",borderRadius:"12px 12px 0 0"}}>
          <div>
            <div className="flex-gap mb8">
              <div className="mtitle" style={{color:"#fff",fontSize:16}}>SSRR N° {sol.numero}</div>
              {sol.area&&<BadgeArea area={sol.area} />}
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)",fontFamily:"var(--mono)"}}>{sol.barco} · Emitida: {fmtDate(sol.fecha_emision)} · Por: {sol.emitido_por}</div>
          </div>
          <button className="mclose" style={{color:"rgba(255,255,255,.7)"}} onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="detail-grid">
            <div className="detail-field"><div className="detail-label">Barco</div><div className="detail-value">{sol.barco}</div></div>
            <div className="detail-field"><div className="detail-label">Área</div><div className="detail-value">{sol.area?<BadgeArea area={sol.area}/>:"—"}</div></div>
            <div className="detail-field"><div className="detail-label">N° Solicitud</div><div className="detail-value" style={{fontFamily:"var(--mono)"}}>{sol.numero}</div></div>
            <div className="detail-field"><div className="detail-label">Fecha emisión</div><div className="detail-value">{fmtDate(sol.fecha_emision)}</div></div>
            <div className="detail-field"><div className="detail-label">Emitido por</div><div className="detail-value">{sol.emitido_por}</div></div>
            <div className="detail-field">
              <div className="detail-label">Resumen</div>
              <div className="flex-gap mt8">
                {pendientes>0&&<span className="badge b-amber">{pendientes} pend.</span>}
                {enProceso>0&&<span className="badge b-blue">{enProceso} en proc.</span>}
                {cumplidos>0&&<span className="badge b-green">{cumplidos} cumpl.</span>}
              </div>
            </div>
          </div>
          <div className="form-section">Ítems de la solicitud</div>
          {items.map(it=>(
            <div key={it.id} className="item-card" style={{cursor:esBarco?"default":"pointer"}} onClick={!esBarco?()=>setItemModal(it):undefined}>
              <div className="item-card-header">
                <span className="item-card-num">{it.numero_item}</span>
                <span className="item-card-desc">{it.descripcion}</span>
                {it.sistema&&<span className="badge b-blue" style={{fontSize:9}}>{it.sistema}</span>}
                {it.tipo_reparacion&&<BadgeTipoRep tipo={it.tipo_reparacion}/>}
                <BadgeEstado estado={it.estado}/>
                {esBarco&&<ItemAccionesBarco item={it} notify={notify} onUpdated={handleItemUpdated} onEliminar={handleItemUpdated}/>}
              </div>
              {(it.obs_capitan||it.obs_superintendente||it.realizado_por||it.nro_remito||it.adjunto_url)&&(
                <div className="item-card-body">
                  {it.obs_capitan&&<div className="item-card-field"><div className="item-card-label">Obs. CAP/JDM</div><div className="item-card-value">{it.obs_capitan}</div></div>}
                  {it.obs_superintendente&&<div className="item-card-field"><div className="item-card-label">Obs. Super.</div><div className="item-card-value">{it.obs_superintendente}</div></div>}
                  {it.realizado_por&&<div className="item-card-field"><div className="item-card-label">Realizado por</div><div className="item-card-value">{it.realizado_por}{it.tipo_realizacion?` (${it.tipo_realizacion})`:""}</div></div>}
                  {it.fecha_realizacion&&<div className="item-card-field"><div className="item-card-label">Fecha realización</div><div className="item-card-value">{fmtDate(it.fecha_realizacion)}</div></div>}
                  {it.nro_remito&&<div className="item-card-field"><div className="item-card-label">N° Remito</div><div className="item-card-value" style={{fontFamily:"var(--mono)",color:"var(--blue)"}}>{it.nro_remito}</div></div>}
                  {it.adjunto_url&&<div className="item-card-field"><div className="item-card-label">Adjunto</div><a href={it.adjunto_url} target="_blank" rel="noreferrer" className="adjunto-link" onClick={e=>e.stopPropagation()}>📎 Ver archivo →</a></div>}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mftr"><button className="btn btn-ghost" onClick={onClose}>Cerrar</button></div>
      </div>
      {itemModal&&<ItemModal item={itemModal} esBarco={esBarco} onClose={()=>setItemModal(null)} onSave={()=>{setItemModal(null);handleItemUpdated();}} notify={notify}/>}
    </div>
  );
}




function ItemModal({ item, onClose, onSave }) {

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

          <div>

            <div className="mtitle">Ítem {item.numero_item}</div>

            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{item.descripcion}</div>

          </div>

          <button className="mclose" onClick={onClose}>✕</button>

        </div>

        <div className="mbody">

          <div className="form-grid">

            <FG label="Estado *">

              <select value={form.estado} onChange={e => set("estado", e.target.value)}>

                {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}

              </select>

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

          <FG label="Observaciones del Superintendente" full>

            <textarea value={form.obs_superintendente || ""} onChange={e => set("obs_superintendente", e.target.value)} placeholder="Comentarios del superintendente técnico..." />

          </FG>

        </div>

        <div className="mftr">

          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>

        </div>

      </div>

    </div>

  );

}



function NuevaSolicitudModal({ barcoDefault, onClose, onSave, notify }) {

  const [form, setForm] = useState({

    barco: barcoDefault || "Golondrina de Mar",

    numero: "", fecha_emision: today(), emitido_por: "", observaciones_generales: "",

  });

  const [items, setItems] = useState([{ id: 1, descripcion: "", obs_capitan: "" }]);

  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));



  const addItem = () => setItems(prev => [...prev, { id: Date.now(), descripcion: "", obs_capitan: "" }]);

  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id));

  const updateItem = (id, k, v) => setItems(prev => prev.map(it => it.id === id ? { ...it, [k]: v } : it));



  const handleSave = async () => {

    if (!form.numero.trim()) return alert("Ingresá el número de solicitud");

    if (!form.emitido_por.trim()) return alert("Ingresá quién emite la solicitud");

    const itemsValidos = items.filter(it => it.descripcion.trim());

    if (!itemsValidos.length) return alert("Agregá al menos un ítem con descripción");

    setSaving(true);

    try {

      const sol = await api.crearSolicitud({ ...form, status: "abierta" });

      await api.crearItems(itemsValidos.map((it, i) => ({

        solicitud_id: sol.id,

        numero_item: `${form.numero}-${i + 1}`,

        descripcion: it.descripcion,

        obs_capitan: it.obs_capitan || null,

        estado: "pendiente",

      })));

      notify("SSRR creada correctamente", "success");

      onSave();

    } catch (e) { alert("Error: " + e.message); }

    finally { setSaving(false); }

  };



  return (

    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="modal modal-xl">

        <div className="mhdr" style={{background:"var(--navy)",borderRadius:"12px 12px 0 0"}}>

          <div className="mtitle" style={{color:"#fff"}}>Nueva Solicitud de Reparación</div>

          <button className="mclose" style={{color:"rgba(255,255,255,.7)"}} onClick={onClose}>✕</button>

        </div>

        <div className="mbody">

          <div className="form-section">Datos de la solicitud</div>

          <div className="form-grid-3">

            <FG label="Barco *">

              <select value={form.barco} onChange={e => set("barco", e.target.value)}>

                {BARCOS.map(b => <option key={b}>{b}</option>)}

              </select>

            </FG>

            <FG label="N° de solicitud *" hint="Ej: 06-2025">

              <input value={form.numero} onChange={e => set("numero", e.target.value)} placeholder="Ej: 06-2025" />

            </FG>

            <FG label="Fecha de emisión *">

              <input type="date" value={form.fecha_emision} onChange={e => set("fecha_emision", e.target.value)} />

            </FG>

          </div>

          <FG label="Emitido por (JDM / Capitán) *">

            <input value={form.emitido_por} onChange={e => set("emitido_por", e.target.value)} placeholder="Nombre del responsable" />

          </FG>

          <FG label="Observaciones generales" full>

            <textarea value={form.observaciones_generales} onChange={e => set("observaciones_generales", e.target.value)} placeholder="Observaciones generales..." style={{ marginTop: 8 }} />

          </FG>



          <div className="form-section">Ítems a reparar</div>

          <div style={{background:"var(--navy)",color:"#fff",borderRadius:"var(--r)",padding:"10px 14px",marginBottom:12,fontSize:13,fontWeight:500}}>ℹ️ Agregá cada punto de reparación. El número de ítem se asigna automáticamente.</div>



          {items.map((it, i) => (

            <div key={it.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 8 }}>

              <div className="flex-between mb8">

                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{form.numero || "XX"}-{i + 1}</span>

                {items.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => removeItem(it.id)} style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>✕</button>}

              </div>

              <div className="form-grid">

                <FG label="Descripción *" full><input value={it.descripcion} onChange={e=>updateItem(it.id,"descripcion",e.target.value)} placeholder="Descripción del trabajo a realizar..."/></FG>

                <FG label="Sistema *" full>

                  <select value={it.sistema||""} onChange={e=>updateItem(it.id,"sistema",e.target.value)} style={{borderColor:!it.sistema?"var(--warn)":"var(--border)"}}>

                    <option value="">— Seleccioná el sistema —</option>

                    {SISTEMAS.map(s=><option key={s}>{s}</option>)}

                  </select>

                </FG>

                <ToggleGroup label="Tipo de reparación" options={TIPOS_REPARACION} value={it.tipo_reparacion||""} onChange={v=>updateItem(it.id,"tipo_reparacion",v)} colorClass={{Correctiva:"correctiva",Preventiva:"preventiva"}}/>

                <FG label="Observaciones del JDM/Capitán" full><input value={it.obs_capitan||""} onChange={e=>updateItem(it.id,"obs_capitan",e.target.value)} placeholder="Observaciones opcionales..."/></FG>

                <FG label="Adjunto (foto, documento)" full>

                  <div className="flex-gap">

                    <label style={{display:"inline-flex",alignItems:"center",gap:8,height:36,padding:"0 14px",borderRadius:"var(--r)",border:"1px solid var(--border)",background:"var(--surface)",cursor:"pointer",fontSize:13,color:"var(--muted)",fontFamily:"var(--sans)",fontWeight:500}}>

                      📎 {it.archivo?it.archivo.name:"Seleccionar archivo"}

                      <input type="file" style={{display:"none"}} onChange={e=>updateItem(it.id,"archivo",e.target.files[0]||null)}/>

                    </label>

                    {it.archivo&&<button onClick={()=>updateItem(it.id,"archivo",null)} style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:16}}>✕</button>}

                  </div>

                </FG>

              </div>

            </div>

          ))}

          <button className="btn btn-primary mt8" onClick={addItem} style={{width:"100%",justifyContent:"center"}}>+ Agregar ítem</button>

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

  const items = ordenarItems(sol.ssrr_items || []);

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

            {pendientes > 0 && <span className="badge" style={{ background:"rgba(255,255,255,.15)", color:"#FFD580", border:"1px solid rgba(255,213,128,.4)" }}>{pendientes} pendiente{pendientes > 1 ? "s" : ""}</span>}

            {enProceso > 0 && <span className="badge" style={{ background:"rgba(255,255,255,.15)", color:"#7EB8E8", border:"1px solid rgba(126,184,232,.4)" }}>{enProceso} en proceso</span>}

          </div>

          <div className="ssrr-meta">Emitida: {fmtDate(sol.fecha_emision)} · Por: {sol.emitido_por} · {sol.barco}</div>

        </div>

        <div className="flex-gap">

          <span style={{ fontSize:11, color:"rgba(255,255,255,.7)", fontFamily:"var(--mono)" }}>{items.length} ítem{items.length !== 1 ? "s" : ""}</span>

          {esBarco && <button className="ssrr-expand" onClick={handleEliminarSol} disabled={loadingDel} title="Eliminar solicitud" style={{ color:"#FFB3AE", borderColor:"rgba(255,179,174,.4)" }}>🗑</button>}

          <button className="ssrr-expand" onClick={() => setExpanded(!expanded)}>{expanded ? "▲" : "▼"}</button>

        </div>

      </div>

      {expanded && (

        <div style={{ overflowX:"auto" }}>

          <table className="items-table">

            <thead>

              <tr>

                <th style={{ width:70 }}>N°</th>

                <th>Descripción</th>

                <th style={{ width:120 }}>Sistema</th>

                <th style={{ width:100 }}>Estado</th>

                <th style={{ width:95 }}>Fecha real.</th>

                <th style={{ width:130 }}>Quién realizó</th>

                <th style={{ width:90 }}>N° Remito</th>

                <th style={{ width:110 }}>Obs. CAP/JDM</th>

                {!esBarco && <th style={{ width:120 }}>Obs. Super.</th>}

                <th style={{ width:80 }}>Adjunto</th>

                {esBarco && <th style={{ width:130 }}>Acciones</th>}

              </tr>

            </thead>

            <tbody>

              {items.length === 0

                ? <tr><td colSpan={esBarco ? 9 : 10} style={{ textAlign:"center", padding:20, color:"var(--muted2)" }}>Sin ítems</td></tr>

                : items.map(it => (

                  <tr key={it.id} onClick={!esBarco ? () => onItemClick(it) : undefined} style={{ cursor: esBarco ? "default" : "pointer" }}>

                    <td className="item-num-cell">{it.numero_item}</td>

                    <td className="item-desc-cell">{it.descripcion}</td>

                    <td style={{ fontSize:10, color:"var(--muted)" }}>{it.sistema || "—"}</td>

                    <td><BadgeEstado estado={it.estado} /></td>

                    <td style={{ fontSize:10, color:"var(--muted)", fontFamily:"var(--mono)" }}>{fmtDate(it.fecha_realizacion)}</td>

                    <td style={{ fontSize:10, color:"var(--muted)" }}>{it.realizado_por ? `${it.realizado_por}${it.tipo_realizacion ? ` (${it.tipo_realizacion})` : ""}` : "—"}</td>

                    <td className="item-remito">{it.nro_remito || "—"}</td>

                    <td className="item-obs-cell">{it.obs_capitan || "—"}</td>

                    {!esBarco && <td className="item-obs-cell">{it.obs_superintendente || "—"}</td>}

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

  const counts = {

    total: todosItems.length,

    pendiente: todosItems.filter(it => it.estado === "pendiente").length,

    en_proceso: todosItems.filter(it => it.estado === "en_proceso").length,

    cumplido: todosItems.filter(it => it.estado === "cumplido").length,

    anulado: todosItems.filter(it => it.estado === "anulado").length,

  };



  const handleStatClick = (estado) => { setFiltroEstado(prev => prev === estado ? "" : estado); setBusqueda(""); };



  const solFiltradas = solicitudes.map(sol => {

    let items = ordenarItems(sol.ssrr_items || []);

    if (filtroEstado) items = items.filter(it => it.estado === filtroEstado);

    if (busqueda) { const q = busqueda.toLowerCase(); if (!sol.numero?.toLowerCase().includes(q)) items = items.filter(it => it.descripcion?.toLowerCase().includes(q)); }

    return { ...sol, ssrr_items: items };

  }).filter(sol => sol.ssrr_items.length > 0);



  return (

    <div>

      <div className="stats">

        <div className="stat" style={{ background:"#EEF4FB", borderColor:"#C5D8EE", cursor:"pointer" }} onClick={() => { setFiltroEstado(""); setBusqueda(""); }}>

          <div className="stat-label">Total ítems</div><div className="stat-value" style={{ color:"var(--blue)" }}>{counts.total}</div>

        </div>

        <div className="stat" onClick={() => handleStatClick("pendiente")} style={{ background:filtroEstado==="pendiente"?"#F5E6D0":"#FEF3C7", borderColor:filtroEstado==="pendiente"?"#D4943A":"#FDE68A", cursor:"pointer", outline:filtroEstado==="pendiente"?"2px solid var(--warn)":"none" }}>

          <div className="stat-label">Pendientes</div><div className="stat-value" style={{ color:"var(--warn)" }}>{counts.pendiente}</div>

        </div>

        <div className="stat" onClick={() => handleStatClick("en_proceso")} style={{ background:filtroEstado==="en_proceso"?"#DBEAFE":"#EFF6FF", borderColor:filtroEstado==="en_proceso"?"#3B82F6":"#BFDBFE", cursor:"pointer", outline:filtroEstado==="en_proceso"?"2px solid var(--blue)":"none" }}>

          <div className="stat-label">En proceso</div><div className="stat-value" style={{ color:"var(--blue)" }}>{counts.en_proceso}</div>

        </div>

        <div className="stat" onClick={() => handleStatClick("cumplido")} style={{ background:filtroEstado==="cumplido"?"#D1FAE5":"#ECFDF5", borderColor:filtroEstado==="cumplido"?"#10B981":"#A7F3D0", cursor:"pointer", outline:filtroEstado==="cumplido"?"2px solid var(--accent2)":"none" }}>

          <div className="stat-label">Cumplidos</div><div className="stat-value" style={{ color:"var(--accent2)" }}>{counts.cumplido}</div>

        </div>

        <div className="stat" onClick={() => handleStatClick("anulado")} style={{ background:filtroEstado==="anulado"?"#E5E7EB":"#F9FAFB", borderColor:filtroEstado==="anulado"?"#9CA3AF":"#E5E7EB", cursor:"pointer", outline:filtroEstado==="anulado"?"2px solid var(--muted)":"none" }}>

          <div className="stat-label">Anulados</div><div className="stat-value" style={{ color:"var(--muted)" }}>{counts.anulado}</div>

        </div>

      </div>



      <div className="filter-row">

        <input className="filter-input" placeholder="🔍 Buscar ítem o N° SSRR..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

        <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>

          <option value="">Todos los estados</option>

          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}

        </select>

        {(filtroEstado || busqueda) && <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroEstado(""); setBusqueda(""); }}>✕ Limpiar</button>}

        <span style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontSize:11, color:"var(--muted)" }}>{solFiltradas.length} solicitudes</span>

      </div>



      {loading ? <div className="loading"><span className="spin">◌</span> Cargando...</div> :

        solFiltradas.length === 0 ? <div className="empty-state"><div style={{ fontSize:28, marginBottom:8 }}>🔧</div>Sin solicitudes registradas</div> :

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

  const handleKey = e => { if (e.key === "Enter") handleLogin(); };

  return (

    <>

      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--navy)" }}>

        <div style={{ background:"var(--surface)", borderRadius:12, padding:"40px 36px", width:"100%", maxWidth:420, boxShadow:"0 8px 32px rgba(33,51,99,.25)" }}>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>

            <div style={{ width:40, height:40, background:"var(--navy)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔧</div>

            <div><div style={{ fontWeight:700, fontSize:14, letterSpacing:1, color:"var(--navy)", textTransform:"uppercase" }}>Reparaciones</div><div style={{ fontSize:10, color:"var(--muted)", letterSpacing:.5 }}>PL Offshore · Terra Mare Group</div></div>

          </div>

          {error && <div style={{ background:"#FEE2E2", border:"1px solid #FECACA", borderLeft:"3px solid var(--danger)", borderRadius:"var(--r)", padding:"10px 14px", fontSize:13, color:"var(--danger)", marginBottom:16 }}>{error}</div>}

          <div className="fg" style={{ marginBottom:14 }}><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={handleKey} placeholder="correo@ploffshore.com" autoFocus /></div>

          <div className="fg" style={{ marginBottom:24 }}><label>Contraseña</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKey} placeholder="••••••••" /></div>

          <button className="btn btn-primary" onClick={handleLogin} disabled={loading||!email||!password} style={{ width:"100%", justifyContent:"center", height:42, fontSize:13 }}>{loading?"Ingresando...":"Ingresar →"}</button>

          <div style={{ fontFamily:"var(--mono)", fontSize:9, color:"var(--muted2)", marginTop:24, textAlign:"center", letterSpacing:1 }}>PL Offshore · Reparaciones · Confidencial</div>

        </div>

      </div>

    </>

  );

}



export default function App() {
  const [session, setSession] = useState(undefined);
  const [userEmail, setUserEmail] = useState("");
  const [barcosPermitidos, setBarcosPermitidos] = useState(BARCOS);
  const [barco, setBarco] = useState("Golondrina de Mar");
  const [esBarco, setEsBarco] = useState(false);
  const [notif, setNotif] = useState(null);
  const [nuevaModal, setNuevaModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const setupSession = (sess) => {
    setSession(sess);
    if (sess) {
      const email = sess.user.email;
      setUserEmail(email);
      const barcoDelUsuario = BARCO_POR_EMAIL[email];
      if (barcoDelUsuario) { setBarcosPermitidos([barcoDelUsuario]); setBarco(barcoDelUsuario); setEsBarco(true); }
      else { setBarcosPermitidos(BARCOS); setBarco(BARCOS[0]); setEsBarco(false); }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setupSession(session || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setupSession(session || null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setUserEmail(""); setEsBarco(false); };
  const handleCambiarUsuario = async () => { await supabase.auth.signOut(); setSession(null); setUserEmail(""); setEsBarco(false); };

  const notify = useCallback((text, type = "info") => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 4000);
  }, []);

  if (session === undefined) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--navy)" }}>
      <style>{CSS}</style>
      <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"rgba(255,255,255,.3)", letterSpacing:3, textTransform:"uppercase" }}>Cargando...</div>
    </div>
  );

  if (!session) return <LoginScreen />;

  const inicial = (userEmail || "U").replace(/@.*$/, "").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo-wrap">
              <div className="sidebar-logo">🔧</div>
              <div><div className="sidebar-logo-main">Reparaciones</div><div className="sidebar-logo-sub">PL Offshore</div></div>
            </div>
          </div>

          <div className="nav-section">Barcos</div>
          {barcosPermitidos.map(b => (
            <button key={b} className={`ni ${barco === b ? "active" : ""}`} onClick={() => barcosPermitidos.length > 1 && setBarco(b)}>
              <span className="ni-icon">🚢</span><span style={{ fontSize:11 }}>{b}</span>
            </button>
          ))}

          <div className="nav-section">Acciones</div>
          <button className="ni nueva" onClick={() => setNuevaModal(true)}>
            <span className="ni-icon">+</span><span>Nueva SSRR</span>
          </button>
          <button className="ni active">
            <span className="ni-icon">▦</span><span>Panel de control</span>
          </button>

          <div style={{ flex:1 }} />

          <div className="sidebar-foot">
            <button className="sidebar-foot-btn" onClick={() => window.open(ERP_URL, "_self")}>
              <span className="ni-icon" style={{ fontSize:11 }}>←</span><span>Volver al ERP</span>
            </button>
            <button className="sidebar-foot-btn danger" onClick={handleCambiarUsuario}>
              <span className="ni-icon">⇄</span><span>Cambiar usuario</span>
            </button>
            <button className="sidebar-foot-btn danger" onClick={handleLogout}>
              <span className="ni-icon">⏻</span><span>Cerrar sesión</span>
            </button>
            <div className="sidebar-foot-meta"><div>{userEmail}</div><div style={{ marginTop:2 }}>SSRR v1.7</div></div>
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <div className="topbar-title">{barco} — Panel de control</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--blue)", fontWeight:700 }}>{inicial}</div>
              <span style={{ fontSize:12, color:"var(--muted)", fontWeight:500 }}>{esBarco ? barco : "Superintendente"}</span>
            </div>
          </div>
          <div className="content">
            <PagePanel key={`${barco}-${refreshKey}`} barco={barco} notify={notify} esBarco={esBarco} />
          </div>
        </div>
      </div>

      {nuevaModal && <NuevaSolicitudModal barcoDefault={barco} barcosPermitidos={barcosPermitidos} onClose={() => setNuevaModal(false)} onSave={() => { setNuevaModal(false); setRefreshKey(k => k + 1); }} notify={notify} />}
      <Notif msg={notif} onClose={() => setNotif(null)} />
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/* ─── Tab: Login ─────────────────────────────────────────────────── */
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") ?? "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Eroare la autentificare."); return; }
      router.push(from);
      router.refresh();
    } catch {
      setError("Nu s-a putut conecta la server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      <div className="form-group">
        <label htmlFor="login-email" className="form-label">Email</label>
        <input id="login-email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="form-control" placeholder="email@exemplu.com" />
      </div>

      <div className="form-group">
        <label htmlFor="login-password" className="form-label">Parolă</label>
        <div style={{ position: "relative" }}>
          <input id="login-password" type={showPass ? "text" : "password"} required
            autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control" placeholder="••••••••"
            style={{ paddingRight: "3rem" }} />
          <button type="button" onClick={() => setShowPass(v => !v)}
            aria-label={showPass ? "Ascunde" : "Arată"}
            style={{ position:"absolute", right:".75rem", top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", cursor:"pointer", fontSize:"1.1rem",
              color:"var(--text-muted)", padding:".25rem", lineHeight:1 }}>
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert"><span>⚠️</span>{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary"
        style={{ width:"100%", justifyContent:"center", padding:".75rem" }}>
        {loading ? "⏳ Se conectează..." : "Intră în cont →"}
      </button>

      <p style={{ textAlign:"center", fontSize:".875rem", color:"var(--text-muted)", margin:0 }}>
        Nu ai cont?{" "}
        <button type="button" onClick={onSwitch}
          style={{ background:"none", border:"none", cursor:"pointer",
            color:"var(--brand-600)", fontWeight:700, fontSize:".875rem", padding:0 }}>
          Înregistrează-te
        </button>
      </p>

      {/* Demo hint */}
      <div style={{ padding:".75rem 1rem", background:"var(--surface-50)",
        border:"1px dashed var(--surface-300)", borderRadius:"var(--radius-sm)",
        fontSize:".8rem", color:"var(--text-secondary)", lineHeight:1.6 }}>
        <strong style={{ color:"var(--text-primary)" }}>Conturi demo:</strong><br/>
        📧 <code>admin@example.com</code> · 🔑 <code>admin</code>
      </div>
    </form>
  );
}

/* ─── Tab: Înregistrare ──────────────────────────────────────────── */
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Parolele nu coincid."); return;
    }
    if (password.length < 4) {
      setError("Parola trebuie să aibă cel puțin 4 caractere."); return;
    }

    setLoading(true);
    try {
      // 1. Înregistrează contul
      const regRes  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, phone }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) { setError(regData.error ?? "Eroare la înregistrare."); return; }

      // 2. Autentifică automat
      const loginRes = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        setSuccess("Cont creat! Te redirecționăm...");
        setTimeout(() => { router.push("/"); router.refresh(); }, 800);
      } else {
        setSuccess("Cont creat cu succes! Te poți autentifica acum.");
        setTimeout(onSwitch, 1500);
      }
    } catch {
      setError("Nu s-a putut conecta la server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      <div className="form-group">
        <label htmlFor="reg-name" className="form-label">Nume complet</label>
        <input id="reg-name" type="text" required value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control" placeholder="ex. Maria Popescu" />
      </div>

      <div className="form-group">
        <label htmlFor="reg-email" className="form-label">Email</label>
        <input id="reg-email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control" placeholder="email@exemplu.com" />
      </div>

      <div className="form-group">
        <label htmlFor="reg-phone" className="form-label">
          Telefon <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, color:"var(--text-muted)" }}>(opțional)</span>
        </label>
        <input id="reg-phone" type="text" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="form-control" placeholder="+40 7xx xxx xxx" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".75rem" }}>
        <div className="form-group">
          <label htmlFor="reg-pass" className="form-label">Parolă</label>
          <div style={{ position:"relative" }}>
            <input id="reg-pass" type={showPass ? "text" : "password"} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="form-control" placeholder="min. 4 caractere"
              style={{ paddingRight:"2.75rem" }} />
            <button type="button" onClick={() => setShowPass(v => !v)}
              style={{ position:"absolute", right:".6rem", top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", fontSize:"1rem",
                color:"var(--text-muted)", padding:".2rem", lineHeight:1 }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="reg-confirm" className="form-label">Confirmă parola</label>
          <input id="reg-confirm" type={showPass ? "text" : "password"} required
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="form-control" placeholder="repetă parola"
            style={{ borderColor: confirm && confirm !== password ? "var(--danger-500)" : undefined }} />
        </div>
      </div>
      {confirm && confirm !== password && (
        <p style={{ fontSize:".8rem", color:"var(--danger-500)", margin:"-.5rem 0 0" }}>
          ⚠️ Parolele nu coincid
        </p>
      )}

      {/* Rol fix = student */}
      <div style={{ padding:".75rem 1rem", background:"var(--brand-50)",
        border:"1px solid var(--brand-200)", borderRadius:"var(--radius-sm)",
        fontSize:".8125rem", color:"var(--brand-700)", display:"flex", gap:".5rem", alignItems:"center" }}>
        📚 Contul va fi creat cu rolul <strong>Student</strong>
      </div>

      {error   && <div className="alert alert-error"   role="alert"><span>⚠️</span>{error}</div>}
      {success && <div className="alert alert-info"    role="status"><span>✅</span>{success}</div>}

      <button type="submit" disabled={loading} className="btn btn-success"
        style={{ width:"100%", justifyContent:"center", padding:".75rem" }}>
        {loading ? "⏳ Se creează contul..." : "✓ Creează cont"}
      </button>

      <p style={{ textAlign:"center", fontSize:".875rem", color:"var(--text-muted)", margin:0 }}>
        Ai deja cont?{" "}
        <button type="button" onClick={onSwitch}
          style={{ background:"none", border:"none", cursor:"pointer",
            color:"var(--brand-600)", fontWeight:700, fontSize:".875rem", padding:0 }}>
          Autentifică-te
        </button>
      </p>
    </form>
  );
}

/* ─── Layout principal ───────────────────────────────────────────── */
function AuthPanel() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div style={{ width:"100%", maxWidth:"440px" }}>
      {/* Tab switcher */}
      <div style={{ display:"flex", background:"var(--surface-100)",
        border:"1px solid var(--surface-200)", borderRadius:"var(--radius-md)",
        padding:".25rem", marginBottom:"1.75rem", gap:".25rem" }}>
        {(["login","register"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            style={{ flex:1, padding:".6rem .75rem", border:"none", cursor:"pointer",
              borderRadius:"calc(var(--radius-md) - 2px)", fontWeight:700, fontSize:".875rem",
              transition:"all var(--transition)",
              background: tab === t
                ? "linear-gradient(135deg, var(--brand-600), var(--brand-500))"
                : "transparent",
              color:  tab === t ? "#fff" : "var(--text-secondary)",
              boxShadow: tab === t ? "0 2px 8px rgba(99,102,241,.30)" : "none",
            }}>
            {t === "login" ? "🔑 Autentificare" : "✨ Cont nou"}
          </button>
        ))}
      </div>

      {/* Header */}
      <div style={{ marginBottom:"1.5rem" }}>
        <h2 style={{ fontSize:"1.75rem", fontWeight:900, letterSpacing:"-.04em",
          color:"var(--text-primary)", margin:"0 0 .3rem" }}>
          {tab === "login" ? "Bine ai venit! 👋" : "Alătură-te StudyBox 🎓"}
        </h2>
        <p style={{ color:"var(--text-secondary)", margin:0, fontSize:".9375rem" }}>
          {tab === "login"
            ? "Autentifică-te pentru a accesa platforma."
            : "Creează-ți un cont gratuit de student."}
        </p>
      </div>

      {/* Form card */}
      <div style={{ background:"var(--surface-0)", border:"1px solid var(--surface-200)",
        borderRadius:"var(--radius-lg)", padding:"1.75rem", boxShadow:"var(--shadow-md)" }}>
        {tab === "login"
          ? <LoginForm    onSwitch={() => setTab("register")} />
          : <RegisterForm onSwitch={() => setTab("login")} />
        }
      </div>

      <p style={{ textAlign:"center", marginTop:"1.25rem", fontSize:".8125rem", color:"var(--text-muted)" }}>
        © 2026 StudyBox · Platformă educațională
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr" }}>

      {/* ── Stânga — decorativ ───────────────────────── */}
      <div style={{ background:"linear-gradient(145deg, var(--brand-700) 0%, var(--accent-600) 100%)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"3rem", position:"relative", overflow:"hidden" }}>

        {[{ s:320, t:"-80px", l:"-80px", op:.12 }, { s:240, b:"-60px", r:"-60px", op:.10 },
          { s:160, t:"40%",   l:"60%",   op:.08 }].map((c, i) => (
          <div key={i} aria-hidden style={{ position:"absolute", width:c.s, height:c.s,
            borderRadius:"50%", background:`rgba(255,255,255,${c.op})`,
            ...(c.t ? { top:c.t }    : {}), ...(c.b ? { bottom:c.b } : {}),
            ...(c.l ? { left:c.l }   : {}), ...(c.r ? { right:c.r  } : {}) }} />
        ))}

        <div style={{ position:"relative", zIndex:1, textAlign:"center", color:"#fff" }}>
          <div style={{ width:"5rem", height:"5rem", borderRadius:"1.5rem",
            background:"rgba(255,255,255,.18)", backdropFilter:"blur(12px)",
            border:"1.5px solid rgba(255,255,255,.3)", display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:"2.5rem",
            margin:"0 auto 1.75rem", boxShadow:"0 8px 32px rgba(0,0,0,.2)" }}>
            🎓
          </div>

          <h1 style={{ fontSize:"2.5rem", fontWeight:900, letterSpacing:"-.04em",
            lineHeight:1.1, marginBottom:"1rem" }}>StudyBox</h1>

          <p style={{ fontSize:"1.0625rem", opacity:.8, lineHeight:1.7,
            maxWidth:"340px", margin:"0 auto 2.5rem" }}>
            Platforma educațională modernă pentru studenți,
            profesori și administratori.
          </p>

          {[
            { icon:"📚", text:"Creează-ți cont gratuit" },
            { icon:"🧠", text:"Accesează quiz-uri interactive" },
            { icon:"📈", text:"Urmărește progresul tău" },
            { icon:"💳", text:"Planuri de abonament flexibile" },
          ].map((f) => (
            <div key={f.text} style={{ display:"inline-flex", alignItems:"center", gap:".5rem",
              background:"rgba(255,255,255,.12)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,.2)", borderRadius:"999px",
              padding:".45rem 1rem", fontSize:".875rem", marginBottom:".6rem", marginRight:".5rem" }}>
              {f.icon} {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Dreapta — formular ───────────────────────── */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"2.5rem 2rem",
        background:"var(--surface-50)", overflowY:"auto" }}>
        <Suspense fallback={<div style={{ color:"var(--text-muted)" }}>Se încarcă...</div>}>
          <AuthPanel />
        </Suspense>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

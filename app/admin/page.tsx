
import Link from "next/link";
import { Suspense } from "react";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function AccountsStats() {
  const total          = await prisma.user.count();
  const withAccount    = await prisma.user.count({ where: { passwordHash: { not: null } } });
  const withoutAccount = total - withAccount;
  const activeUsers    = await prisma.user.count({ where: { active: true } });

  return (
    <div className="fade-up fade-up-3" style={{ marginBottom:"2rem" }}>
      <h2 style={{ fontSize:"1.125rem", fontWeight:800, color:"var(--text-primary)",
        margin:"0 0 1rem", letterSpacing:"-.02em" }}>
        📊 Statistici conturi
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:".875rem" }}>
        {[
          { label:"Utilizatori totali",    value:total,          icon:"👥", color:"var(--brand-500)"   },
          { label:"Cu cont înregistrat",   value:withAccount,    icon:"✅", color:"var(--success-500)" },
          { label:"Fără cont (doar admin)",value:withoutAccount, icon:"🔒", color:"var(--warning-500)" },
          { label:"Conturi active",         value:activeUsers,    icon:"🟢", color:"var(--accent-500)"  },
        ].map((s) => (
          <div key={s.label} style={{ background:"var(--surface-0)", border:"1px solid var(--surface-200)",
            borderRadius:"var(--radius-md)", padding:"1.125rem", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".5rem" }}>
              <span style={{ fontSize:"1.1rem" }}>{s.icon}</span>
              <span style={{ fontSize:".75rem", fontWeight:600, color:"var(--text-secondary)" }}>{s.label}</span>
            </div>
            <div style={{ fontSize:"1.875rem", fontWeight:900, color:s.color, lineHeight:1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function RecentAccounts() {
  const recent = await prisma.user.findMany({
    where:   { passwordHash: { not: null } },
    orderBy: { id: "desc" },
    take:    8,
    select:  { id:true, name:true, email:true, role:true, active:true },
  });

  if (recent.length === 0) return (
    <div style={{ padding:"1.5rem", textAlign:"center", color:"var(--text-muted)",
      background:"var(--surface-50)", borderRadius:"var(--radius-sm)",
      border:"1px dashed var(--surface-300)", fontSize:".9rem" }}>
      Niciun elev nu și-a creat cont încă.
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
      {recent.map((u) => {
        const initials = u.name.split(" ").map((w:string) => w[0]).slice(0,2).join("").toUpperCase();
        return (
          <Link key={u.id} href={`/users/${u.id}`}
            style={{ display:"flex", alignItems:"center", gap:".875rem",
              padding:".875rem 1rem", background:"var(--surface-0)",
              border:"1px solid var(--surface-200)", borderRadius:"var(--radius-sm)",
              textDecoration:"none", transition:"all var(--transition)" }}
            onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-400)"; (e.currentTarget as HTMLElement).style.background = "var(--brand-50)"; }}
            onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.borderColor = "var(--surface-200)"; (e.currentTarget as HTMLElement).style.background = "var(--surface-0)"; }}>
            <div className="avatar">{initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:"var(--text-primary)", fontSize:".9375rem" }}>{u.name}</div>
              <div style={{ fontSize:".8rem", color:"var(--text-muted)" }}>{u.email}</div>
            </div>
            <div style={{ display:"flex", gap:".5rem", alignItems:"center" }}>
              <span className={`badge ${u.role === "profesor" ? "badge-purple" : "badge-primary"}`}>
                {u.role === "profesor" ? "🎓 Profesor" : "📚 Student"}
              </span>
              <span className={`badge ${u.active ? "badge-success" : "badge-danger"}`}>
                {u.active ? "Activ" : "Inactiv"}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const cards = [
    {
      icon: "👥",
      title: "Utilizatori",
      desc: "Vizualizează, adaugă și modifică utilizatorii platformei educaționale.",
      href: "/users",
      cta: "Administrare utilizatori",
      accent: "#4f46e5",
      btnGradient: "linear-gradient(135deg, #4f46e5, #6366f1)",
      bg: "var(--brand-50)",
      borderColor: "rgba(99, 102, 241, 0.25)",
    },
    {
      icon: "💳",
      title: "Abonamente",
      desc: "Vizualizează abonamentele și atribuie planuri utilizatorilor platformei.",
      href: "/admin/subscriptions",
      cta: "Administrare abonamente",
      accent: "#9333ea",
      btnGradient: "linear-gradient(135deg, #9333ea, #a855f7)",
      bg: "var(--accent-50)",
      borderColor: "rgba(168, 85, 247, 0.25)",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="container-wide">

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".4rem",
              fontSize: ".75rem",
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--brand-500)",
              background: "var(--brand-50)",
              border: "1px solid var(--brand-200)",
              borderRadius: "999px",
              padding: ".3rem .9rem",
              marginBottom: "1rem",
            }}
          >
            ⚙️ StudyBox · Admin
          </span>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 900,
              color: "var(--text-primary)",
              margin: "0 0 .5rem",
              letterSpacing: "-.03em",
            }}
          >
            Panou de administrare
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", margin: 0, maxWidth: "520px" }}>
            Gestionează utilizatorii și abonamentele platformei
            educaționale dintr-un singur loc.
          </p>
        </div>

        {/* Action cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={`card fade-up fade-up-${i + 1}`}
              style={{
                borderTop: `4px solid ${card.accent}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* BG accent */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: card.bg,
                  opacity: .6,
                }}
              />

              <div className="card-body" style={{ position: "relative" }}>
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "14px",
                    background: card.bg,
                    border: `1.5px solid ${card.borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {card.icon}
                </div>

                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: "0 0 .5rem",
                    letterSpacing: "-.02em",
                  }}
                >
                  {card.title}
                </h2>

                <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", lineHeight: 1.6, fontSize: ".9375rem" }}>
                  {card.desc}
                </p>

                <Link
                  href={card.href}
                  className="btn"
                  style={{
                    background: card.btnGradient,
                    color: "#ffffff",
                    boxShadow: "0 4px 14px rgba(0,0,0,.15)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: ".5rem",
                    fontWeight: 600,
                  }}
                >
                  {card.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Stats conturi + utilizatori recenți înregistrați */}
        <Suspense fallback={<div className="skeleton" style={{ height:"200px", borderRadius:"var(--radius-lg)" }} />}>
          <AccountsStats />
        </Suspense>

        <div className="fade-up fade-up-4" style={{ marginBottom:"2rem" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:"1rem", gap:"1rem", flexWrap:"wrap" }}>
            <div>
              <h2 style={{ fontSize:"1.125rem", fontWeight:800, color:"var(--text-primary)",
                margin:"0 0 .2rem", letterSpacing:"-.02em" }}>
                👥 Conturi create de elevi
              </h2>
              <p style={{ color:"var(--text-muted)", margin:0, fontSize:".8125rem" }}>
                Utilizatori care și-au creat cont din pagina de autentificare
              </p>
            </div>
            <Link href="/users" className="btn btn-ghost btn-sm">
              Toți utilizatorii →
            </Link>
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height:"180px", borderRadius:"var(--radius-sm)" }} />}>
            <RecentAccounts />
          </Suspense>
        </div>

        {/* Quick nav */}
        <div
          className="fade-up fade-up-3"
          style={{
            background: "var(--surface-0)",
            border: "1px solid var(--surface-200)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: ".2rem" }}>
              Navigare rapidă
            </div>
            <div style={{ fontSize: ".875rem", color: "var(--text-muted)" }}>
              Accesează rapid secțiunile platformei
            </div>
          </div>
          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-ghost btn-sm">🏠 Acasă</Link>
            <Link href="/users" className="btn btn-ghost btn-sm">👥 Utilizatori</Link>
            <Link href="/users/create" className="btn btn-ghost btn-sm">➕ Utilizator nou</Link>
            <Link href="/admin/subscriptions/create" className="btn btn-ghost btn-sm">💳 Abonament nou</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

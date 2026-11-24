"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PlanKey = "Gratuit" | "Basic" | "Premium" | "Pro";

type PlanDefinition = {
  key: PlanKey;
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  icon: string;
  accent: string;
  popular?: boolean;
  features: string[];
};

const PLANS: PlanDefinition[] = [
  {
    key: "Gratuit",
    name: "Gratuit",
    price: "0",
    period: "pentru totdeauna",
    description: "Acces de bază pentru studiu individual și rezolvare de teste din comunitate.",
    icon: "🌱",
    accent: "var(--brand-500)",
    features: [
      "Rezolvare teste din comunitate",
      "Creare quiz-uri manuale nelimitate",
      "Salvare scor și rezultate personale",
      "Statistici de bază în cont",
    ],
  },
  {
    key: "Basic",
    name: "Student Basic",
    price: "29.99",
    period: "RON / lună",
    description: "Perfect pentru recapitulări rapide și generare automată de grile din PDF.",
    icon: "📦",
    accent: "#3b82f6",
    features: [
      "Tot ce este inclus în Gratuit",
      "Generare automată de quiz-uri din fișiere PDF",
      "Quiz-uri private și publice nelimitate",
      "Încărcare materiale până la 20 pagini",
      "Fără limitări de teste pe zi",
    ],
  },
  {
    key: "Premium",
    name: "Student Premium",
    badge: "Cel mai popular",
    popular: true,
    price: "59.99",
    period: "RON / lună",
    description: "Creat special pentru perioada examenelor, simulări și învățare accelerată.",
    icon: "⭐",
    accent: "var(--accent-500)",
    features: [
      "Tot ce este inclus în Basic",
      "Generare din cursuri voluminoase și cărți",
      "Explicații detaliate pentru fiecare variantă",
      "Statistici avansate pe capitole de studiu",
      "Prioritate la procesarea documentelor",
    ],
  },
  {
    key: "Pro",
    name: "Master Pro",
    price: "99.99",
    period: "RON / lună",
    description: "Pachetul complet pentru performanță academică maximă și asistență dedicată.",
    icon: "🚀",
    accent: "#8b5cf6",
    features: [
      "Tot ce este inclus în Premium",
      "Generare nelimitată din orice tip de material",
      "Export complet al quiz-urilor în PDF",
      "Suport dedicat 24/7 pentru întrebări",
      "Acces prioritar la toate noile instrumente AI",
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string>("Gratuit");
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState<string | null>(null);
  const [message, setMessage]         = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadCurrentPlan() {
      try {
        const res = await fetch("/api/subscriptions/my-plan");
        if (res.ok) {
          const data = await res.json();
          if (data?.plan) {
            setCurrentPlan(data.plan);
          }
        }
      } catch (err) {
        console.error("Nu s-a putut încărca planul:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentPlan();
  }, []);

  async function handleSelectPlan(planKey: PlanKey) {
    if (planKey === currentPlan) return;

    setUpdating(planKey);
    setMessage(null);

    try {
      const res = await fetch("/api/subscriptions/my-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Eroare la actualizarea planului.");
      }

      setCurrentPlan(planKey);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-refresh"));
      }
      setMessage({
        type: "success",
        text: `Felicitări! Planul tău a fost actualizat cu succes la ${planKey}.`,
      });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Nu s-a putut schimba planul.",
      });
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container-wide">
        {/* Link înapoi */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: ".4rem",
            fontSize: ".875rem",
            color: "var(--text-secondary)",
            textDecoration: "none",
            marginBottom: "1.75rem",
            fontWeight: 500,
          }}
        >
          ← Înapoi la panoul principal
        </Link>

        {/* Header secțiune */}
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3rem" }} className="fade-up">
          <span
            style={{
              display: "inline-block",
              background: "var(--brand-50)",
              color: "var(--brand-700)",
              borderRadius: "999px",
              padding: ".35rem 1rem",
              fontSize: ".8125rem",
              fontWeight: 700,
              letterSpacing: ".05em",
              textTransform: "uppercase",
              marginBottom: "1rem",
              border: "1px solid var(--brand-100)",
            }}
          >
            💳 Gestionare Abonament & Planuri
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-.03em",
              lineHeight: 1.15,
              margin: "0 0 1rem",
            }}
          >
            Alege planul potrivit pentru ritmul tău de studiu
          </h1>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Poți trece oricând la planul <strong>Gratuit</strong> sau la un plan superior cu un simplu click.
            Fără comisioane ascunse, control deplin direct din contul tău.
          </p>

          {/* Banner plan curent */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".75rem",
              background: "#fff",
              border: "1px solid var(--surface-200)",
              borderRadius: "var(--radius-md)",
              padding: ".75rem 1.5rem",
              marginTop: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span style={{ fontSize: ".875rem", color: "var(--text-secondary)" }}>
              Planul tău activ în acest moment:
            </span>
            <span className="badge badge-success" style={{ fontSize: ".875rem", padding: ".3rem .8rem" }}>
              ✓ {loading ? "Se încarcă..." : currentPlan}
            </span>
          </div>
        </div>

        {/* Mesaje alertă */}
        {message && (
          <div
            className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} fade-up`}
            style={{ maxWidth: "700px", margin: "0 auto 2.5rem" }}
          >
            <span>{message.type === "success" ? "🎉" : "⚠️"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Grile de prețuri */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
            alignItems: "stretch",
            marginBottom: "3.5rem",
          }}
        >
          {PLANS.map((plan) => {
            const isCurrent = currentPlan.toLowerCase() === plan.key.toLowerCase();
            const isBusy = updating === plan.key;

            return (
              <div
                key={plan.key}
                className="card fade-up"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRadius: "var(--radius-lg)",
                  border: isCurrent
                    ? "2.5px solid var(--brand-500)"
                    : plan.popular
                    ? "2px solid var(--accent-400)"
                    : "1px solid var(--surface-200)",
                  boxShadow: isCurrent
                    ? "0 10px 30px rgba(99,102,241,.18)"
                    : plan.popular
                    ? "0 8px 24px rgba(236,72,153,.12)"
                    : "var(--shadow-sm)",
                  background: isCurrent ? "linear-gradient(180deg, #faf5ff 0%, #fff 100%)" : "#fff",
                  transform: plan.popular ? "scale(1.02)" : "none",
                  transition: "all var(--transition)",
                }}
              >
                {/* Badge dacă e popular */}
                {plan.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, var(--accent-500), var(--brand-600))",
                      color: "#fff",
                      fontSize: ".6875rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      padding: ".3rem .9rem",
                      borderRadius: "999px",
                      boxShadow: "0 2px 8px rgba(236,72,153,.3)",
                    }}
                  >
                    ★ {plan.badge}
                  </div>
                )}

                <div className="card-body" style={{ padding: "2rem 1.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Icon & Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1rem" }}>
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "12px",
                        background: `${plan.accent}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                      }}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--brand-600)" }}>
                          ● Planul tău curent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preț */}
                  <div style={{ margin: "1rem 0 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: ".35rem" }}>
                      <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>
                        {plan.price}
                      </span>
                      {plan.key !== "Gratuit" && (
                        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          RON
                        </span>
                      )}
                      <span style={{ fontSize: ".875rem", color: "var(--text-muted)" }}>
                        / {plan.period}
                      </span>
                    </div>
                    <p style={{ fontSize: ".875rem", color: "var(--text-secondary)", margin: ".75rem 0 0", lineHeight: 1.5 }}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="divider" style={{ margin: "1.25rem 0" }} />

                  {/* Lista facilități */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: ".75rem", flex: 1 }}>
                    {plan.features.map((feat, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: ".6rem", fontSize: ".875rem", color: "var(--text-primary)" }}>
                        <span style={{ color: "var(--brand-600)", fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>✓</span>
                        <span style={{ lineHeight: 1.4 }}>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Buton acțiune */}
                  <div>
                    {isCurrent ? (
                      <button
                        type="button"
                        disabled
                        className="btn btn-ghost"
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          background: "var(--surface-100)",
                          color: "var(--text-secondary)",
                          fontWeight: 700,
                          cursor: "default",
                        }}
                      >
                        ✓ Planul tău activ
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={loading || isBusy}
                        onClick={() => handleSelectPlan(plan.key)}
                        className={`btn ${plan.key === "Gratuit" ? "btn-secondary" : "btn-primary"}`}
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {isBusy
                          ? "⏳ Se actualizează..."
                          : plan.key === "Gratuit"
                          ? "Activează Planul Gratuit"
                          : `Alege ${plan.name}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Întrebări frecvente / Secțiune informativă */}
        <div
          className="card fade-up"
          style={{
            padding: "2rem",
            background: "linear-gradient(135deg, var(--surface-50) 0%, #fff 100%)",
            border: "1px solid var(--surface-200)",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem" }}>
            💡 Întrebări frecvente despre abonamente
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <div>
              <h4 style={{ fontSize: ".9375rem", fontWeight: 700, margin: "0 0 .3rem", color: "var(--text-primary)" }}>
                Pot reveni oricând la planul Gratuit?
              </h4>
              <p style={{ margin: 0, fontSize: ".875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Da! Poți reveni oricând la planul Gratuit printr-un simplu click pe butonul „Activează Planul Gratuit”. Vei păstra în continuare accesul la toate quiz-urile tale deja create.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: ".9375rem", fontWeight: 700, margin: "0 0 .3rem", color: "var(--text-primary)" }}>
                Cât durează activarea unui plan nou?
              </h4>
              <p style={{ margin: 0, fontSize: ".875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Activarea este instantanee. Imediat ce apeși pe planul dorit, contul tău este actualizat și poți folosi direct toate funcționalitățile.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: ".9375rem", fontWeight: 700, margin: "0 0 .3rem", color: "var(--text-primary)" }}>
                Ce se întâmplă cu quiz-urile mele salvate?
              </h4>
              <p style={{ margin: 0, fontSize: ".875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Quiz-urile tale create (atât cele publice din comunitate, cât și cele private) rămân în siguranță în contul tău, indiferent de planul ales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

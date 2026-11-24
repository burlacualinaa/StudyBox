
import Link from "next/link";
import { Suspense } from "react";
import { getAllSubscriptions } from "../../../lib/subscriptionAccessor";

const PLAN_STYLES: Record<string, { badge: string; label: string }> = {
  Basic:   { badge: "badge-primary", label: "📦 Basic"   },
  Premium: { badge: "badge-warning", label: "⭐ Premium"  },
  Pro:     { badge: "badge-purple",  label: "🚀 Pro"      },
};

async function SubscriptionsList() {
  const subscriptions = await getAllSubscriptions();

  if (subscriptions.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">💳</span>
        <p>Nu există abonamente înregistrate.</p>
        <Link
          href="/admin/subscriptions/create"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Adaugă primul abonament
        </Link>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Utilizator</th>
            <th>Plan</th>
            <th>Preț</th>
            <th>Data start</th>
            <th>Expiră</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => {
            const planStyle = PLAN_STYLES[sub.plan] ?? { badge: "badge-gray", label: sub.plan };
            const startDate = new Date(sub.startDate).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const endDate = sub.endDate
              ? new Date(sub.endDate).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            const initials = sub.user.name
              .split(" ")
              .map((w: string) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <tr key={sub.id}>
                <td style={{ color: "var(--text-muted)", fontSize: ".8125rem", fontWeight: 500 }}>
                  #{sub.id}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                    <div className="avatar">{initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: ".9375rem" }}>
                        {sub.user.name}
                      </div>
                      <div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>
                        {sub.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${planStyle.badge}`}>{planStyle.label}</span>
                </td>
                <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {sub.price.toFixed(2)}{" "}
                  <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: ".8125rem" }}>RON</span>
                </td>
                <td style={{ color: "var(--text-secondary)", fontSize: ".875rem" }}>{startDate}</td>
                <td style={{ color: "var(--text-secondary)", fontSize: ".875rem" }}>
                  {endDate ?? (
                    <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>–</span>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${
                      sub.status === "active" ? "badge-success" : "badge-gray"
                    }`}
                  >
                    {sub.status === "active" ? "✓ Activ" : sub.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <div className="page-wrapper">
      <div className="container-wide">

        {/* Back */}
        <Link
          href="/admin"
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
          ← Înapoi la Admin
        </Link>

        {/* Header */}
        <div
          className="fade-up"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ display: "block", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-500)", marginBottom: ".4rem" }}>
              Admin
            </span>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                fontWeight: 900,
                color: "var(--text-primary)",
                margin: "0 0 .4rem",
                letterSpacing: "-.03em",
              }}
            >
              Abonamente
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: ".9375rem" }}>
              Gestionează abonamentele utilizatorilor StudyBox
            </p>
          </div>
          <Link href="/admin/subscriptions/create" className="btn btn-primary">
            + Adaugă abonament
          </Link>
        </div>

        {/* Table */}
        <div className="fade-up fade-up-1">
          <Suspense
            fallback={
              <div>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: "52px", marginBottom: ".75rem", borderRadius: "var(--radius-sm)" }}
                  />
                ))}
              </div>
            }
          >
            <SubscriptionsList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

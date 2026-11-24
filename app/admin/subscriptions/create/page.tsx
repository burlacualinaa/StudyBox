
import Link from "next/link";
import { Suspense } from "react";
import { getUsersForSubscription } from "../../../../lib/subscriptionAccessor";
import CreateSubscriptionForm from "./CreateSubscriptionForm";

async function CreateSubscriptionContent() {
  const users = await getUsersForSubscription();

  return (
    <div className="card fade-up fade-up-1">
      <div className="card-body">
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: "0 0 .35rem",
            letterSpacing: "-.02em",
          }}
        >
          Detalii abonament
        </h2>
        <p style={{ color: "var(--text-muted)", margin: "0 0 1.75rem", fontSize: ".9rem" }}>
          Completează informațiile pentru noul abonament.
        </p>

        {users.length === 0 ? (
          <div className="alert alert-warning">
            <span>⚠️</span>
            Nu există utilizatori disponibili.{" "}
            <Link href="/users/create" style={{ fontWeight: 600, color: "inherit" }}>
              Adaugă un utilizator →
            </Link>
          </div>
        ) : (
          <CreateSubscriptionForm users={users} />
        )}
      </div>
    </div>
  );
}

export default function CreateSubscriptionPage() {
  return (
    <div className="page-wrapper">
      <div className="container-narrow">

        {/* Back */}
        <Link
          href="/admin/subscriptions"
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
          ← Înapoi la abonamente
        </Link>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <span style={{ display: "block", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--accent-500)", marginBottom: ".4rem" }}>
            Admin · Abonamente
          </span>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              color: "var(--text-primary)",
              margin: "0 0 .4rem",
              letterSpacing: "-.03em",
            }}
          >
            Adaugă abonament
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Atribuie un plan de abonament unui utilizator StudyBox.
          </p>
        </div>

        {/* Form */}
        <Suspense
          fallback={
            <div>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: "52px", marginBottom: ".875rem", borderRadius: "var(--radius-sm)" }}
                />
              ))}
            </div>
          }
        >
          <CreateSubscriptionContent />
        </Suspense>
      </div>
    </div>
  );
}

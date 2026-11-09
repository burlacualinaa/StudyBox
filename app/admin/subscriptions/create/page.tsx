
import Link from "next/link";
import { Suspense } from "react";
import { getUsersForSubscription } from "../../../../lib/subscriptionAccessor";
import CreateSubscriptionForm from "./CreateSubscriptionForm";

async function CreateSubscriptionContent() {
  const users = await getUsersForSubscription();

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4 p-md-5">
        <h2 className="h4 fw-bold mb-2">Detalii abonament</h2>
        <p className="text-muted mb-4">
          Completează informațiile pentru noul abonament.
        </p>

        {users.length === 0 ? (
          <div className="alert alert-warning">
            Nu există utilizatori disponibili.
            <Link href="/users/create" className="ms-2">
              Adaugă un utilizator
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
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px 20px",
      }}
    >
      <div className="container" style={{ maxWidth: "850px" }}>
        <Link
          href="/admin/subscriptions"
          className="text-decoration-none"
        >
          ← Înapoi la abonamente
        </Link>

        <div className="my-4">
          <h1 className="fw-bold" style={{ color: "#172554" }}>
            Adaugă abonament
          </h1>
          <p className="text-muted">
            Atribuie un plan de abonament unui utilizator StudyBox.
          </p>
        </div>

        <Suspense fallback={<p>Se încarcă formularul...</p>}>
          <CreateSubscriptionContent />
        </Suspense>
      </div>
    </main>
  );
}

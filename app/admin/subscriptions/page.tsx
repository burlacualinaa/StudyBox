
import Link from "next/link";
import { Suspense } from "react";
import { getAllSubscriptions } from "../../../lib/subscriptionAccessor";

async function SubscriptionsList() {
  const subscriptions = await getAllSubscriptions();

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Utilizator</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Preț</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.id}</td>
                  <td className="fw-semibold">
                    {subscription.user.name}
                  </td>
                  <td>{subscription.user.email}</td>
                  <td>
                    <span className="badge bg-primary">
                      {subscription.plan}
                    </span>
                  </td>
                  <td>{subscription.price.toFixed(2)} RON</td>
                  <td>
                    <span
                      className={
                        subscription.status === "active"
                          ? "badge bg-success"
                          : "badge bg-secondary"
                      }
                    >
                      {subscription.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && (
          <p className="text-muted text-center py-4">
            Nu există abonamente înregistrate.
          </p>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px 20px",
      }}
    >
      <div className="container">
        <Link href="/admin" className="text-decoration-none">
          ← Înapoi la Admin
        </Link>

        <div className="d-flex justify-content-between align-items-center my-4 flex-wrap gap-3">
          <div>
            <h1 className="fw-bold">Administrare abonamente</h1>
            <p className="text-muted mb-0">
              Gestionează abonamentele utilizatorilor StudyBox.
            </p>
          </div>

          <Link
            href="/admin/subscriptions/create"
            className="btn btn-primary px-4 py-2"
          >
            + Adaugă abonament
          </Link>
        </div>

        <Suspense fallback={<p>Se încarcă abonamentele...</p>}>
          <SubscriptionsList />
        </Suspense>
      </div>
    </main>
  );
}

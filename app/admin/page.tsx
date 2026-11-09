
import Link from "next/link";

export default function AdminPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "48px 20px",
      }}
    >
      <div className="container" style={{ maxWidth: "1100px" }}>
        <div className="mb-5">
          <span
            className="badge mb-3"
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
              padding: "10px 14px",
            }}
          >
            STUDYBOX • ADMIN
          </span>

          <h1
            className="fw-bold mb-2"
            style={{ color: "#172554", fontSize: "36px" }}
          >
            Panou de administrare
          </h1>

          <p style={{ color: "#64748b", fontSize: "17px" }}>
            Gestionează utilizatorii și abonamentele platformei
            educaționale dintr-un singur loc.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "18px" }}
            >
              <div className="card-body p-4">
                <div
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "58px",
                    height: "58px",
                    background: "#dbeafe",
                    borderRadius: "14px",
                    fontSize: "28px",
                  }}
                >
                  👥
                </div>

                <h2 className="h4 fw-bold" style={{ color: "#1e293b" }}>
                  Utilizatori
                </h2>

                <p style={{ color: "#64748b" }}>
                  Vizualizează, adaugă și modifică utilizatorii
                  platformei educaționale.
                </p>

                <Link
                  href="/users"
                  className="btn btn-primary mt-3 px-4 py-2"
                  style={{ borderRadius: "10px" }}
                >
                  Administrare utilizatori
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "18px" }}
            >
              <div className="card-body p-4">
                <div
                  className="d-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "58px",
                    height: "58px",
                    background: "#f3e8ff",
                    borderRadius: "14px",
                    fontSize: "28px",
                  }}
                >
                  💳
                </div>

                <h2 className="h4 fw-bold" style={{ color: "#1e293b" }}>
                  Abonamente
                </h2>

                <p style={{ color: "#64748b" }}>
                  Vizualizează abonamentele și atribuie planuri
                  utilizatorilor platformei.
                </p>

                <Link
                  href="/admin/subscriptions"
                  className="btn btn-primary mt-3 px-4 py-2"
                  style={{ borderRadius: "10px" }}
                >
                  Administrare abonamente
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

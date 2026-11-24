"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ChangeEvent } from "react";

type CustomQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export default function CreateQuizPage() {
  const router = useRouter();
  const [tab, setTab]                 = useState<"pdf" | "manual">("pdf");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic]       = useState(true);
  const [questions, setQuestions]     = useState<CustomQuestion[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [error, setError]             = useState("");
  const [saving, setSaving]           = useState(false);

  // Stare încărcare PDF
  const [pdfFile, setPdfFile]         = useState<File | null>(null);
  const [extracting, setExtracting]   = useState(false);
  const [pdfSuccess, setPdfSuccess]   = useState("");

  // Stare formular întrebare nouă manuală
  const [qText, setQText]             = useState("");
  const [optA, setOptA]               = useState("");
  const [optB, setOptB]               = useState("");
  const [optC, setOptC]               = useState("");
  const [optD, setOptD]               = useState("");
  const [correctOpt, setCorrectOpt]   = useState(0);
  const [explanation, setExplanation] = useState("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setError("");
      setPdfSuccess("");
    }
  }

  async function handleGenerateFromPdf() {
    if (!pdfFile) {
      setError("Te rugăm să selectezi un fișier PDF.");
      return;
    }

    setExtracting(true);
    setError("");
    setPdfSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch("/api/quizzes/generate-from-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Eroare la procesarea PDF-ului.");
      }

      if (!title) {
        setTitle(data.title || "Quiz din document");
      }
      if (!description) {
        setDescription(`Quiz generat automat din documentul: ${pdfFile.name}`);
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setPdfSuccess(`✅ Am extras conținutul și am generat ${data.questions.length} întrebări interactive!`);
      } else {
        setPdfSuccess("✅ Documentul a fost analizat cu succes!");
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-refresh"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu s-a putut genera quiz-ul din PDF.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-refresh"));
      }
    } finally {
      setExtracting(false);
    }
  }

  function handleAddQuestion() {
    if (!qText.trim() || !optA.trim() || !optB.trim()) {
      alert("Te rugăm să completezi textul întrebării și cel puțin primele 2 opțiuni.");
      return;
    }

    const options = [optA.trim(), optB.trim()];
    if (optC.trim()) options.push(optC.trim());
    if (optD.trim()) options.push(optD.trim());

    const newQ: CustomQuestion = {
      id: Date.now(),
      question: qText.trim(),
      options,
      correctIndex: Math.min(correctOpt, options.length - 1),
      explanation: explanation.trim(),
    };

    setQuestions([...questions, newQ]);
    setQText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectOpt(0);
    setExplanation("");
    setShowQuestionForm(false);
  }

  function handleRemoveQuestion(id: number) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          isPublic,
          source: tab,
          questions: questions.length > 0 ? questions : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Eroare la salvarea quiz-ului.");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-refresh"));
      }
      router.push(`/quizzes/${data.quiz.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container-narrow">
        {/* Back link */}
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
            transition: "color var(--transition)",
          }}
        >
          ← Înapoi la pagina principală
        </Link>

        {/* Page header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <span
            style={{
              display: "block",
              fontSize: ".75rem",
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--brand-500)",
              marginBottom: ".4rem",
            }}
          >
            Materiale & Quiz-uri
          </span>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              margin: "0 0 .4rem",
              letterSpacing: "-.03em",
              color: "var(--text-primary)",
            }}
          >
            Creează un quiz nou 📝
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Încarcă un material PDF pentru generare automată sau configurează întrebările manual.
          </p>
        </div>

        {/* Tab switcher: Din PDF vs Manual */}
        <div
          style={{
            display: "flex",
            background: "var(--surface-100)",
            border: "1px solid var(--surface-200)",
            borderRadius: "var(--radius-md)",
            padding: ".25rem",
            marginBottom: "1.5rem",
            gap: ".25rem",
          }}
        >
          <button
            type="button"
            onClick={() => setTab("pdf")}
            style={{
              flex: 1,
              padding: ".65rem 1rem",
              border: "none",
              cursor: "pointer",
              borderRadius: "calc(var(--radius-md) - 2px)",
              fontWeight: 700,
              fontSize: ".9375rem",
              transition: "all var(--transition)",
              background: tab === "pdf" ? "linear-gradient(135deg, var(--brand-600), var(--brand-500))" : "transparent",
              color: tab === "pdf" ? "#fff" : "var(--text-secondary)",
              boxShadow: tab === "pdf" ? "0 2px 8px rgba(99,102,241,.30)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: ".5rem",
            }}
          >
            📄 Din fișier PDF (Automat)
          </button>
          <button
            type="button"
            onClick={() => setTab("manual")}
            style={{
              flex: 1,
              padding: ".65rem 1rem",
              border: "none",
              cursor: "pointer",
              borderRadius: "calc(var(--radius-md) - 2px)",
              fontWeight: 700,
              fontSize: ".9375rem",
              transition: "all var(--transition)",
              background: tab === "manual" ? "linear-gradient(135deg, var(--brand-600), var(--brand-500))" : "transparent",
              color: tab === "manual" ? "#fff" : "var(--text-secondary)",
              boxShadow: tab === "manual" ? "0 2px 8px rgba(99,102,241,.30)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: ".5rem",
            }}
          >
            ✍️ Configurare manuală
          </button>
        </div>

        {/* ── Zona Încărcare PDF ────────────────────────────────────────── */}
        {tab === "pdf" && (
          <div
            className="card fade-up"
            style={{
              padding: "2rem",
              marginBottom: "1.75rem",
              background: "linear-gradient(180deg, #f8fafc 0%, #fff 100%)",
              border: "2px dashed var(--brand-300)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "50%",
                background: "var(--brand-50)",
                color: "var(--brand-600)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                margin: "0 auto 1rem",
              }}
            >
              📥
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: ".4rem" }}>
              Încarcă documentul tău de curs / notițe (PDF)
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: ".875rem", maxWidth: "460px", margin: "0 auto 1.5rem" }}>
              Selectează un fișier PDF cu lecția sau rezumatul. Algoritmul va extrage conceptele cheie și va genera un quiz interactiv.
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <label
                htmlFor="pdf-upload"
                className="btn btn-ghost"
                style={{
                  padding: ".75rem 1.75rem",
                  fontSize: ".9375rem",
                  cursor: "pointer",
                  border: "2px solid var(--surface-300)",
                }}
              >
                {pdfFile ? `📄 ${pdfFile.name} (${(pdfFile.size / 1024).toFixed(0)} KB)` : "Alege fișierul PDF de pe calculator"}
              </label>

              {pdfFile && (
                <button
                  type="button"
                  disabled={extracting}
                  onClick={handleGenerateFromPdf}
                  className="btn btn-primary btn-lg"
                  style={{
                    boxShadow: "0 4px 14px rgba(99,102,241,.35)",
                  }}
                >
                  {extracting ? "⏳ Se analizează PDF-ul și se generează întrebările..." : "⚡ Generează Quiz din PDF acum"}
                </button>
              )}
            </div>

            {pdfSuccess && (
              <div className="alert alert-info" style={{ marginTop: "1.25rem", textAlign: "left" }}>
                <span>🎯</span>
                <span>{pdfSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Formular Quiz & Întrebări ─────────────────────────────────── */}
        <div className="card fade-up fade-up-1">
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Titlu */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Titlu quiz / Materie *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="ex. Test Roman Ion sau Test Istorie - Primul Război Mondial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  style={{ fontSize: "1rem" }}
                />
              </div>

              {/* Descriere */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descriere / Notițe de recapitulare{" "}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)" }}>
                    (opțional)
                  </span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="ex. Test grilă generat pentru consolidarea noțiunilor din materialul de curs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  style={{ fontSize: ".9375rem", resize: "vertical" }}
                />
              </div>

              {/* Unde vrei să publici quiz-ul */}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: ".6rem" }}>
                  Unde vrei să fie postat quiz-ul? *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {/* Opțiunea 1: În comunitate & La mine */}
                  <div
                    onClick={() => setIsPublic(true)}
                    style={{
                      cursor: "pointer",
                      padding: "1.25rem",
                      borderRadius: "var(--radius-md)",
                      border: isPublic
                        ? "2px solid var(--brand-500)"
                        : "2px solid var(--surface-200)",
                      background: isPublic ? "var(--brand-50)" : "#fff",
                      transition: "all var(--transition)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: ".85rem",
                      boxShadow: isPublic ? "0 4px 14px rgba(99,102,241,.12)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "1.35rem",
                        height: "1.35rem",
                        borderRadius: "50%",
                        border: isPublic ? "5px solid var(--brand-500)" : "2px solid var(--surface-300)",
                        background: "#fff",
                        marginTop: ".15rem",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".3rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "1.1rem" }}>🌐</span>
                        <strong style={{ fontSize: ".9375rem", color: isPublic ? "var(--brand-700)" : "var(--text-primary)" }}>
                          În comunitate și la mine
                        </strong>
                        <span className="badge badge-primary" style={{ fontSize: ".6875rem" }}>Public</span>
                      </div>
                      <p style={{ margin: 0, fontSize: ".8125rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        Quiz-ul apare în contul tău și este partajat în secțiunea <strong>„Comunitate”</strong> pentru toți colegii și profesorii.
                      </p>
                    </div>
                  </div>

                  {/* Opțiunea 2: Doar în quiz-urile mele */}
                  <div
                    onClick={() => setIsPublic(false)}
                    style={{
                      cursor: "pointer",
                      padding: "1.25rem",
                      borderRadius: "var(--radius-md)",
                      border: !isPublic
                        ? "2px solid var(--brand-500)"
                        : "2px solid var(--surface-200)",
                      background: !isPublic ? "var(--brand-50)" : "#fff",
                      transition: "all var(--transition)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: ".85rem",
                      boxShadow: !isPublic ? "0 4px 14px rgba(99,102,241,.12)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "1.35rem",
                        height: "1.35rem",
                        borderRadius: "50%",
                        border: !isPublic ? "5px solid var(--brand-500)" : "2px solid var(--surface-300)",
                        background: "#fff",
                        marginTop: ".15rem",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".3rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "1.1rem" }}>🔒</span>
                        <strong style={{ fontSize: ".9375rem", color: !isPublic ? "var(--brand-700)" : "var(--text-primary)" }}>
                          Doar în quiz-urile mele
                        </strong>
                        <span className="badge badge-gray" style={{ fontSize: ".6875rem" }}>Privat</span>
                      </div>
                      <p style={{ margin: 0, fontSize: ".8125rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        Quiz-ul este vizibil <strong>doar pentru tine</strong> în lista ta de teste. Nu va fi afișat colegilor în comunitate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: ".25rem 0" }} />

              {/* Secțiune Întrebări */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 .2rem" }}>
                      Întrebările quiz-ului ({questions.length})
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: ".8125rem", margin: 0 }}>
                      {questions.length > 0
                        ? "Verifică întrebările generate sau adăugate înainte de salvare."
                        : "Poți adăuga întrebări manuale sau poți încărca un PDF pentru generare."}
                    </p>
                  </div>

                  {!showQuestionForm && (
                    <button
                      type="button"
                      onClick={() => setShowQuestionForm(true)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontWeight: 600 }}
                    >
                      + Adaugă întrebare
                    </button>
                  )}
                </div>

                {/* Lista intrebari adaugate */}
                {questions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: ".75rem", marginBottom: "1rem" }}>
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        style={{
                          padding: "1.1rem",
                          background: "var(--surface-50)",
                          border: "1px solid var(--surface-200)",
                          borderRadius: "var(--radius-sm)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: ".9375rem", color: "var(--text-primary)" }}>
                            {idx + 1}. {q.question}
                          </div>
                          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                            {q.options.map((opt, optI) => (
                              <span
                                key={optI}
                                className={`badge ${optI === q.correctIndex ? "badge-success" : "badge-gray"}`}
                              >
                                {optI === q.correctIndex ? `✓ ${opt}` : opt}
                              </span>
                            ))}
                          </div>
                          {q.explanation && (
                            <div style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: ".4rem" }}>
                              💡 {q.explanation}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--danger-500)",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            lineHeight: 1,
                          }}
                          title="Șterge întrebarea"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formular adaugare intrebare manuala */}
                {showQuestionForm && (
                  <div
                    style={{
                      padding: "1.5rem",
                      background: "var(--surface-50)",
                      border: "2px dashed var(--brand-300)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "1rem",
                    }}
                  >
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
                      Adaugă o întrebare nouă
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div className="form-group">
                        <label className="form-label">Textul întrebării *</label>
                        <input
                          type="text"
                          placeholder="ex. În ce an a fost publicată opera?"
                          value={qText}
                          onChange={(e) => setQText(e.target.value)}
                          className="form-control"
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
                        <div className="form-group">
                          <label className="form-label">Opțiunea A *</label>
                          <input
                            type="text"
                            placeholder="Varianta A"
                            value={optA}
                            onChange={(e) => setOptA(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Opțiunea B *</label>
                          <input
                            type="text"
                            placeholder="Varianta B"
                            value={optB}
                            onChange={(e) => setOptB(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Opțiunea C (opțional)</label>
                          <input
                            type="text"
                            placeholder="Varianta C"
                            value={optC}
                            onChange={(e) => setOptC(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Opțiunea D (opțional)</label>
                          <input
                            type="text"
                            placeholder="Varianta D"
                            value={optD}
                            onChange={(e) => setOptD(e.target.value)}
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Care este varianta corectă?</label>
                        <select
                          className="form-control"
                          value={correctOpt}
                          onChange={(e) => setCorrectOpt(Number(e.target.value))}
                        >
                          <option value={0}>Varianta A este corectă</option>
                          <option value={1}>Varianta B este corectă</option>
                          {optC && <option value={2}>Varianta C este corectă</option>}
                          {optD && <option value={3}>Varianta D este corectă</option>}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Explicație răspuns (opțional)</label>
                        <input
                          type="text"
                          placeholder="ex. Explicație afișată după ce elevul răspunde..."
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                          className="form-control"
                        />
                      </div>

                      <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="btn btn-primary btn-sm"
                        >
                          ✓ Confirmă întrebarea
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQuestionForm(false)}
                          className="btn btn-ghost btn-sm"
                        >
                          Renunță
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="alert alert-error" role="alert">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: ".75rem",
                  paddingTop: ".5rem",
                  borderTop: "1px solid var(--surface-200)",
                }}
              >
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="btn btn-primary btn-lg"
                >
                  {saving ? "⏳ Se creează quiz-ul..." : "✓ Salvează și începe Quiz-ul"}
                </button>
                <Link href="/" className="btn btn-ghost">
                  Anulează
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

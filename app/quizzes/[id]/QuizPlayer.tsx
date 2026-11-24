"use client";

import Link from "next/link";
import { useState } from "react";

export type Question = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

type QuizData = {
  id: number;
  title: string;
  description: string | null;
  authorName: string;
  createdAt: string;
  questions: Question[];
};

export default function QuizPlayer({ quiz }: { quiz: QuizData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + (quizFinished ? 1 : 0)) / questions.length) * 100);

  function handleSelectOption(index: number) {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  }

  const optionLetters = ["A", "B", "C", "D", "E"];
  const scorePercent = Math.round((score / questions.length) * 100);

  return (
    <div className="page-wrapper">
      <div className="container-narrow">
        {/* Navigatie inapoi */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".4rem",
              fontSize: ".875rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Înapoi la Panou
          </Link>
          <span style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
            Autor: {quiz.authorName}
          </span>
        </div>

        {/* Header Quiz */}
        <div className="fade-up" style={{ marginBottom: "1.5rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: ".75rem",
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--brand-500)",
              marginBottom: ".4rem",
            }}
          >
            Quiz interactiv #{quiz.id}
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
            {quiz.title}
          </h1>
          {quiz.description && (
            <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: ".9375rem" }}>
              {quiz.description}
            </p>
          )}
        </div>

        {/* ── Ecran Rezultate Finale ──────────────────────────────────── */}
        {quizFinished ? (
          <div
            className="card fade-up"
            style={{
              textAlign: "center",
              padding: "3.5rem 2rem",
            }}
          >
            <div
              style={{
                width: "5rem",
                height: "5rem",
                borderRadius: "50%",
                background: scorePercent >= 70 ? "#dcfce7" : "#fef3c7",
                color: scorePercent >= 70 ? "#15803d" : "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                margin: "0 auto 1.5rem",
              }}
            >
              {scorePercent >= 70 ? "🏆" : "📚"}
            </div>

            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 900,
                color: "var(--text-primary)",
                marginBottom: ".5rem",
              }}
            >
              {scorePercent === 100
                ? "Perfect! Scorul tău este 100%! 🎉"
                : scorePercent >= 70
                ? "Felicitări! Ai promovat cu succes! 👏"
                : "Ai finalizat testul! Continuă să exersezi! 💪"}
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "2rem" }}>
              Ai răspuns corect la <strong>{score}</strong> din <strong>{questions.length}</strong> întrebări ({scorePercent}%).
            </p>

            {/* Bara de progres final */}
            <div
              style={{
                maxWidth: "320px",
                height: "10px",
                background: "var(--surface-200)",
                borderRadius: "999px",
                margin: "0 auto 2.5rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${scorePercent}%`,
                  background: scorePercent >= 70 ? "var(--success-500)" : "var(--warning-500)",
                  borderRadius: "999px",
                  transition: "width 0.8s ease-out",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={handleRestart} className="btn btn-primary btn-lg">
                🔄 Reîncearcă Quiz-ul
              </button>
              <Link href="/" className="btn btn-ghost btn-lg">
                🏠 Înapoi la Panou
              </Link>
              <Link href="/quizzes/create" className="btn btn-success btn-lg">
                ✨ Creează alt Quiz
              </Link>
            </div>
          </div>
        ) : (
          /* ── Ecran Întrebare Activă ─────────────────────────────────── */
          <div className="card fade-up">
            {/* Header întrebare + Progres */}
            <div
              style={{
                padding: "1.25rem 1.75rem",
                borderBottom: "1px solid var(--surface-100)",
                background: "var(--surface-50)",
                borderTopLeftRadius: "var(--radius-lg)",
                borderTopRightRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}>
                <span style={{ fontSize: ".8125rem", fontWeight: 700, color: "var(--brand-600)", letterSpacing: ".04em" }}>
                  ÎNTREBAREA {currentIndex + 1} DIN {questions.length}
                </span>
                <span style={{ fontSize: ".8125rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Scor: {score} punct{score !== 1 ? "e" : ""}
                </span>
              </div>

              {/* Bara de progres */}
              <div
                style={{
                  height: "6px",
                  background: "var(--surface-200)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    background: "linear-gradient(90deg, var(--brand-500), var(--accent-500))",
                    borderRadius: "999px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Corp întrebare */}
            <div className="card-body" style={{ padding: "2rem 1.75rem" }}>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "1.75rem",
                  lineHeight: 1.4,
                }}
              >
                {currentQuestion.question}
              </h2>

              {/* Opțiuni de răspuns */}
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === currentQuestion.correctIndex;

                  let optionBorder = "var(--surface-200)";
                  let optionBg = "var(--surface-0)";
                  let badgeBg = "var(--surface-100)";
                  let badgeColor = "var(--text-secondary)";

                  if (isAnswered) {
                    if (isCorrect) {
                      optionBorder = "var(--success-500)";
                      optionBg = "#f0fdf4";
                      badgeBg = "var(--success-500)";
                      badgeColor = "#fff";
                    } else if (isSelected) {
                      optionBorder = "var(--danger-500)";
                      optionBg = "#fef2f2";
                      badgeBg = "var(--danger-500)";
                      badgeColor = "#fff";
                    }
                  } else if (isSelected) {
                    optionBorder = "var(--brand-500)";
                    optionBg = "var(--brand-50)";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.25rem",
                        background: optionBg,
                        border: `2px solid ${optionBorder}`,
                        borderRadius: "var(--radius-md)",
                        cursor: isAnswered ? "default" : "pointer",
                        textAlign: "left",
                        transition: "all var(--transition)",
                        width: "100%",
                      }}
                      onMouseOver={(e) => {
                        if (!isAnswered) {
                          e.currentTarget.style.borderColor = "var(--brand-400)";
                          e.currentTarget.style.background = "var(--surface-50)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isAnswered && !isSelected) {
                          e.currentTarget.style.borderColor = "var(--surface-200)";
                          e.currentTarget.style.background = "var(--surface-0)";
                        }
                      }}
                    >
                      {/* Literele A, B, C, D */}
                      <div
                        style={{
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "8px",
                          background: badgeBg,
                          color: badgeColor,
                          fontWeight: 800,
                          fontSize: ".875rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all var(--transition)",
                        }}
                      >
                        {isAnswered && isCorrect ? "✓" : isAnswered && isSelected ? "✕" : optionLetters[optIdx]}
                      </div>

                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: isSelected || (isAnswered && isCorrect) ? 700 : 500,
                          color: "var(--text-primary)",
                          flex: 1,
                        }}
                      >
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explicație dacă a răspuns */}
              {isAnswered && (
                <div
                  className="fade-up"
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-sm)",
                    background: selectedOption === currentQuestion.correctIndex ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${selectedOption === currentQuestion.correctIndex ? "#bbf7d0" : "#fecaca"}`,
                    fontSize: ".9375rem",
                    color: selectedOption === currentQuestion.correctIndex ? "#166534" : "#991b1b",
                  }}
                >
                  <strong>
                    {selectedOption === currentQuestion.correctIndex ? "Excelent! Răspuns corect! 🎯" : "Răspuns greșit! ❌"}
                  </strong>
                  {currentQuestion.explanation && (
                    <div style={{ marginTop: ".35rem", fontSize: ".875rem" }}>
                      {currentQuestion.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Buton Următoarea întrebare */}
              {isAnswered && (
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleNext} className="btn btn-primary btn-lg">
                    {currentIndex + 1 < questions.length ? "Următoarea întrebare →" : "Vezi rezultatul final 🏆"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

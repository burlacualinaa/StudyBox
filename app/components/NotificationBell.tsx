"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type NotificationItem = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | "all" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount ?? data.notifications.filter((n: NotificationItem) => !n.isRead).length);
      }
    } catch {
      // Ignorăm erorile de rețea pasive
    }
  }, []);

  // Încărcare inițială și polling automat periodic pentru actualizări fără refresh
  useEffect(() => {
    fetchNotifications();

    // Verifică periodic notificări la fiecare 6 secunde
    const interval = setInterval(fetchNotifications, 6000);

    // Ascultă evenimentul custom de reîmprospătare imediată declanșat de acțiuni din aplicație
    const handleRefresh = () => fetchNotifications();
    window.addEventListener("notifications-refresh", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-refresh", handleRefresh);
    };
  }, [fetchNotifications]);

  // Închidere la click în exterior
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Marchează o singură notificare ca citită
  async function markAsRead(id: number, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Eroare la marcarea ca citită:", err);
      fetchNotifications();
    }
  }

  // Marchează toate notificările ca citite
  async function markAllAsRead() {
    setActionInProgress("all");
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch("/api/notifications", {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Eroare la marcarea tuturor ca citite:", err);
      fetchNotifications();
    } finally {
      setActionInProgress(null);
    }
  }

  // HARD DELETE: Ștergere fizică a unei singure notificări
  async function deleteSingle(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setActionInProgress(id);
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Eroare la ștergerea notificării:", err);
      fetchNotifications();
    } finally {
      setActionInProgress(null);
    }
  }

  // HARD DELETE: Ștergere fizică a tuturor notificărilor
  async function deleteAll() {
    if (!confirm("Ești sigur că vrei să ștergi definitiv toate notificările?")) return;
    setActionInProgress("all");
    try {
      setNotifications([]);
      setUnreadCount(0);

      await fetch("/api/notifications", {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Eroare la ștergerea tuturor notificărilor:", err);
      fetchNotifications();
    } finally {
      setActionInProgress(null);
    }
  }

  function handleNotificationClick(notif: NotificationItem) {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  }

  function formatTime(dateStr: string) {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMin / 60);

      if (diffMin < 1) return "Chiar acum";
      if (diffMin < 60) return `acum ${diffMin} min`;
      if (diffHours < 24) return `acum ${diffHours} ore`;
      return d.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case "success":
        return { icon: "✅", color: "var(--success-500)" };
      case "error":
        return { icon: "⚠️", color: "var(--danger-500)" };
      case "warning":
        return { icon: "⚡", color: "var(--warning-500)" };
      default:
        return { icon: "ℹ️", color: "var(--brand-500)" };
    }
  }

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Buton Clopoțel */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        aria-label="Notificări"
        title="Notificări"
        style={{
          position: "relative",
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "50%",
          background: open ? "var(--brand-50)" : "var(--surface-50)",
          border: open ? "1.5px solid var(--brand-400)" : "1.5px solid var(--surface-200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all var(--transition)",
          fontSize: "1.15rem",
          color: "var(--text-primary)",
        }}
      >
        <span>🔔</span>

        {/* Indicator număr notificări necitite */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              minWidth: "1.15rem",
              height: "1.15rem",
              padding: "0 0.25rem",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff",
              fontSize: "0.6875rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
              lineHeight: 1,
              animation: "pulse 2s infinite",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panou Dropdown Notificări */}
      {open && (
        <div
          className="fade-up"
          style={{
            position: "absolute",
            top: "calc(100% + 0.6rem)",
            right: 0,
            width: "clamp(320px, 92vw, 420px)",
            maxHeight: "540px",
            background: "#ffffff",
            border: "1px solid var(--surface-200)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header Panou */}
          <div
            style={{
              padding: "0.875rem 1.125rem",
              background: "linear-gradient(135deg, var(--surface-50) 0%, #ffffff 100%)",
              borderBottom: "1px solid var(--surface-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🔔</span>
              <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                Notificări
              </span>
              {unreadCount > 0 && (
                <span className="badge badge-primary" style={{ fontSize: "0.6875rem", padding: "0.15rem 0.5rem" }}>
                  {unreadCount} noi
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={actionInProgress === "all"}
                  title="Marchează toate notificările ca citite"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand-600)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    transition: "background var(--transition)",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--brand-50)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  ✓ Citește tot
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={deleteAll}
                  disabled={actionInProgress === "all"}
                  title="Șterge definitiv toate notificările"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    transition: "background var(--transition)",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  🗑️ Șterge tot
                </button>
              )}
            </div>
          </div>

          {/* Corp Listă Notificări */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: "440px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {notifications.length === 0 ? (
              /* Stare când nu există notificări */
              <div
                style={{
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "50%",
                    background: "var(--surface-100)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                  }}
                >
                  🔕
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    Nu ai nicio notificare
                  </div>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--text-secondary)", maxWidth: "260px" }}>
                    Vei primi alerte aici când creezi teste, generezi quiz-uri din PDF sau schimbi abonamentul.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((notif) => {
                const typeInfo = getTypeBadge(notif.type);
                const isUnread = !notif.isRead;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: "0.875rem 1.125rem",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      borderBottom: "1px solid var(--surface-100)",
                      background: isUnread ? "linear-gradient(90deg, #f5f3ff 0%, #faf5ff 100%)" : "#ffffff",
                      cursor: notif.link ? "pointer" : "default",
                      transition: "all var(--transition)",
                      position: "relative",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = isUnread ? "#ede9fe" : "var(--surface-50)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = isUnread
                        ? "linear-gradient(90deg, #f5f3ff 0%, #faf5ff 100%)"
                        : "#ffffff";
                    }}
                  >
                    {/* Indicator vizual pentru necitit */}
                    {isUnread && (
                      <div
                        style={{
                          position: "absolute",
                          left: "4px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "6px",
                          height: "24px",
                          borderRadius: "4px",
                          background: "var(--brand-500)",
                        }}
                      />
                    )}

                    {/* Pictogramă tip notificare */}
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "10px",
                        background: isUnread ? "rgba(99, 102, 241, 0.14)" : "var(--surface-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        flexShrink: 0,
                        marginTop: "0.1rem",
                      }}
                    >
                      {typeInfo.icon}
                    </div>

                    {/* Conținut Notificare */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "0.875rem",
                            color: isUnread ? "var(--brand-900)" : "var(--text-primary)",
                            fontWeight: isUnread ? 800 : 600,
                          }}
                        >
                          {notif.title}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--text-muted)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.8125rem",
                          color: isUnread ? "var(--text-primary)" : "var(--text-secondary)",
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                        }}
                      >
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div
                          style={{
                            marginTop: "0.35rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--brand-600)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          Deschide link-ul →
                        </div>
                      )}
                    </div>

                    {/* Butoane de acțiune individuală: Marcare citit & Hard Delete */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        flexShrink: 0,
                        marginLeft: "0.25rem",
                      }}
                    >
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => markAsRead(notif.id, e)}
                          title="Marchează ca citită"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0.2rem",
                            color: "var(--brand-600)",
                            fontSize: "0.85rem",
                            borderRadius: "4px",
                            lineHeight: 1,
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = "var(--brand-100)")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                          ✓
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => deleteSingle(notif.id, e)}
                        disabled={actionInProgress === notif.id}
                        title="Șterge definitiv această notificare"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.2rem",
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                          borderRadius: "4px",
                          lineHeight: 1,
                          transition: "color var(--transition)",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = "#dc2626";
                          e.currentTarget.style.background = "#fee2e2";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = "var(--text-muted)";
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

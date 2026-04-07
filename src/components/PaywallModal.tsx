"use client";

import { useState } from "react";

interface PaywallModalProps {
  styleName: string;
  onClose: () => void;
  onPaid: () => void;
}

export default function PaywallModal({ styleName, onClose, onPaid }: PaywallModalProps) {
  const [plan, setPlan] = useState<"single" | "unlimited">("single");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: email.trim() || undefined }),
      });
      const { url, error } = await res.json();
      if (url) {
        // Store email for subscription verification on return
        if (email.trim()) {
          document.cookie = `cvforge_email=${encodeURIComponent(email.trim())};path=/;max-age=${60 * 60 * 24 * 365}`;
        }
        window.location.href = url;
      } else {
        alert(error || "Erreur de paiement");
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99998,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "cvAppear 0.3s ease",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 420, maxWidth: "90vw",
        background: "var(--color-bg-card)", border: "1px solid var(--color-brd)",
        borderRadius: 16, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 28px 16px", textAlign: "center",
          borderBottom: "1px solid var(--color-brd)",
        }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Telecharger votre CV
          </div>
          <div style={{ fontSize: 13, color: "var(--color-tx2)" }}>
            Design <span style={{ color: "var(--color-acc)", fontWeight: 600 }}>{styleName}</span> — pret a imprimer
          </div>
        </div>

        {/* Plans */}
        <div style={{ padding: "20px 28px" }}>
          {/* Single */}
          <div
            onClick={() => setPlan("single")}
            style={{
              padding: "16px 18px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${plan === "single" ? "var(--color-acc)" : "var(--color-brd)"}`,
              background: plan === "single" ? "var(--color-acc-g)" : "transparent",
              marginBottom: 10, transition: "all 0.2s",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Ce CV</div>
              <div style={{ fontSize: 12, color: "var(--color-tx3)", marginTop: 2 }}>Telechargement unique en PDF</div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--color-acc)" }}>
              0.99€
            </div>
          </div>

          {/* Unlimited */}
          <div
            onClick={() => setPlan("unlimited")}
            style={{
              padding: "16px 18px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${plan === "unlimited" ? "var(--color-acc)" : "var(--color-brd)"}`,
              background: plan === "unlimited" ? "var(--color-acc-g)" : "transparent",
              transition: "all 0.2s", position: "relative", overflow: "hidden",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, padding: "3px 10px", background: "var(--color-acc)", color: "var(--color-bg)", fontSize: 9, fontWeight: 700, letterSpacing: 1, borderRadius: "0 0 0 8px" }}>
              POPULAIRE
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Illimite</div>
              <div style={{ fontSize: 12, color: "var(--color-tx3)", marginTop: 2 }}>Tous les templates, adaptations offres</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--color-acc)" }}>9.99€</div>
              <div style={{ fontSize: 10, color: "var(--color-tx3)" }}>/mois</div>
            </div>
          </div>

          {/* Stat marketing */}
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 8,
            background: "var(--color-acc-g)", border: "1px solid rgba(201,165,90,0.1)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-acc)" strokeWidth={1.5} style={{ flexShrink: 0 }}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: 12, color: "var(--color-tx2)", lineHeight: 1.6 }}>
              Un CV adapte a l'offre multiplie par <strong style={{ color: "var(--color-acc)" }}>2.5x</strong> vos chances d'obtenir un entretien
            </div>
          </div>

          {/* Email for subscription */}
          {plan === "unlimited" && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "var(--color-tx3)", marginBottom: 6 }}>
                Votre email (pour retrouver votre abonnement)
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                type="email"
                className="input"
                style={{ fontSize: 14 }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0 28px 24px" }}>
          <button
            onClick={handleCheckout}
            disabled={loading || (plan === "unlimited" && !email.trim())}
            style={{
              width: "100%", padding: "14px", borderRadius: 10,
              background: loading ? "var(--color-bg-up)" : "var(--color-acc)",
              color: loading ? "var(--color-tx3)" : "var(--color-bg)",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 700,
              letterSpacing: 0.5, transition: "all 0.2s",
            }}
          >
            {loading ? "Redirection..." : plan === "single" ? "Payer 0.99€ et telecharger" : "S'abonner — 9.99€/mois"}
          </button>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            marginTop: 12, fontSize: 11, color: "var(--color-tx3)",
          }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="var(--color-tx3)">
              <path d="M12 2L4 7v5c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5z" />
            </svg>
            Paiement securise par Stripe — Annulation a tout moment
          </div>
        </div>
      </div>
    </div>
  );
}

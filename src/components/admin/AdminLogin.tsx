// Pagina /admin: il titolare entra con la password e torna al sito con il pannello aperto.
import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Accesso non riuscito");
      window.dispatchEvent(new Event("admin-auth"));
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div data-admin-ui className="min-h-[100dvh] flex items-center justify-center bg-background px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border/50 shadow-2xl p-8">
        <img src="/images/logo-transparent.webp" alt="Officina del Panino" className="w-40 mx-auto mb-6" />
        <h1 className="text-center text-2xl font-display uppercase tracking-widest text-white mb-1">Area riservata</h1>
        <p className="text-center text-sm text-muted-foreground mb-8">Entra per modificare i contenuti del sito</p>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 bg-background border border-border text-white focus:outline-none focus:border-primary"
        />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 w-full h-12 bg-primary text-white font-display uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Accesso…" : "Entra"}
        </button>
      </form>
    </div>
  );
}

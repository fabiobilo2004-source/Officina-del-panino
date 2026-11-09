import { Suspense, lazy, useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

const Home      = lazy(() => import("@/pages/home"));
const Menu      = lazy(() => import("@/pages/menu"));
const Gallery   = lazy(() => import("@/pages/gallery"));
const Contact   = lazy(() => import("@/pages/contact"));
const Contatti  = lazy(() => import("@/pages/contatti"));
const Social    = lazy(() => import("@/pages/social"));
const NotFound  = lazy(() => import("@/pages/not-found"));
// Admin: login su /admin, poi il pannello si apre sopra il sito. Il codice del pannello
// si scarica solo per chi ha fatto il login (cookie admin_hint), i visitatori non lo caricano.
const AdminPanel = lazy(() => import("@/components/admin/AdminPanel"));
const AdminLogin = lazy(() => import("@/components/admin/AdminLogin"));

function AdminGate() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    const check = () => {
      if (!document.cookie.includes("admin_hint=1")) { setAuthed(false); return; }
      fetch("/api/admin/me").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
    };
    check();
    window.addEventListener("admin-auth", check);
    return () => window.removeEventListener("admin-auth", check);
  }, []);
  if (!authed) return null;
  return <Suspense fallback={null}><AdminPanel /></Suspense>;
}

const queryClient = new QueryClient();

function PageFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location]);
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  if (location === "/admin") {
    return <Suspense fallback={<PageFallback />}><AdminLogin /></Suspense>;
  }
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/menu" component={Menu} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/contact" component={Contact} />
          <Route path="/contatti" component={Contatti} />
          <Route path="/social" component={Social} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <Analytics />
          <AdminGate />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;

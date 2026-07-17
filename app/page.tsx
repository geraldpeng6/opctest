import { HomeClient } from "@/components/home-client";

export default function HomePage() {
  return (
    <main className="page-shell home-shell">
      <header className="topbar" aria-label="站点">
        <span>开卷评测场</span>
      </header>
      <HomeClient />
    </main>
  );
}

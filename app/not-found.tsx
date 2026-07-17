import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="pixel-card pad-lg stack">
        <span className="eyebrow">404 / 页面不存在</span>
        <h1 className="display">这里没有可加载的内容。</h1>
        <p className="lede">
          请求的页面不存在。可以回到首页，或直接打开第一关试卷。
        </p>
        <div className="button-row">
          <Link className="pixel-button primary" href="/">
            返回首页
          </Link>
          <Link className="pixel-button" href="/exam/level-1">
            打开试卷
          </Link>
        </div>
      </section>
    </main>
  );
}

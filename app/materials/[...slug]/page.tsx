import { notFound } from "next/navigation";

import { renderMaterialBlock } from "@/components/material-blocks";
import { getAllMaterialParams, getMaterialPageBySlug } from "@/lib/materials";

export function generateStaticParams() {
  return getAllMaterialParams();
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = getMaterialPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">{page.category}</span>
        <h1 className="display">{page.title}</h1>
        {page.summary ? <p className="lede">{page.summary}</p> : null}
      </section>

      {page.blocks.map((block, index) => (
        <section className="pixel-card pad-lg stack" key={`${page.id}-${index}`}>
          {block.title ? <h2 className="section-title">{block.title}</h2> : null}
          {renderMaterialBlock(block)}
        </section>
      ))}
    </main>
  );
}

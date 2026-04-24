import type { MaterialBlock } from "@/lib/types";

export function renderMaterialBlock(block: MaterialBlock) {
  switch (block.type) {
    case "text":
      return <p className="lede">{block.text}</p>;
    case "ordered":
      return (
        <ol className="meta-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "keyValue":
      return (
        <div className="kv-grid">
          {block.rows.map((row) => (
            <div className="kv-row" key={row.label}>
              <span className="kv-label">{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      );
    case "table":
      return (
        <table className="data-table">
          <thead>
            <tr>
              {block.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`${block.title ?? "row"}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td data-label={block.columns[cellIndex]} key={`${rowIndex}-${cellIndex}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    default:
      return null;
  }
}

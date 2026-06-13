import type { RFQSummary } from "../api/types";

interface RFQListProps {
  rfqs: RFQSummary[];
  selectedId: number | null;
  onSelect: (rfqId: number) => void;
}

export function RFQList({ rfqs, selectedId, onSelect }: RFQListProps) {
  return (
    <section className="panel">
      <h2>RFQs</h2>
      {rfqs.length === 0 ? (
        <p className="muted">No RFQs yet. Create one to get started.</p>
      ) : (
        <ul className="rfq-list">
          {rfqs.map((rfq) => (
            <li key={rfq.id}>
              <button
                type="button"
                className={selectedId === rfq.id ? "rfq-item active" : "rfq-item"}
                onClick={() => onSelect(rfq.id)}
              >
                <span className="rfq-title">{rfq.item_name}</span>
                <span className="rfq-meta">
                  Qty {rfq.quantity.toLocaleString()} · {rfq.quote_count} quote
                  {rfq.quote_count === 1 ? "" : "s"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

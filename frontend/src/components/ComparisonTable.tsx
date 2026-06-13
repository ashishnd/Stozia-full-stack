import type { ComparisonResponse } from "../api/types";

interface ComparisonTableProps {
  comparison: ComparisonResponse | null;
  loading: boolean;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ComparisonTable({ comparison, loading }: ComparisonTableProps) {
  if (loading) {
    return (
      <section className="panel">
        <h2>Quote Comparison</h2>
        <p className="muted">Loading comparison...</p>
      </section>
    );
  }

  if (!comparison) {
    return (
      <section className="panel">
        <h2>Quote Comparison</h2>
        <p className="muted">Select an RFQ to compare supplier quotes.</p>
      </section>
    );
  }

  if (comparison.rows.length === 0) {
    return (
      <section className="panel">
        <h2>Quote Comparison</h2>
        <p className="muted">No quotes yet. Add quotes manually or import from CSV.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Quote Comparison</h2>
        <p className="muted">
          Total price = unit price × quantity ({comparison.quantity.toLocaleString()})
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Lead Time</th>
              <th>Payment Terms</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.quote_id} className={row.is_best ? "best-row" : undefined}>
                <td>
                  {row.supplier_name}
                  {row.is_best && <span className="badge">Best</span>}
                </td>
                <td>{formatMoney(row.unit_price, row.currency)}</td>
                <td>
                  <strong>{formatMoney(row.total_price, row.currency)}</strong>
                </td>
                <td>{row.lead_time}</td>
                <td>{row.payment_terms}</td>
                <td>{row.remarks ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

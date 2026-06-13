import type { RFQDetail } from "../api/types";

interface RFQDetailPanelProps {
  rfq: RFQDetail;
}

export function RFQDetailPanel({ rfq }: RFQDetailPanelProps) {
  return (
    <section className="panel">
      <h2>RFQ Details</h2>
      <dl className="detail-grid">
        <div>
          <dt>Item</dt>
          <dd>{rfq.item_name}</dd>
        </div>
        <div>
          <dt>Quantity</dt>
          <dd>{rfq.quantity.toLocaleString()}</dd>
        </div>
        <div className="full-width">
          <dt>Material / specification</dt>
          <dd>{rfq.material_specification}</dd>
        </div>
        <div>
          <dt>Delivery expectation</dt>
          <dd>{rfq.delivery_expectation}</dd>
        </div>
        <div>
          <dt>Quotes received</dt>
          <dd>{rfq.quote_count}</dd>
        </div>
        {rfq.notes && (
          <div className="full-width">
            <dt>Notes</dt>
            <dd>{rfq.notes}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

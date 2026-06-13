import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import type { SupplierQuoteCreate } from "../api/types";

interface QuoteFormProps {
  rfqId: number;
  onCreated: () => void;
}

const initialForm: SupplierQuoteCreate = {
  supplier_name: "",
  unit_price: 0,
  currency: "USD",
  lead_time: "",
  payment_terms: "",
  remarks: "",
};

export function QuoteForm({ rfqId, onCreated }: QuoteFormProps) {
  const [form, setForm] = useState<SupplierQuoteCreate>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createQuote(rfqId, {
        ...form,
        remarks: form.remarks?.trim() ? form.remarks.trim() : null,
      });
      setForm(initialForm);
      onCreated();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add quote.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2>Add Supplier Quote</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Supplier name
          <input
            required
            value={form.supplier_name}
            onChange={(event) => setForm({ ...form, supplier_name: event.target.value })}
          />
        </label>

        <label>
          Unit price
          <input
            required
            type="number"
            min={0.01}
            step="0.01"
            value={form.unit_price || ""}
            onChange={(event) => setForm({ ...form, unit_price: Number(event.target.value) })}
          />
        </label>

        <label>
          Currency
          <input
            required
            maxLength={3}
            value={form.currency}
            onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })}
          />
        </label>

        <label>
          Lead time
          <input
            required
            value={form.lead_time}
            onChange={(event) => setForm({ ...form, lead_time: event.target.value })}
          />
        </label>

        <label className="full-width">
          Payment terms
          <input
            required
            value={form.payment_terms}
            onChange={(event) => setForm({ ...form, payment_terms: event.target.value })}
          />
        </label>

        <label className="full-width">
          Remarks
          <textarea
            rows={2}
            value={form.remarks ?? ""}
            onChange={(event) => setForm({ ...form, remarks: event.target.value })}
          />
        </label>

        {error && <p className="error full-width">{error}</p>}

        <div className="full-width">
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add Quote"}
          </button>
        </div>
      </form>
    </section>
  );
}

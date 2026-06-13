import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import type { RFQCreate } from "../api/types";

interface RFQFormProps {
  onCreated: (rfqId: number) => void;
}

const initialForm: RFQCreate = {
  item_name: "",
  material_specification: "",
  quantity: 1,
  delivery_expectation: "",
  notes: "",
};

export function RFQForm({ onCreated }: RFQFormProps) {
  const [form, setForm] = useState<RFQCreate>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await api.createRfq({
        ...form,
        notes: form.notes?.trim() ? form.notes.trim() : null,
      });
      setForm(initialForm);
      onCreated(created.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create RFQ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2>Create RFQ</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Item name
          <input
            required
            value={form.item_name}
            onChange={(event) => setForm({ ...form, item_name: event.target.value })}
          />
        </label>

        <label>
          Quantity
          <input
            required
            type="number"
            min={1}
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
          />
        </label>

        <label className="full-width">
          Material / specification
          <textarea
            required
            rows={3}
            value={form.material_specification}
            onChange={(event) => setForm({ ...form, material_specification: event.target.value })}
          />
        </label>

        <label className="full-width">
          Delivery expectation
          <input
            required
            value={form.delivery_expectation}
            onChange={(event) => setForm({ ...form, delivery_expectation: event.target.value })}
          />
        </label>

        <label className="full-width">
          Notes
          <textarea
            rows={2}
            value={form.notes ?? ""}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>

        {error && <p className="error full-width">{error}</p>}

        <div className="full-width">
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create RFQ"}
          </button>
        </div>
      </form>
    </section>
  );
}

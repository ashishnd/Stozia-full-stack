import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "../api/client";
import type { CSVImportError } from "../api/types";

interface CSVImportProps {
  rfqId: number;
  onImported: () => void;
}

export function CSVImport({ rfqId, onImported }: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<CSVImportError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
    setErrors([]);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setErrors([{ row: 0, field: null, message: "Please choose a CSV file." }]);
      return;
    }

    setSubmitting(true);
    setErrors([]);
    setSuccessMessage(null);

    try {
      const result = await api.importQuotesCsv(rfqId, selectedFile);

      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }

      setSuccessMessage(`Imported ${result.imported_count} quote(s) successfully.`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onImported();
    } catch (importError) {
      setErrors([
        {
          row: 0,
          field: null,
          message: importError instanceof Error ? importError.message : "CSV import failed.",
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2>Import Quotes from CSV</h2>
      <p className="muted">
        Expected columns: supplier_name, unit_price, currency, lead_time, payment_terms, remarks
        (optional).
      </p>

      <form className="import-form" onSubmit={handleSubmit}>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        <button type="submit" disabled={submitting || !selectedFile}>
          {submitting ? "Importing..." : "Import CSV"}
        </button>
      </form>

      {successMessage && <p className="success">{successMessage}</p>}

      {errors.length > 0 && (
        <div className="error-list">
          <h3>Import errors</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={`${error.row}-${error.field}-${index}`}>
                {error.row > 0 ? `Row ${error.row}` : "File"}
                {error.field ? ` (${error.field})` : ""}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

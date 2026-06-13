import type {
  ComparisonResponse,
  CSVImportResult,
  RFQCreate,
  RFQDetail,
  RFQSummary,
  SupplierQuote,
  SupplierQuoteCreate,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === "string") {
        message = errorBody.detail;
      } else if (Array.isArray(errorBody.detail)) {
        message = errorBody.detail.map((item: { msg: string }) => item.msg).join(", ");
      }
    } catch {
      // Keep default message when response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listRfqs: () => request<RFQSummary[]>("/rfqs"),

  createRfq: (payload: RFQCreate) =>
    request<RFQDetail>("/rfqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  getRfq: (rfqId: number) => request<RFQDetail>(`/rfqs/${rfqId}`),

  getComparison: (rfqId: number) => request<ComparisonResponse>(`/rfqs/${rfqId}/comparison`),

  createQuote: (rfqId: number, payload: SupplierQuoteCreate) =>
    request<SupplierQuote>(`/rfqs/${rfqId}/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  importQuotesCsv: async (rfqId: number, file: File): Promise<CSVImportResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/rfqs/${rfqId}/quotes/import`, {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as CSVImportResult;

    if (!response.ok && result.errors.length === 0) {
      throw new Error("CSV import failed.");
    }

    return result;
  },
};

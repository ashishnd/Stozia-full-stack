export interface RFQSummary {
  id: number;
  item_name: string;
  material_specification: string;
  quantity: number;
  delivery_expectation: string;
  notes: string | null;
  created_at: string;
  quote_count: number;
}

export interface SupplierQuote {
  id: number;
  rfq_id: number;
  supplier_name: string;
  unit_price: number;
  currency: string;
  lead_time: string;
  payment_terms: string;
  remarks: string | null;
  created_at: string;
  total_price: number;
}

export interface RFQDetail extends RFQSummary {
  quotes: SupplierQuote[];
}

export interface RFQCreate {
  item_name: string;
  material_specification: string;
  quantity: number;
  delivery_expectation: string;
  notes?: string | null;
}

export interface SupplierQuoteCreate {
  supplier_name: string;
  unit_price: number;
  currency: string;
  lead_time: string;
  payment_terms: string;
  remarks?: string | null;
}

export interface ComparisonRow {
  quote_id: number;
  supplier_name: string;
  unit_price: number;
  currency: string;
  total_price: number;
  lead_time: string;
  payment_terms: string;
  remarks: string | null;
  is_best: boolean;
}

export interface ComparisonResponse {
  rfq_id: number;
  item_name: string;
  quantity: number;
  rows: ComparisonRow[];
  best_quote_id: number | null;
}

export interface CSVImportError {
  row: number;
  field: string | null;
  message: string;
}

export interface CSVImportResult {
  imported_count: number;
  errors: CSVImportError[];
  quotes: SupplierQuote[];
}

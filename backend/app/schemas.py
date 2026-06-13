from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RFQCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=255)
    material_specification: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0)
    delivery_expectation: str = Field(..., min_length=1, max_length=255)
    notes: str | None = None


class RFQSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_name: str
    material_specification: str
    quantity: int
    delivery_expectation: str
    notes: str | None
    created_at: datetime
    quote_count: int = 0


class SupplierQuoteCreate(BaseModel):
    supplier_name: str = Field(..., min_length=1, max_length=255)
    unit_price: float = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    lead_time: str = Field(..., min_length=1, max_length=100)
    payment_terms: str = Field(..., min_length=1, max_length=255)
    remarks: str | None = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.strip().upper()


class SupplierQuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rfq_id: int
    supplier_name: str
    unit_price: float
    currency: str
    lead_time: str
    payment_terms: str
    remarks: str | None
    created_at: datetime
    total_price: float


class RFQDetail(RFQSummary):
    quotes: list[SupplierQuoteResponse] = []


class ComparisonRow(BaseModel):
    quote_id: int
    supplier_name: str
    unit_price: float
    currency: str
    total_price: float
    lead_time: str
    payment_terms: str
    remarks: str | None
    is_best: bool


class ComparisonResponse(BaseModel):
    rfq_id: int
    item_name: str
    quantity: int
    rows: list[ComparisonRow]
    best_quote_id: int | None = None


class CSVImportError(BaseModel):
    row: int
    field: str | None = None
    message: str


class CSVImportResult(BaseModel):
    imported_count: int
    errors: list[CSVImportError]
    quotes: list[SupplierQuoteResponse] = []

import csv
import io
from typing import Any

from app.models import SupplierQuote
from app.schemas import CSVImportError, CSVImportResult, SupplierQuoteCreate

REQUIRED_COLUMNS = {
    "supplier_name",
    "unit_price",
    "currency",
    "lead_time",
    "payment_terms",
}

OPTIONAL_COLUMNS = {"remarks"}


def _normalize_header(header: str) -> str:
    return header.strip().lower().replace(" ", "_")


def _parse_row(row_number: int, row: dict[str, str]) -> tuple[SupplierQuoteCreate | None, list[CSVImportError]]:
    errors: list[CSVImportError] = []

    supplier_name = row.get("supplier_name", "").strip()
    if not supplier_name:
        errors.append(CSVImportError(row=row_number, field="supplier_name", message="Supplier name is required."))

    unit_price_raw = row.get("unit_price", "").strip()
    unit_price: float | None = None
    if not unit_price_raw:
        errors.append(CSVImportError(row=row_number, field="unit_price", message="Unit price is required."))
    else:
        try:
            unit_price = float(unit_price_raw)
            if unit_price <= 0:
                errors.append(
                    CSVImportError(row=row_number, field="unit_price", message="Unit price must be greater than 0.")
                )
        except ValueError:
            errors.append(
                CSVImportError(row=row_number, field="unit_price", message="Unit price must be a valid number.")
            )

    currency = row.get("currency", "").strip().upper()
    if not currency:
        errors.append(CSVImportError(row=row_number, field="currency", message="Currency is required."))
    elif len(currency) != 3:
        errors.append(
            CSVImportError(row=row_number, field="currency", message="Currency must be a 3-letter ISO code.")
        )

    lead_time = row.get("lead_time", "").strip()
    if not lead_time:
        errors.append(CSVImportError(row=row_number, field="lead_time", message="Lead time is required."))

    payment_terms = row.get("payment_terms", "").strip()
    if not payment_terms:
        errors.append(CSVImportError(row=row_number, field="payment_terms", message="Payment terms are required."))

    remarks = row.get("remarks", "").strip() or None

    if errors:
        return None, errors

    return (
        SupplierQuoteCreate(
            supplier_name=supplier_name,
            unit_price=unit_price,  # type: ignore[arg-type]
            currency=currency,
            lead_time=lead_time,
            payment_terms=payment_terms,
            remarks=remarks,
        ),
        [],
    )


def import_quotes_from_csv(
    file_content: bytes,
    rfq_id: int,
    quantity: int,
) -> tuple[list[SupplierQuote], CSVImportResult]:
    text = file_content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    if not reader.fieldnames:
        return [], CSVImportResult(
            imported_count=0,
            errors=[CSVImportError(row=0, message="CSV file is empty or missing a header row.")],
        )

    normalized_fieldnames = {_normalize_header(name) for name in reader.fieldnames}
    missing_columns = REQUIRED_COLUMNS - normalized_fieldnames
    if missing_columns:
        return [], CSVImportResult(
            imported_count=0,
            errors=[
                CSVImportError(
                    row=0,
                    message=f"Missing required columns: {', '.join(sorted(missing_columns))}.",
                )
            ],
        )

    parsed_quotes: list[SupplierQuoteCreate] = []
    all_errors: list[CSVImportError] = []

    for index, raw_row in enumerate(reader, start=2):
        if not any((value or "").strip() for value in raw_row.values()):
            continue

        normalized_row: dict[str, str] = {}
        for key, value in raw_row.items():
            if key is None:
                continue
            normalized_row[_normalize_header(key)] = value or ""

        quote_data, row_errors = _parse_row(index, normalized_row)
        if row_errors:
            all_errors.extend(row_errors)
            continue
        if quote_data:
            parsed_quotes.append(quote_data)

    if all_errors:
        return [], CSVImportResult(imported_count=0, errors=all_errors)

    created_quotes: list[SupplierQuote] = []
    for quote_data in parsed_quotes:
        created_quotes.append(
            SupplierQuote(
                rfq_id=rfq_id,
                supplier_name=quote_data.supplier_name,
                unit_price=quote_data.unit_price,
                currency=quote_data.currency,
                lead_time=quote_data.lead_time,
                payment_terms=quote_data.payment_terms,
                remarks=quote_data.remarks,
            )
        )

    return created_quotes, CSVImportResult(
        imported_count=len(created_quotes),
        errors=[],
    )

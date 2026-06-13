from app.models import SupplierQuote
from app.schemas import ComparisonResponse, ComparisonRow, SupplierQuoteResponse


def calculate_total_price(unit_price: float, quantity: int) -> float:
    return round(unit_price * quantity, 2)


def quote_to_response(quote: SupplierQuote, quantity: int) -> SupplierQuoteResponse:
    return SupplierQuoteResponse(
        id=quote.id,
        rfq_id=quote.rfq_id,
        supplier_name=quote.supplier_name,
        unit_price=quote.unit_price,
        currency=quote.currency,
        lead_time=quote.lead_time,
        payment_terms=quote.payment_terms,
        remarks=quote.remarks,
        created_at=quote.created_at,
        total_price=calculate_total_price(quote.unit_price, quantity),
    )


def build_comparison(
    rfq_id: int,
    item_name: str,
    quantity: int,
    quotes: list[SupplierQuote],
) -> ComparisonResponse:
    rows: list[ComparisonRow] = []
    best_quote_id: int | None = None
    lowest_total: float | None = None

    for quote in quotes:
        total_price = calculate_total_price(quote.unit_price, quantity)
        rows.append(
            ComparisonRow(
                quote_id=quote.id,
                supplier_name=quote.supplier_name,
                unit_price=quote.unit_price,
                currency=quote.currency,
                total_price=total_price,
                lead_time=quote.lead_time,
                payment_terms=quote.payment_terms,
                remarks=quote.remarks,
                is_best=False,
            )
        )

        if lowest_total is None or total_price < lowest_total:
            lowest_total = total_price
            best_quote_id = quote.id

    if best_quote_id is not None:
        for row in rows:
            row.is_best = row.quote_id == best_quote_id

    return ComparisonResponse(
        rfq_id=rfq_id,
        item_name=item_name,
        quantity=quantity,
        rows=rows,
        best_quote_id=best_quote_id,
    )

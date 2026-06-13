from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RFQ, SupplierQuote
from app.schemas import CSVImportResult, SupplierQuoteCreate, SupplierQuoteResponse
from app.services.comparison import quote_to_response
from app.services.csv_import import import_quotes_from_csv

router = APIRouter(prefix="/api/rfqs/{rfq_id}/quotes", tags=["quotes"])


def _get_rfq_or_404(rfq_id: int, db: Session) -> RFQ:
    rfq = db.get(RFQ, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")
    return rfq


@router.post("", response_model=SupplierQuoteResponse, status_code=status.HTTP_201_CREATED)
def create_quote(rfq_id: int, payload: SupplierQuoteCreate, db: Session = Depends(get_db)):
    rfq = _get_rfq_or_404(rfq_id, db)

    quote = SupplierQuote(
        rfq_id=rfq.id,
        supplier_name=payload.supplier_name,
        unit_price=payload.unit_price,
        currency=payload.currency,
        lead_time=payload.lead_time,
        payment_terms=payload.payment_terms,
        remarks=payload.remarks,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)

    return quote_to_response(quote, rfq.quantity)


@router.post("/import", response_model=CSVImportResult)
async def import_quotes_csv(
    rfq_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    rfq = _get_rfq_or_404(rfq_id, db)

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are supported.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    quotes, result = import_quotes_from_csv(content, rfq.id, rfq.quantity)
    if result.errors:
        return result

    for quote in quotes:
        db.add(quote)
    db.commit()

    for quote in quotes:
        db.refresh(quote)

    result.quotes = [quote_to_response(quote, rfq.quantity) for quote in quotes]
    return result

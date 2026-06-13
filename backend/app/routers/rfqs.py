from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RFQ
from app.schemas import RFQCreate, RFQDetail, RFQSummary
from app.services.comparison import build_comparison, quote_to_response

router = APIRouter(prefix="/api/rfqs", tags=["rfqs"])


@router.get("", response_model=list[RFQSummary])
def list_rfqs(db: Session = Depends(get_db)):
    rfqs = db.query(RFQ).order_by(RFQ.created_at.desc()).all()
    return [
        RFQSummary(
            id=rfq.id,
            item_name=rfq.item_name,
            material_specification=rfq.material_specification,
            quantity=rfq.quantity,
            delivery_expectation=rfq.delivery_expectation,
            notes=rfq.notes,
            created_at=rfq.created_at,
            quote_count=len(rfq.quotes),
        )
        for rfq in rfqs
    ]


@router.post("", response_model=RFQDetail, status_code=status.HTTP_201_CREATED)
def create_rfq(payload: RFQCreate, db: Session = Depends(get_db)):
    rfq = RFQ(
        item_name=payload.item_name,
        material_specification=payload.material_specification,
        quantity=payload.quantity,
        delivery_expectation=payload.delivery_expectation,
        notes=payload.notes,
    )
    db.add(rfq)
    db.commit()
    db.refresh(rfq)

    return RFQDetail(
        id=rfq.id,
        item_name=rfq.item_name,
        material_specification=rfq.material_specification,
        quantity=rfq.quantity,
        delivery_expectation=rfq.delivery_expectation,
        notes=rfq.notes,
        created_at=rfq.created_at,
        quote_count=0,
        quotes=[],
    )


@router.get("/{rfq_id}", response_model=RFQDetail)
def get_rfq(rfq_id: int, db: Session = Depends(get_db)):
    rfq = db.get(RFQ, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")

    return RFQDetail(
        id=rfq.id,
        item_name=rfq.item_name,
        material_specification=rfq.material_specification,
        quantity=rfq.quantity,
        delivery_expectation=rfq.delivery_expectation,
        notes=rfq.notes,
        created_at=rfq.created_at,
        quote_count=len(rfq.quotes),
        quotes=[quote_to_response(quote, rfq.quantity) for quote in rfq.quotes],
    )


@router.get("/{rfq_id}/comparison")
def get_comparison(rfq_id: int, db: Session = Depends(get_db)):
    rfq = db.get(RFQ, rfq_id)
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")

    return build_comparison(rfq.id, rfq.item_name, rfq.quantity, rfq.quotes)

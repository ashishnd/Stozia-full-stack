"""Seed the database with sample RFQs and supplier quotes."""

from app.database import Base, SessionLocal, engine
from app.models import RFQ, SupplierQuote

SAMPLE_RFQS = [
    {
        "item_name": "Stainless Steel Fasteners",
        "material_specification": "M8 x 40mm, Grade 316, passivated finish",
        "quantity": 5000,
        "delivery_expectation": "Within 4 weeks of PO",
        "notes": "Required for marine equipment assembly line.",
        "quotes": [
            {
                "supplier_name": "Precision Metals Co.",
                "unit_price": 0.42,
                "currency": "USD",
                "lead_time": "3 weeks",
                "payment_terms": "Net 30",
                "remarks": "Includes standard packaging.",
            },
            {
                "supplier_name": "Global Fastener Supply",
                "unit_price": 0.39,
                "currency": "USD",
                "lead_time": "5 weeks",
                "payment_terms": "50% advance, 50% on delivery",
                "remarks": "Lowest unit price but longer lead time.",
            },
            {
                "supplier_name": "EuroBolt GmbH",
                "unit_price": 0.45,
                "currency": "EUR",
                "lead_time": "2 weeks",
                "payment_terms": "Net 45",
                "remarks": "Fastest delivery from EU warehouse.",
            },
        ],
    },
    {
        "item_name": "Aluminum Extrusion Profiles",
        "material_specification": "6061-T6, 40mm x 40mm, anodized black",
        "quantity": 1200,
        "delivery_expectation": "Rolling monthly deliveries",
        "notes": "Used for modular frame kits.",
        "quotes": [
            {
                "supplier_name": "AluPro Manufacturing",
                "unit_price": 12.75,
                "currency": "USD",
                "lead_time": "6 weeks",
                "payment_terms": "Net 30",
                "remarks": "MOQ applies for custom anodizing.",
            },
            {
                "supplier_name": "FrameWorks Industries",
                "unit_price": 11.90,
                "currency": "USD",
                "lead_time": "8 weeks",
                "payment_terms": "Net 60",
                "remarks": "Best total price in sample data.",
            },
        ],
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(RFQ).count() > 0:
            print("Database already seeded. Skipping.")
            return

        for sample in SAMPLE_RFQS:
            quotes = sample.pop("quotes")
            rfq = RFQ(**sample)
            db.add(rfq)
            db.flush()

            for quote_data in quotes:
                db.add(SupplierQuote(rfq_id=rfq.id, **quote_data))

        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

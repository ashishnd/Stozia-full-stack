from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RFQ(Base):
    __tablename__ = "rfqs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    material_specification: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    delivery_expectation: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    quotes: Mapped[list["SupplierQuote"]] = relationship(
        "SupplierQuote",
        back_populates="rfq",
        cascade="all, delete-orphan",
        order_by="SupplierQuote.id",
    )


class SupplierQuote(Base):
    __tablename__ = "supplier_quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rfq_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    supplier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    lead_time: Mapped[str] = mapped_column(String(100), nullable=False)
    payment_terms: Mapped[str] = mapped_column(String(255), nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    rfq: Mapped["RFQ"] = relationship("RFQ", back_populates="quotes")

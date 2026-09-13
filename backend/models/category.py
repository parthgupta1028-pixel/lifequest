from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), default="folder")
    color = Column(String(30), default="#3B82F6")
    is_system = Column(Boolean, default=False)

    user = relationship("User", back_populates="categories")
    tasks = relationship("Task", back_populates="category")

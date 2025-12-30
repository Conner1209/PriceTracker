from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    identifier_type: str = Field(..., alias="identifierType")
    identifier_value: str = Field(..., alias="identifierValue")

    model_config = ConfigDict(populate_by_name=True)

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str
    created_at: Optional[str] = Field(None, alias="createdAt")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

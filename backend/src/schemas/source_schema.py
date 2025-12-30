from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class SourceBase(BaseModel):
    product_id: str = Field(..., alias="productId")
    store_name: str = Field(..., alias="storeName")
    url: str
    css_selector: Optional[str] = Field(None, alias="cssSelector")
    json_path: Optional[str] = Field(None, alias="jsonPath")
    is_active: bool = Field(True, alias="isActive")

    model_config = ConfigDict(populate_by_name=True)

class SourceCreate(SourceBase):
    pass

class SourceResponse(SourceBase):
    id: str
    created_at: Optional[str] = Field(None, alias="createdAt")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

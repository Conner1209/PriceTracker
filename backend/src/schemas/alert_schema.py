from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class AlertBase(BaseModel):
    product_id: str = Field(..., alias="productId")
    source_id: str = Field(..., alias="sourceId")
    target_price: float = Field(..., alias="targetPrice")
    webhook_url: Optional[str] = Field(None, alias="webhookUrl")
    is_active: bool = Field(True, alias="isActive")

    model_config = ConfigDict(populate_by_name=True)

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    target_price: Optional[float] = Field(None, alias="targetPrice")
    webhook_url: Optional[str] = Field(None, alias="webhookUrl")
    is_active: Optional[bool] = Field(None, alias="isActive")

    model_config = ConfigDict(populate_by_name=True)

class AlertResponse(AlertBase):
    id: str
    is_triggered: bool = Field(False, alias="isTriggered")
    created_at: Optional[str] = Field(None, alias="createdAt")
    triggered_at: Optional[str] = Field(None, alias="triggeredAt")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

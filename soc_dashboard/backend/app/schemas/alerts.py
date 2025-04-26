from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime


class Alert(BaseModel):
    """Base alert schema for creating new alerts"""
    timestamp: datetime
    alert_type: str
    src_ip: str
    dst_ip: str
    severity: int
    details: str


class AlertResponse(BaseModel):
    """Schema for alert responses with ID"""
    id: str
    timestamp: datetime
    alert_type: str
    src_ip: str
    dst_ip: str
    severity: int
    details: str
    scan_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class WazuhAlert(BaseModel):
    """Schema matching the Wazuh alert format"""
    timestamp: str
    rule: Dict
    agent: Dict
    manager: Dict
    data: Dict
    location: str
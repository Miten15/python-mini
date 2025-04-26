from pydantic import BaseModel
from typing import Dict, List, Optional


class PCAPUploadResponse(BaseModel):
    """Schema for PCAP upload and analysis response"""
    scan_id: str
    filename: str
    timestamp: str
    connections: int
    dns_queries: int
    alerts: int
    scan_folder: str
    status: str
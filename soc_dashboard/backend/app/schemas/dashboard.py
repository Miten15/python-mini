from pydantic import BaseModel
from typing import Dict, List, Optional

class DashboardStats(BaseModel):
    """Schema for dashboard statistics"""
    total_alerts: int
    alerts_by_severity: Dict[int, int]
    alerts_by_type: Dict[str, int]
    recent_scans: int
    top_source_ips: List[Dict[str, str]]
    top_target_ips: List[Dict[str, str]]
    recent_alerts: List[Dict]
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import sys
import json
from datetime import datetime
import subprocess
import shutil
from typing import Optional, List
import uuid

# Add parent directory to path to import PCAP analyzer modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

# Import our PCAP analyzer modules
from services.pcap_service import PCAPService
from schemas.alerts import Alert, AlertResponse
from schemas.pcap_upload import PCAPUploadResponse
from schemas.dashboard import DashboardStats

app = FastAPI(title="SOC Dashboard API", 
              description="API for the Security Operations Center Dashboard",
              version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
pcap_service = PCAPService()

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {"message": "SOC Dashboard API is running"}

@app.get("/api/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get the dashboard stats for quick overview"""
    return pcap_service.get_dashboard_stats()

@app.post("/api/upload", response_model=PCAPUploadResponse)
async def upload_pcap(file: UploadFile = File(...)):
    """Upload and analyze a PCAP file"""
    # Check if file is a PCAP
    if not file.filename.lower().endswith(('.pcap', '.pcapng')):
        raise HTTPException(status_code=400, detail="File must be a PCAP/PCAPNG file")
    
    # Process the PCAP
    result = await pcap_service.process_pcap(file)
    return result

@app.get("/api/alerts", response_model=List[AlertResponse])
async def get_alerts(limit: int = 100, offset: int = 0, alert_type: Optional[str] = None):
    """Get alerts with pagination and optional filtering"""
    return pcap_service.get_alerts(limit, offset, alert_type)

@app.get("/api/scans", response_model=List[dict])
async def get_scans():
    """Get a list of all PCAP analysis scans"""
    return pcap_service.get_scans()

@app.get("/api/scans/{scan_id}")
async def get_scan_details(scan_id: str):
    """Get details of a specific scan"""
    scan = pcap_service.get_scan_details(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@app.get("/api/alerts/{alert_id}")
async def get_alert_details(alert_id: str):
    """Get detailed information about a specific alert"""
    alert = pcap_service.get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
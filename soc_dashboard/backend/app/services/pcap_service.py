import os
import sys
import json
import uuid
import subprocess
import shutil
from fastapi import UploadFile
from datetime import datetime
import csv
from typing import List, Dict, Optional
import asyncio
from collections import Counter

# Add parent directory to path to import the PCAP analyzer modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../')))

# Import PCAP analyzer components
import lib.pcap_processor
import lib.threat_detector
from lib.wazuh_integrator import WazuhIntegrator


class PCAPService:
    """Service for handling PCAP file processing and alerts"""

    def __init__(self):
        """Initialize the PCAP service"""
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../'))
        self.upload_dir = os.path.join(self.base_dir, 'uploads')
        self.logs_dir = os.path.join(self.base_dir, 'logs')
        self.wazuh_alerts_file = os.path.join(self.logs_dir, 'wazuh_alerts.json')
        
        # Create necessary directories
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)

    async def process_pcap(self, file: UploadFile) -> Dict:
        """Process an uploaded PCAP file"""
        # Generate a unique scan ID
        scan_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save the uploaded file
        filename = f"{scan_id}_{file.filename}"
        file_path = os.path.join(self.upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create folder path for scan results
        scan_folder_name = f"{os.path.splitext(file.filename)[0]}_{timestamp}"
        scan_folder = os.path.join(self.logs_dir, scan_folder_name)
        os.makedirs(scan_folder, exist_ok=True)
        
        # Run the PCAP analyzer as a subprocess to avoid blocking the API
        cmd = [
            "python",
            os.path.join(self.base_dir, "pcap_analyzer.py"),
            file_path,
            "--output-dir", scan_folder
        ]
        
        try:
            # Run the analyzer asynchronously
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                return {
                    "scan_id": scan_id,
                    "filename": file.filename,
                    "timestamp": timestamp,
                    "connections": 0,
                    "dns_queries": 0,
                    "alerts": 0,
                    "scan_folder": scan_folder,
                    "status": "failed"
                }
            
            # Gather stats from the scan results
            connections = 0
            dns_queries = 0
            alerts = 0
            
            # Read scan info if available
            scan_info_path = os.path.join(scan_folder, "scan_info.txt")
            if os.path.exists(scan_info_path):
                with open(scan_info_path, "r") as f:
                    scan_info = f.read()
                    # Extract numbers from scan info
                    for line in scan_info.split("\n"):
                        if "Total connections:" in line:
                            connections = int(line.split(":")[1].strip())
                        elif "Total DNS queries:" in line:
                            dns_queries = int(line.split(":")[1].strip())
                        elif "Detected threats:" in line:
                            alerts = int(line.split(":")[1].strip())
            
            # Create a scan record
            result = {
                "scan_id": scan_id,
                "filename": file.filename,
                "timestamp": timestamp,
                "connections": connections,
                "dns_queries": dns_queries,
                "alerts": alerts,
                "scan_folder": scan_folder,
                "status": "completed"
            }
            
            # Save scan metadata
            with open(os.path.join(scan_folder, "scan_metadata.json"), "w") as f:
                json.dump(result, f)
                
            return result
            
        except Exception as e:
            return {
                "scan_id": scan_id,
                "filename": file.filename,
                "timestamp": timestamp,
                "connections": 0,
                "dns_queries": 0,
                "alerts": 0,
                "scan_folder": scan_folder,
                "status": f"error: {str(e)}"
            }

    def get_alerts(self, limit: int = 100, offset: int = 0, alert_type: Optional[str] = None) -> List[Dict]:
        """Get alerts with pagination and optional filtering"""
        alerts = []
        
        # Read alerts from the Wazuh alerts file
        if os.path.exists(self.wazuh_alerts_file):
            try:
                with open(self.wazuh_alerts_file, "r") as f:
                    wazuh_alerts = json.load(f)
                
                for idx, alert in enumerate(wazuh_alerts):
                    # Generate a unique ID for each alert
                    alert_id = str(uuid.uuid4())
                    
                    # Convert Wazuh format to our API format
                    api_alert = {
                        "id": alert_id,
                        "timestamp": datetime.strptime(alert["timestamp"], "%Y-%m-%dT%H:%M:%S.%fZ"),
                        "alert_type": alert["data"]["alert_type"],
                        "src_ip": alert["data"]["src_ip"],
                        "dst_ip": alert["data"]["dst_ip"],
                        "severity": alert["data"]["severity"],
                        "details": alert["rule"]["description"]
                    }
                    
                    # Apply filtering if specified
                    if alert_type and api_alert["alert_type"] != alert_type:
                        continue
                        
                    alerts.append(api_alert)
            except Exception as e:
                print(f"Error reading Wazuh alerts: {e}")
        
        # Apply pagination
        paginated_alerts = alerts[offset:offset+limit]
        
        return paginated_alerts

    def get_scans(self) -> List[Dict]:
        """Get a list of all PCAP analysis scans"""
        scans = []
        
        # Iterate through folders in the logs directory
        for item in os.listdir(self.logs_dir):
            item_path = os.path.join(self.logs_dir, item)
            
            # Check if it's a directory and looks like a scan folder
            if os.path.isdir(item_path) and "_" in item:
                # Look for scan metadata
                metadata_path = os.path.join(item_path, "scan_metadata.json")
                
                if os.path.exists(metadata_path):
                    try:
                        with open(metadata_path, "r") as f:
                            scan = json.load(f)
                            scans.append(scan)
                    except Exception:
                        # If metadata is not available or corrupt, create basic info
                        scan = {
                            "scan_id": item.split("_")[1] if len(item.split("_")) > 1 else "unknown",
                            "filename": item,
                            "timestamp": item.split("_")[-1] if "_" in item else "",
                            "scan_folder": item_path,
                            "status": "unknown"
                        }
                        scans.append(scan)
                else:
                    # If no metadata file, create basic info from folder name
                    scan = {
                        "scan_id": item.split("_")[1] if len(item.split("_")) > 1 else "unknown",
                        "filename": item,
                        "timestamp": item.split("_")[-1] if "_" in item else "",
                        "scan_folder": item_path,
                        "status": "unknown"
                    }
                    scans.append(scan)
        
        # Sort by timestamp, newest first
        scans.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return scans
        
    def get_scan_details(self, scan_id: str) -> Optional[Dict]:
        """Get details of a specific scan"""
        # Find the scan folder based on the ID
        for scan in self.get_scans():
            if scan["scan_id"] == scan_id:
                scan_folder = scan["scan_folder"]
                
                # Read all available files in the scan folder
                files = {}
                
                # Check for connection log
                conn_log_path = os.path.join(scan_folder, "conn_log.csv")
                if os.path.exists(conn_log_path):
                    with open(conn_log_path, "r") as f:
                        reader = csv.DictReader(f)
                        files["connections"] = [row for row in reader][:100]  # Limit to first 100
                
                # Check for DNS log
                dns_log_path = os.path.join(scan_folder, "dns_log.csv")
                if os.path.exists(dns_log_path):
                    with open(dns_log_path, "r") as f:
                        reader = csv.DictReader(f)
                        files["dns_queries"] = [row for row in reader][:100]  # Limit to first 100
                
                # Check for alerts
                alerts_path = os.path.join(scan_folder, "alerts.csv")
                if os.path.exists(alerts_path):
                    with open(alerts_path, "r") as f:
                        reader = csv.DictReader(f)
                        files["alerts"] = [row for row in reader]
                
                # Add files to scan data
                scan["files"] = files
                return scan
                
        return None
        
    def get_alert_by_id(self, alert_id: str) -> Optional[Dict]:
        """Get an alert by its ID"""
        # Since we generate UUIDs on the fly, this function is not actually useful
        # in a production system, we'd store alerts in a database with proper IDs
        
        # For this demo, we'll return None since we can't actually look up alerts by ID
        return None
        
    def get_dashboard_stats(self) -> Dict:
        """Get statistics for the dashboard"""
        # Get all alerts
        alerts = self.get_alerts(limit=1000)  # Get up to 1000 alerts for stats
        
        # Count alerts by severity
        severity_counts = {}
        for alert in alerts:
            severity = alert["severity"]
            if severity not in severity_counts:
                severity_counts[severity] = 0
            severity_counts[severity] += 1
        
        # Count alerts by type
        type_counts = {}
        for alert in alerts:
            alert_type = alert["alert_type"]
            if alert_type not in type_counts:
                type_counts[alert_type] = 0
            type_counts[alert_type] += 1
        
        # Get top source IPs
        src_ips = [alert["src_ip"] for alert in alerts]
        src_ip_counts = Counter(src_ips).most_common(5)
        top_src_ips = [{"ip": ip, "count": count} for ip, count in src_ip_counts]
        
        # Get top destination IPs
        dst_ips = [alert["dst_ip"] for alert in alerts]
        dst_ip_counts = Counter(dst_ips).most_common(5)
        top_dst_ips = [{"ip": ip, "count": count} for ip, count in dst_ip_counts]
        
        # Get recent scans
        scans = self.get_scans()
        recent_scans_count = len(scans[:10])
        
        # Return the stats
        return {
            "total_alerts": len(alerts),
            "alerts_by_severity": severity_counts,
            "alerts_by_type": type_counts,
            "recent_scans": recent_scans_count,
            "top_source_ips": top_src_ips,
            "top_target_ips": top_dst_ips,
            "recent_alerts": alerts[:10]  # Return the 10 most recent alerts
        }
#!/usr/bin/env python3
"""
PCAP Analyzer with Wazuh Integration
-----------------------------------
Analyzes PCAP files for suspicious network activity and integrates with Wazuh.
"""

import argparse
import logging
import os
import sys
import yaml
import json  # Add this import at the top of the file
from datetime import datetime
from pathlib import Path

# Import local modules
from lib.pcap_processor import PCAPProcessor
from lib.threat_detector import ThreatDetector
from lib.wazuh_integrator import WazuhIntegrator
from lib.logger import setup_logging

def load_config(config_path):
    """Load configuration from YAML file"""
    try:
        config_path = Path(config_path).resolve()
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        logging.error(f"Failed to load configuration: {e}")
        sys.exit(1)

def create_scan_folder(pcap_file_path, base_output_dir="logs"):
    """Create a dedicated folder for this scan based on file name and timestamp"""
    # Get file name without extension
    pcap_name = Path(pcap_file_path).stem
    
    # Create timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create folder name
    folder_name = f"{pcap_name}_{timestamp}"
    folder_path = os.path.join(base_output_dir, folder_name)
    
    # Create the folder
    os.makedirs(folder_path, exist_ok=True)
    
    return folder_path

def save_wazuh_format_alerts(alerts, output_file):
    """Save alerts in Wazuh format to a local JSON file when Wazuh integration is disabled"""
    try:
        if not alerts:
            logging.warning("No alerts to save in Wazuh format")
            return
            
        wazuh_alerts = []
        for alert in alerts:
            alert_time = datetime.fromtimestamp(alert['timestamp']).strftime('%Y-%m-%dT%H:%M:%S.%fZ')
            
            wazuh_alert = {
                "timestamp": alert_time,
                "rule": {
                    "level": alert['severity'],
                    "description": alert['details'],
                    "id": f"100{alert['severity']}",
                    "pcap_analyzer": True
                },
                "agent": {
                    "name": "pcap_analyzer",
                    "id": "000"
                },
                "manager": {
                    "name": "pcap_analyzer"
                },
                "data": {
                    "alert_type": alert['alert_type'],
                    "src_ip": alert['src_ip'],
                    "dst_ip": alert['dst_ip'],
                    "severity": alert['severity'],
                },
                "location": "pcap_analyzer"
            }
            wazuh_alerts.append(wazuh_alert)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        
        # Write alerts to file
        with open(output_file, 'w') as f:
            json.dump(wazuh_alerts, f, indent=2)
        
        logging.info(f"Wazuh format alerts saved to {output_file}")
        
    except Exception as e:
        logging.error(f"Error saving Wazuh format alerts: {e}", exc_info=True)

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="PCAP Analyzer with Wazuh Integration")
    parser.add_argument("pcap_file", help="Path to the PCAP file to analyze")
    parser.add_argument("--config", default="config/config.yaml", 
                        help="Path to configuration file (default: config/config.yaml)")
    parser.add_argument("--output-dir", default="logs", 
                        help="Base directory to store output logs (default: logs)")
    parser.add_argument("--no-wazuh", action="store_true", 
                        help="Disable Wazuh integration")
    
    # Handle arguments more robustly
    try:
        args = parser.parse_args()
    except Exception as e:
        print(f"Error parsing arguments: {e}")
        print("Try enclosing the file path in quotes if it contains spaces or special characters.")
        sys.exit(1)
    
    # Convert file path to a resolved Path object
    pcap_file_path = Path(args.pcap_file).resolve()
    
    # Check if PCAP file exists
    if not pcap_file_path.is_file():
        print(f"Error: PCAP file not found: {pcap_file_path}")
        sys.exit(1)
    
    # Create a dedicated folder for this scan
    scan_folder = create_scan_folder(pcap_file_path, args.output_dir)
    
    # Load configuration
    config = load_config(args.config)
    
    # Override configuration with command-line arguments
    config['logging']['log_dir'] = scan_folder
    if args.no_wazuh:
        config['wazuh']['enabled'] = False
    
    # Keep the standard location for Wazuh alerts
    config['wazuh']['local_fallback'] = True
    
    # Setup logging with scan-specific log file
    setup_logging(config['logging'])
    
    # Create output directory if it doesn't exist
    os.makedirs(scan_folder, exist_ok=True)
    
    # Initialize components
    pcap_processor = PCAPProcessor(config)
    threat_detector = ThreatDetector(config)
    
    # Initialize Wazuh integrator if enabled
    wazuh_integrator = None
    if config['wazuh']['enabled']:
        wazuh_integrator = WazuhIntegrator(config['wazuh'])
    
    try:
        logger = logging.getLogger()
        logger.info(f"Starting analysis of PCAP file: {pcap_file_path}")
        logger.info(f"Results will be saved to: {scan_folder}")
        start_time = datetime.now()
        
        # Process PCAP file
        conn_data, dns_data = pcap_processor.process_pcap(str(pcap_file_path))
        
        # Save connection and DNS logs
        conn_log_path = os.path.join(scan_folder, "conn_log.csv")
        dns_log_path = os.path.join(scan_folder, "dns_log.csv")
        
        pcap_processor.save_conn_log(conn_data, conn_log_path)
        pcap_processor.save_dns_log(dns_data, dns_log_path)
        
        # Detect threats
        alerts = threat_detector.detect_threats(conn_data, dns_data)
        
        # Save alerts to file
        alerts_log_path = os.path.join(scan_folder, "alerts.csv")
        threat_detector.save_alerts(alerts, alerts_log_path)
        
        # Save scan summary info
        with open(os.path.join(scan_folder, "scan_info.txt"), "w") as f:
            f.write(f"PCAP Analysis Summary\n")
            f.write(f"====================\n\n")
            f.write(f"File analyzed: {pcap_file_path}\n")
            f.write(f"Analysis date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total connections: {len(conn_data)}\n")
            f.write(f"Total DNS queries: {len(dns_data)}\n")
            f.write(f"Detected threats: {len(alerts)}\n\n")
            
            if len(alerts) > 0:
                f.write("Alert summary:\n")
                alert_types = {}
                for alert in alerts:
                    if alert['alert_type'] not in alert_types:
                        alert_types[alert['alert_type']] = 0
                    alert_types[alert['alert_type']] += 1
                
                for alert_type, count in alert_types.items():
                    f.write(f"- {alert_type}: {count}\n")
        
        # Send alerts to Wazuh if enabled
        if wazuh_integrator and alerts:
            logger.info(f"Sending {len(alerts)} alerts to Wazuh (or saving to local file if Wazuh server is unavailable)")
            for alert in alerts:
                wazuh_integrator.send_alert(alert)
        else:
            # Save alerts in Wazuh format to local file
            save_wazuh_format_alerts(alerts, config['wazuh']['local_alerts_file'])
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info(f"Analysis complete in {duration:.2f} seconds")
        logger.info(f"Processed {len(conn_data)} connections and {len(dns_data)} DNS queries")
        logger.info(f"Detected {len(alerts)} potential threats")
        logger.info(f"Results saved to {scan_folder}")
        
        # Print summary to console
        print(f"\nAnalysis complete!")
        print(f"- Processed {len(conn_data)} connections and {len(dns_data)} DNS queries")
        print(f"- Detected {len(alerts)} potential threats")
        print(f"- Results saved to {scan_folder}")
        
    except Exception as e:
        logging.error(f"Analysis failed: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
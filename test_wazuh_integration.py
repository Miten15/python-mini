#!/usr/bin/env python3
"""
Test Script for Wazuh Integration
--------------------------------
This script helps test the Wazuh integration of the PCAP analyzer without
requiring a full Wazuh server installation.
"""

import os
import sys
import yaml
import logging
from datetime import datetime
import json
from pathlib import Path

# Import local modules
from lib.wazuh_integrator import WazuhIntegrator

def load_config(config_path):
    """Load configuration from YAML file"""
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        logging.error(f"Failed to load configuration: {e}")
        sys.exit(1)

def create_sample_alert():
    """Create a sample alert for testing"""
    now = datetime.now()
    timestamp = now.timestamp()
    
    return {
        'timestamp': timestamp,
        'alert_type': 'TEST_ALERT',
        'src_ip': '192.168.1.100',
        'dst_ip': '10.0.0.1',
        'severity': 8,
        'details': 'This is a test alert for Wazuh integration'
    }

def main():
    # Basic logging configuration
    logging.basicConfig(level=logging.INFO, 
                      format='%(asctime)s - %(levelname)s - %(message)s')
    logger = logging.getLogger(__name__)
    
    # Load configuration
    config_path = "config/config.yaml"
    if not os.path.exists(config_path):
        logger.error(f"Configuration file not found: {config_path}")
        sys.exit(1)
        
    config = load_config(config_path)
    
    # Display current Wazuh configuration
    logger.info("Current Wazuh configuration:")
    logger.info(f"- Enabled: {config['wazuh']['enabled']}")
    logger.info(f"- Host: {config['wazuh']['api']['host']}")
    logger.info(f"- Port: {config['wazuh']['api']['port']}")
    logger.info(f"- Protocol: {config['wazuh']['api']['protocol']}")
    logger.info(f"- Local Fallback: {config['wazuh'].get('local_fallback', False)}")
    
    # Create Wazuh integrator
    wazuh = WazuhIntegrator(config['wazuh'])
    
    # Test connection
    logger.info("Testing connection to Wazuh server...")
    connection_status = wazuh.test_connection()
    
    if connection_status:
        logger.info("✅ Successfully connected to Wazuh server")
    else:
        logger.warning("❌ Could not connect to Wazuh server")
        
        if config['wazuh'].get('local_fallback', False):
            logger.info("Local fallback is enabled, alerts will be saved locally")
        else:
            logger.warning("Local fallback is disabled, alerts will be dropped")
    
    # Create and send sample alert
    logger.info("Creating sample alert...")
    alert = create_sample_alert()
    
    logger.info("Sending sample alert to Wazuh...")
    result = wazuh.send_alert(alert)
    
    if result:
        logger.info("✅ Alert was successfully processed")
        
        # Check if local fallback file was created
        if not connection_status and config['wazuh'].get('local_fallback', False):
            fallback_file = config['wazuh'].get('local_alerts_file', 'logs/wazuh_alerts.json')
            if os.path.exists(fallback_file):
                logger.info(f"Local fallback file created at: {fallback_file}")
                
                # Display contents of local fallback file
                try:
                    with open(fallback_file, 'r') as f:
                        alerts = json.load(f)
                        logger.info(f"Local fallback file contains {len(alerts)} alerts")
                except Exception as e:
                    logger.error(f"Error reading local fallback file: {e}")
    else:
        logger.error("❌ Failed to process alert")
    
    logger.info("Test completed")

if __name__ == "__main__":
    main()
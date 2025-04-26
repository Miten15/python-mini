# SOC Dashboard Backend

This is the backend API for the SOC (Security Operations Center) Dashboard, a web application for analyzing PCAP files and visualizing network security alerts.

## Features

- PCAP file upload and analysis
- Alert detection and categorization
- Integration with Wazuh security monitoring
- API endpoints for dashboard statistics and data visualization
- Support for large PCAP file processing

## Prerequisites

- Python 3.10 or higher
- uvicorn (ASGI server)
- FastAPI
- Required Python packages (listed in requirements.txt)

## Getting Started

### 1. Set up a virtual environment (recommended)

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
cd soc_dashboard/backend
pip install -r requirements.txt
```

### 3. Configure the application

The backend relies on the main PCAP analyzer configuration. Make sure your config.yaml file is properly set up in the main project directory.

### 4. Run the development server

```bash
cd soc_dashboard/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

### 5. API Documentation

Once the server is running, you can access the auto-generated API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py            # FastAPI application entry point
│   ├── api/               # API routes
│   ├── core/              # Core application functionality
│   ├── schemas/           # Pydantic models
│   │   ├── alerts.py
│   │   ├── dashboard.py
│   │   └── pcap_upload.py
│   └── services/          # Business logic services
│       └── pcap_service.py # PCAP processing service
```

## API Endpoints

- `GET /api/stats` - Get dashboard statistics
- `POST /api/upload` - Upload and analyze PCAP files
- `GET /api/alerts` - List security alerts with filtering
- `GET /api/alerts/{alert_id}` - Get details for a specific alert
- `GET /api/scans` - List all PCAP scans
- `GET /api/scans/{scan_id}` - Get details for a specific scan

## Development

To create a requirements.txt file:

```bash
pip freeze > requirements.txt
```

## Integration with Frontend

The backend is designed to work with the Next.js frontend. To run the full application:

1. Start the backend server (as described above)
2. Start the frontend development server (see frontend README.md)
3. Access the application at http://localhost:3000

## Troubleshooting

### Common Issues

1. **Missing dependencies**
   - Ensure all required packages are installed: `pip install -r requirements.txt`

2. **Permission errors when accessing PCAP files**
   - Check file permissions for the upload directory
   - Run with appropriate privileges

3. **Integration with main PCAP analyzer fails**
   - Verify the path to the main PCAP analyzer is correctly set
   - Check that the config.yaml file is properly configured

## License

This project is licensed under the MIT License - see the LICENSE file for details.
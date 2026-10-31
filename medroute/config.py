"""
Configuration Module for MedRoute Flask Application
Academic Project: MedRoute (MCA Mini Project - DAA)
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "medroute-mca-daa-secret-key-2026")
    
    # MySQL Database Configuration
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "127.0.0.1")
    MYSQL_PORT = int(os.environ.get("MYSQL_PORT", 3306))
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
    MYSQL_DB = os.environ.get("MYSQL_DB", "medroute_db")

    # Routing API Endpoint (OSRM public demo service by default)
    OSRM_API_URL = os.environ.get("OSRM_API_URL", "https://router.project-osrm.org")

    # Fallback to local SQLite if MySQL server is offline during initial viva demo
    ENABLE_SQLITE_FALLBACK = os.environ.get("ENABLE_SQLITE_FALLBACK", "true").lower() == "true"
    SQLITE_DB_PATH = os.environ.get("SQLITE_DB_PATH", "medroute_local.db")

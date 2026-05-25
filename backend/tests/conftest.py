"""
Pytest configuration — ensures app modules are importable.
"""
import sys
from pathlib import Path

# Add backend root to path so 'from app.services...' works
sys.path.insert(0, str(Path(__file__).parent.parent))

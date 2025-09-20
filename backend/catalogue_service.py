"""
ERP Catalogue Management Service
Handles catalogue upload, display, send, and delete functionality
"""

import os
import uuid
import shutil
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, UploadFile
from pydantic import BaseModel
import json
import logging

logger = logging.getLogger(__name__)

class CatalogueItem(BaseModel):
    id: str
    name: str
    description: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: str
    upload_date: datetime
    category: str = "general"
    tags: List[str] = []
    is_active: bool = True

class CatalogueService:
    def __init__(self):
        self.upload_directory = "/app/catalogues"
        self.catalogue_db_file = "/app/catalogues/catalogue_db.json"
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure upload directories exist"""
        os.makedirs(self.upload_directory, exist_ok=True)
        if not os.path.exists(self.catalogue_db_file):
            with open(self.catalogue_db_file, 'w') as f:
                json.dump([], f)
    
    def _load_catalogue_db(self) -> List[Dict]:
        """Load catalogue database"""
        try:
            with open(self.catalogue_db_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading catalogue DB: {e}")
            return []
    
    def _save_catalogue_db(self, catalogue_data: List[Dict]):
        """Save catalogue database"""
        try:
            with open(self.catalogue_db_file, 'w') as f:
                json.dump(catalogue_data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving catalogue DB: {e}")
            raise HTTPException(status_code=500, detail="Failed to save catalogue data")
    
    async def upload_catalogue_file(self, file: UploadFile, uploaded_by: str, 
                                  category: str = "general", tags: List[str] = None) -> CatalogueItem:
        """Upload a new catalogue file"""
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = os.path.splitext(file.filename)[1]
            safe_filename = f"{file_id}{file_extension}"
            file_path = os.path.join(self.upload_directory, safe_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Create catalogue item
            catalogue_item = CatalogueItem(
                id=file_id,
                name=file.filename,
                description=f"Catalogue item: {file.filename}",
                file_path=file_path,
                file_type=file.content_type or "application/octet-stream",
                file_size=len(content),
                uploaded_by=uploaded_by,
                upload_date=datetime.now(timezone.utc),
                category=category,
                tags=tags or [],
                is_active=True
            )
            
            # Save to database
            catalogue_db = self._load_catalogue_db()
            catalogue_db.append(catalogue_item.dict())
            self._save_catalogue_db(catalogue_db)
            
            logger.info(f"Catalogue file uploaded: {file.filename} by {uploaded_by}")
            return catalogue_item
            
        except Exception as e:
            logger.error(f"Error uploading catalogue file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to upload catalogue file: {str(e)}")
    
    def get_all_catalogues(self, active_only: bool = True) -> List[CatalogueItem]:
        """Get all catalogue items"""
        try:
            catalogue_db = self._load_catalogue_db()
            
            if active_only:
                catalogue_db = [item for item in catalogue_db if item.get('is_active', True)]
            
            return [CatalogueItem(**item) for item in catalogue_db]
            
        except Exception as e:
            logger.error(f"Error getting catalogues: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve catalogues")
    
    def get_catalogue_by_id(self, catalogue_id: str) -> Optional[CatalogueItem]:
        """Get catalogue item by ID"""
        try:
            catalogue_db = self._load_catalogue_db()
            
            for item in catalogue_db:
                if item.get('id') == catalogue_id:
                    return CatalogueItem(**item)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting catalogue by ID: {e}")
            return None
    
    def delete_catalogue(self, catalogue_id: str, deleted_by: str) -> bool:
        """Delete catalogue item (soft delete)"""
        try:
            catalogue_db = self._load_catalogue_db()
            
            for item in catalogue_db:
                if item.get('id') == catalogue_id:
                    item['is_active'] = False
                    item['deleted_by'] = deleted_by
                    item['deleted_date'] = datetime.now(timezone.utc).isoformat()
                    
                    self._save_catalogue_db(catalogue_db)
                    logger.info(f"Catalogue deleted: {catalogue_id} by {deleted_by}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting catalogue: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete catalogue")
    
    def permanently_delete_catalogue(self, catalogue_id: str) -> bool:
        """Permanently delete catalogue item and file"""
        try:
            catalogue_db = self._load_catalogue_db()
            
            for i, item in enumerate(catalogue_db):
                if item.get('id') == catalogue_id:
                    # Delete physical file
                    if os.path.exists(item.get('file_path', '')):
                        os.remove(item['file_path'])
                    
                    # Remove from database
                    catalogue_db.pop(i)
                    self._save_catalogue_db(catalogue_db)
                    
                    logger.info(f"Catalogue permanently deleted: {catalogue_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error permanently deleting catalogue: {e}")
            raise HTTPException(status_code=500, detail="Failed to permanently delete catalogue")
    
    def get_catalogue_file_path(self, catalogue_id: str) -> Optional[str]:
        """Get file path for catalogue item"""
        catalogue_item = self.get_catalogue_by_id(catalogue_id)
        if catalogue_item and os.path.exists(catalogue_item.file_path):
            return catalogue_item.file_path
        return None
    
    def get_catalogue_categories(self) -> List[str]:
        """Get all unique categories"""
        try:
            catalogue_db = self._load_catalogue_db()
            categories = set()
            
            for item in catalogue_db:
                if item.get('is_active', True):
                    categories.add(item.get('category', 'general'))
            
            return sorted(list(categories))
            
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            return ['general']
    
    def search_catalogues(self, query: str, category: str = None) -> List[CatalogueItem]:
        """Search catalogue items"""
        try:
            catalogue_db = self._load_catalogue_db()
            results = []
            
            query_lower = query.lower()
            
            for item in catalogue_db:
                if not item.get('is_active', True):
                    continue
                
                # Category filter
                if category and item.get('category') != category:
                    continue
                
                # Text search
                if (query_lower in item.get('name', '').lower() or 
                    query_lower in item.get('description', '').lower() or
                    any(query_lower in tag.lower() for tag in item.get('tags', []))):
                    results.append(CatalogueItem(**item))
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching catalogues: {e}")
            return []

# Global catalogue service instance
catalogue_service = CatalogueService()
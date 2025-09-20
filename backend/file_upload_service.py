"""
File Upload Service for Aavana Greens Application
Handles multi-file uploads, S3 integration, thumbnails, and resumable uploads
"""

import os
import uuid
import asyncio
import hashlib
import mimetypes
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, AsyncGenerator
from io import BytesIO
import logging

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config
from PIL import Image, ImageOps
import aiofiles
from fastapi import HTTPException, UploadFile
import magic

logger = logging.getLogger(__name__)

class FileUploadService:
    """Comprehensive file upload service with S3 integration"""
    
    def __init__(self):
        self.region_name = 'ap-south-1'
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'aavana-greens-storage')
        self.max_file_size = 500 * 1024 * 1024  # 500MB
        self.allowed_extensions = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
            'videos': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
            'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
            'archives': ['.zip', '.rar', '.7z', '.tar', '.gz']
        }
        
        # Initialize S3 client (optional)
        self.s3_client = None
        self.s3_enabled = False
        try:
            self._initialize_s3_client()
            self.s3_enabled = True
        except Exception as e:
            logger.warning(f"S3 not available: {e}. File upload service will work in local mode.")
        
        # Initialize magic for MIME type detection
        self.magic_mime = magic.Magic(mime=True)
        
        # Thumbnail settings
        self.thumbnail_sizes = {
            'small': (150, 150),
            'medium': (300, 300),
            'large': (600, 600)
        }
    
    def _initialize_s3_client(self):
        """Initialize S3 client with optimized configuration"""
        try:
            config = Config(
                region_name=self.region_name,
                signature_version='v4',
                retries={'max_attempts': 3, 'mode': 'adaptive'},
                max_pool_connections=50
            )
            
            self.s3_client = boto3.client('s3', config=config)
            
            # Verify bucket access
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"S3 client initialized successfully for bucket: {self.bucket_name}")
            
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            raise Exception("AWS credentials not configured")
        except ClientError as e:
            logger.error(f"Error accessing S3 bucket: {e}")
            raise Exception("S3 bucket access error")
    
    async def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """Comprehensive file validation"""
        validation_result = {
            'valid': False,
            'errors': [],
            'warnings': [],
            'file_info': {}
        }
        
        try:
            # Read file content for validation
            content = await file.read()
            await file.seek(0)  # Reset file pointer
            
            # Basic validations
            if len(content) == 0:
                validation_result['errors'].append("File is empty")
                return validation_result
            
            if len(content) > self.max_file_size:
                validation_result['errors'].append(f"File size exceeds maximum limit of {self.max_file_size} bytes")
                return validation_result
            
            # MIME type detection
            detected_mime = self.magic_mime.from_buffer(content)
            declared_mime = file.content_type
            
            validation_result['file_info'] = {
                'original_filename': file.filename,
                'size': len(content),
                'declared_mime_type': declared_mime,
                'detected_mime_type': detected_mime,
                'file_extension': os.path.splitext(file.filename)[1].lower()
            }
            
            # MIME type consistency check
            if declared_mime != detected_mime:
                validation_result['warnings'].append(
                    f"Declared MIME type ({declared_mime}) differs from detected type ({detected_mime})"
                )
            
            # Extension validation
            file_extension = validation_result['file_info']['file_extension']
            if not self._is_allowed_extension(file_extension):
                validation_result['errors'].append(f"File extension {file_extension} not allowed")
                return validation_result
            
            # Content-specific validation
            if detected_mime.startswith('image/'):
                image_validation = await self._validate_image_content(content)
                validation_result['file_info'].update(image_validation)
                if not image_validation.get('valid', True):
                    validation_result['errors'].extend(image_validation.get('errors', []))
            
            validation_result['valid'] = len(validation_result['errors']) == 0
            return validation_result
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            validation_result['errors'].append(f"Validation error: {str(e)}")
            return validation_result
    
    def _is_allowed_extension(self, extension: str) -> bool:
        """Check if file extension is allowed"""
        for category, extensions in self.allowed_extensions.items():
            if extension in extensions:
                return True
        return False
    
    async def _validate_image_content(self, content: bytes) -> Dict[str, Any]:
        """Validate image-specific content"""
        try:
            with Image.open(BytesIO(content)) as img:
                return {
                    'valid': True,
                    'width': img.width,
                    'height': img.height,
                    'format': img.format,
                    'mode': img.mode
                }
        except Exception as e:
            return {
                'valid': False,
                'errors': [f"Invalid image format: {str(e)}"]
            }
    
    async def upload_file(self, file: UploadFile, project_id: Optional[str] = None, 
                         user_id: Optional[str] = None) -> Dict[str, Any]:
        """Upload file to S3 with metadata and thumbnail generation"""
        if not self.s3_enabled:
            raise HTTPException(status_code=503, detail="File upload service not available - S3 not configured")
            
        try:
            # Validate file
            validation = await self.validate_file(file)
            if not validation['valid']:
                raise HTTPException(status_code=400, detail=validation['errors'])
            
            # Generate unique file key
            file_id = str(uuid.uuid4())
            file_extension = validation['file_info']['file_extension']
            timestamp = datetime.now().strftime('%Y/%m/%d')
            
            s3_key = f"uploads/{timestamp}/{file_id}{file_extension}"
            
            # Read file content
            content = await file.read()
            await file.seek(0)
            
            # Prepare metadata
            metadata = {
                'original-filename': validation['file_info']['original_filename'],
                'file-id': file_id,
                'upload-timestamp': datetime.utcnow().isoformat(),
                'file-size': str(len(content)),
                'mime-type': validation['file_info']['detected_mime_type']
            }
            
            if project_id:
                metadata['project-id'] = project_id
            if user_id:
                metadata['user-id'] = user_id
            
            # Upload to S3
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=s3_key,
                    Body=content,
                    ContentType=validation['file_info']['detected_mime_type'],
                    Metadata=metadata,
                    ServerSideEncryption='AES256'
                )
                
                logger.info(f"File uploaded successfully: {s3_key}")
                
            except ClientError as e:
                logger.error(f"S3 upload failed: {e}")
                raise HTTPException(status_code=500, detail="File upload failed")
            
            # Generate thumbnails for images
            thumbnails = {}
            if validation['file_info']['detected_mime_type'].startswith('image/'):
                thumbnails = await self._generate_thumbnails(content, s3_key, file_extension)
            
            # Generate presigned URL for access
            try:
                presigned_url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': s3_key},
                    ExpiresIn=3600  # 1 hour
                )
            except ClientError as e:
                logger.warning(f"Failed to generate presigned URL: {e}")
                presigned_url = None
            
            return {
                'file_id': file_id,
                's3_key': s3_key,
                'original_filename': validation['file_info']['original_filename'],
                'file_size': len(content),
                'mime_type': validation['file_info']['detected_mime_type'],
                'upload_timestamp': datetime.utcnow().isoformat(),
                'presigned_url': presigned_url,
                'thumbnails': thumbnails,
                'project_id': project_id,
                'user_id': user_id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Upload process error: {e}")
            raise HTTPException(status_code=500, detail="Upload processing failed")
    
    async def _generate_thumbnails(self, content: bytes, s3_key: str, 
                                 file_extension: str) -> Dict[str, str]:
        """Generate thumbnails for images"""
        thumbnails = {}
        
        try:
            with Image.open(BytesIO(content)) as img:
                # Fix image orientation
                img = ImageOps.exif_transpose(img)
                
                for size_name, dimensions in self.thumbnail_sizes.items():
                    # Create thumbnail
                    thumbnail = img.copy()
                    thumbnail.thumbnail(dimensions, Image.Resampling.LANCZOS)
                    
                    # Save thumbnail to bytes
                    thumbnail_io = BytesIO()
                    thumbnail_format = 'JPEG' if img.mode == 'RGB' else 'PNG'
                    thumbnail.save(thumbnail_io, format=thumbnail_format, quality=85)
                    thumbnail_content = thumbnail_io.getvalue()
                    
                    # Generate thumbnail S3 key
                    base_key = s3_key.rsplit('.', 1)[0]
                    thumbnail_key = f"{base_key}_thumbnail_{size_name}.jpg"
                    
                    # Upload thumbnail to S3
                    try:
                        self.s3_client.put_object(
                            Bucket=self.bucket_name,
                            Key=thumbnail_key,
                            Body=thumbnail_content,
                            ContentType='image/jpeg',
                            ServerSideEncryption='AES256'
                        )
                        
                        # Generate presigned URL for thumbnail
                        thumbnail_url = self.s3_client.generate_presigned_url(
                            'get_object',
                            Params={'Bucket': self.bucket_name, 'Key': thumbnail_key},
                            ExpiresIn=3600
                        )
                        
                        thumbnails[size_name] = thumbnail_url
                        
                    except ClientError as e:
                        logger.warning(f"Failed to upload thumbnail {size_name}: {e}")
                        continue
                
        except Exception as e:
            logger.error(f"Thumbnail generation failed: {e}")
        
        return thumbnails
    
    async def upload_multiple_files(self, files: List[UploadFile], 
                                  project_id: Optional[str] = None,
                                  user_id: Optional[str] = None) -> Dict[str, Any]:
        """Upload multiple files concurrently"""
        if len(files) > 10:  # Limit concurrent uploads
            raise HTTPException(status_code=400, detail="Maximum 10 files per upload")
        
        results = {
            'successful_uploads': [],
            'failed_uploads': [],
            'total_files': len(files),
            'total_size': 0
        }
        
        # Process files concurrently
        upload_tasks = []
        for file in files:
            task = self.upload_file(file, project_id, user_id)
            upload_tasks.append(task)
        
        # Wait for all uploads to complete
        upload_results = await asyncio.gather(*upload_tasks, return_exceptions=True)
        
        for i, result in enumerate(upload_results):
            if isinstance(result, Exception):
                results['failed_uploads'].append({
                    'filename': files[i].filename,
                    'error': str(result)
                })
            else:
                results['successful_uploads'].append(result)
                results['total_size'] += result['file_size']
        
        return results
    
    async def delete_file(self, s3_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            
            # Also delete thumbnails if they exist
            base_key = s3_key.rsplit('.', 1)[0]
            for size_name in self.thumbnail_sizes.keys():
                thumbnail_key = f"{base_key}_thumbnail_{size_name}.jpg"
                try:
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=thumbnail_key)
                except ClientError:
                    pass  # Thumbnail might not exist
            
            return True
            
        except ClientError as e:
            logger.error(f"Failed to delete file {s3_key}: {e}")
            return False
    
    async def get_file_info(self, s3_key: str) -> Optional[Dict[str, Any]]:
        """Get file information from S3"""
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            
            return {
                's3_key': s3_key,
                'size': response['ContentLength'],
                'last_modified': response['LastModified'].isoformat(),
                'content_type': response['ContentType'],
                'metadata': response.get('Metadata', {})
            }
            
        except ClientError as e:
            logger.error(f"Failed to get file info for {s3_key}: {e}")
            return None
    
    def generate_presigned_upload_url(self, filename: str, content_type: str,
                                    expires_in: int = 3600) -> Dict[str, str]:
        """Generate presigned URL for direct client upload"""
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(filename)[1].lower()
        timestamp = datetime.now().strftime('%Y/%m/%d')
        
        s3_key = f"uploads/{timestamp}/{file_id}{file_extension}"
        
        try:
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key,
                    'ContentType': content_type
                },
                ExpiresIn=expires_in
            )
            
            return {
                'upload_url': presigned_url,
                's3_key': s3_key,
                'file_id': file_id
            }
            
        except ClientError as e:
            logger.error(f"Failed to generate presigned upload URL: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate upload URL")

# Singleton instance
file_upload_service = FileUploadService()
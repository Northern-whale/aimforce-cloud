"""Content Uploader - Handle file uploads and cloud storage"""

from pathlib import Path
from typing import Optional, List
import os


class ContentUploader:
    """Handle content uploads and cloud storage"""
    
    def __init__(self, storage_type: str = "local"):
        """
        Initialize uploader
        
        Args:
            storage_type: "local", "s3", or "gcs"
        """
        self.storage_type = storage_type
        
        if storage_type == "s3":
            self._init_s3()
        elif storage_type == "gcs":
            self._init_gcs()
    
    def _init_s3(self):
        """Initialize AWS S3 client"""
        try:
            import boto3
            self.s3_client = boto3.client('s3')
            self.bucket_name = os.getenv('S3_BUCKET_NAME', 'ai-content-studio')
            print(f"S3 storage initialized (bucket: {self.bucket_name})")
        except Exception as e:
            print(f"Error initializing S3: {e}")
            self.s3_client = None
    
    def _init_gcs(self):
        """Initialize Google Cloud Storage client"""
        print("GCS storage not yet implemented, falling back to local")
        self.storage_type = "local"
    
    def upload_file(
        self,
        local_path: Path,
        remote_path: Optional[str] = None
    ) -> str:
        """
        Upload file to storage
        
        Returns: URL or path to uploaded file
        """
        if not remote_path:
            remote_path = f"uploads/{local_path.name}"
        
        if self.storage_type == "s3":
            return self._upload_to_s3(local_path, remote_path)
        else:
            return str(local_path.absolute())
    
    def _upload_to_s3(self, local_path: Path, remote_path: str) -> str:
        """Upload to S3"""
        if not self.s3_client:
            raise ValueError("S3 not initialized")
        
        try:
            self.s3_client.upload_file(
                str(local_path),
                self.bucket_name,
                remote_path
            )
            
            url = f"https://{self.bucket_name}.s3.amazonaws.com/{remote_path}"
            return url
        except Exception as e:
            print(f"Error uploading to S3: {e}")
            raise
    
    def upload_directory(
        self,
        local_dir: Path,
        remote_prefix: Optional[str] = None
    ) -> List[str]:
        """Upload entire directory"""
        urls = []
        
        for file_path in local_dir.rglob('*'):
            if file_path.is_file():
                rel_path = file_path.relative_to(local_dir)
                remote_path = f"{remote_prefix}/{rel_path}" if remote_prefix else str(rel_path)
                
                url = self.upload_file(file_path, remote_path)
                urls.append(url)
        
        return urls

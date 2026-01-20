import os
import uuid
from pathlib import Path
from PIL import Image
from fastapi import UploadFile, HTTPException, status
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def validate_image(file: UploadFile) -> None:
    """Validate uploaded image file."""
    logger.debug(f"Validating image: {file.filename}")

    # Check if filename exists
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

    # Check file extension
    file_ext = file.filename.split(".")[-1].lower()
    logger.debug(f"File extension: {file_ext}")

    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file_ext}'. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Check content type
    logger.debug(f"Content type: {file.content_type}")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    logger.debug("Image validation passed!")


async def save_upload_file(file: UploadFile) -> str:
    """
    Save uploaded file to disk.
    Returns the relative path to the saved file.
    """
    logger.info(f"Starting file upload for: {file.filename}")

    # Validate file
    validate_image(file)

    # Create uploads directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    logger.debug(f"Upload directory: {upload_dir.absolute()}")

    # Generate unique filename
    file_ext = file.filename.split(".")[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = upload_dir / unique_filename
    logger.info(f"Saving to: {file_path}")

    # Read file content
    content = await file.read()
    logger.debug(f"Read {len(content)} bytes")

    # Check file size
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024 * 1024)}MB"
        )

    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    logger.info(f"File saved successfully!")

    # Optimize/compress image
    try:
        optimize_image(file_path)
        logger.debug("Image optimized successfully!")
    except Exception as e:
        logger.warning(f"Could not optimize image: {e}")

    # Return relative path (just the filename)
    return unique_filename


def optimize_image(file_path: Path, max_size: tuple = (1920, 1920), quality: int = 85) -> None:
    """
    Optimize image by resizing and compressing.
    """
    try:
        with Image.open(file_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background

            # Resize if larger than max_size
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)

            # Save with optimization
            img.save(file_path, optimize=True, quality=quality)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )


def delete_image(file_path: str) -> None:
    """Delete an image file."""
    try:
        full_path = Path(settings.UPLOAD_DIR) / file_path
        if full_path.exists():
            full_path.unlink()
    except Exception as e:
        logger.warning(f"Could not delete image {file_path}: {e}")

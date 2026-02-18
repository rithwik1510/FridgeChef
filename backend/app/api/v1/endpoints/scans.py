import asyncio
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.limiter import limiter
from app.database import get_db
from app.models.scan import Scan
from app.models.user import User
from app.schemas.scan import ScanResponse, ScanUpdate
from app.services.auth import get_current_user, get_optional_user
from app.services.groq_service import detect_ingredients_from_image
from app.services.image import save_upload_file
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_scan(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user)
):
    """
    Upload a fridge image and detect ingredients.
    """
    logger.info("=== SCAN UPLOAD STARTED ===")
    logger.info(f"File name: {file.filename}")
    logger.info(f"Content type: {file.content_type}")

    try:
        # Save the uploaded image
        logger.info("Saving uploaded image...")
        image_path = await save_upload_file(file)
        logger.info(f"Image saved to: {image_path}")

        # Create scan record
        logger.info("Creating scan record...")
        scan = Scan(
            user_id=current_user.id if current_user else "guest-demo",
            image_path=image_path,
            status="processing",
            ingredients=[]
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        logger.info(f"Scan created with ID: {scan.id}")

        # Detect ingredients (run in thread to avoid blocking event loop)
        logger.info("Calling Gemini to detect ingredients...")
        try:
            ingredients = await asyncio.to_thread(detect_ingredients_from_image, image_path)
            scan.ingredients = ingredients
            scan.status = "completed"
            logger.info(f"SUCCESS: Found {len(ingredients)} ingredients")
        except Exception as e:
            scan.status = "failed"
            logger.error(f"ERROR detecting ingredients: {e}")
            import traceback
            logger.error(traceback.format_exc())

        db.commit()
        db.refresh(scan)

        logger.info(f"=== SCAN COMPLETED: {scan.status} ===")
        return scan

    except HTTPException:
        # Re-raise HTTP exceptions (like validation errors)
        raise
    except Exception as e:
        logger.error("=== SCAN FAILED ===")
        logger.error(f"Error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing scan: {str(e)}"
        ) from e


@router.get("", response_model=list[ScanResponse])
@limiter.limit("60/minute")
async def list_scans(
    request: Request,
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """
    List user's scans.
    """
    scans = db.query(Scan).filter(
        Scan.user_id == current_user.id
    ).order_by(
        Scan.created_at.desc()
    ).offset(offset).limit(limit).all()

    return scans


@router.get("/{scan_id}", response_model=ScanResponse)
@limiter.limit("60/minute")
async def get_scan(
    request: Request,
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user)
):
    """
    Get a specific scan with ingredients.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )

    # Allow guest access if the scan belongs to guest-demo
    if scan.user_id != "guest-demo" and (not current_user or scan.user_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this scan"
        )

    return scan


@router.put("/{scan_id}", response_model=ScanResponse)
@limiter.limit("30/minute")
async def update_scan(
    request: Request,
    scan_id: str,
    scan_update: ScanUpdate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user)
):
    """
    Update scan ingredients (user corrections).
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )

    if scan.user_id != "guest-demo" and (not current_user or scan.user_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this scan"
        )

    # Update ingredients
    scan.ingredients = scan_update.ingredients
    db.commit()
    db.refresh(scan)

    return scan


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_scan(
    request: Request,
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a scan and its associated image file.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )

    if scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this scan"
        )

    # Delete associated image file from disk
    if scan.image_path:
        image_file = Path(settings.UPLOAD_DIR) / scan.image_path
        if image_file.exists():
            try:
                image_file.unlink()
                logger.info(f"Deleted image file: {image_file}")
            except OSError as e:
                logger.warning(f"Could not delete image file {image_file}: {e}")

    db.delete(scan)
    db.commit()

    return None

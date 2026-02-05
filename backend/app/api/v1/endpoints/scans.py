
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.scan import Scan
from app.models.user import User
from app.schemas.scan import ScanResponse, ScanUpdate
from app.services.auth import get_current_user
from app.services.gemini import detect_ingredients_from_image
from app.services.image import save_upload_file
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_scan(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
            user_id=current_user.id,
            image_path=image_path,
            status="processing",
            ingredients=[]
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        logger.info(f"Scan created with ID: {scan.id}")

        # Detect ingredients
        logger.info("Calling Gemini to detect ingredients...")
        try:
            ingredients = detect_ingredients_from_image(image_path)
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
    limit: int = 20,
    offset: int = 0,
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
    current_user: User = Depends(get_current_user)
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

    if scan.user_id != current_user.id:
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
    current_user: User = Depends(get_current_user)
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

    if scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this scan"
        )

    # Update ingredients
    scan.ingredients = scan_update.ingredients
    db.commit()
    db.refresh(scan)

    return scan

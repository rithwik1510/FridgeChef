"""Add performance indexes for list and sort endpoints

Revision ID: 003_performance_indexes
Revises: 002_password_reset
Create Date: 2026-02-09

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "003_performance_indexes"
down_revision: Union[str, None] = "002_password_reset"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_recipes_user_created_at "
        "ON recipes (user_id, created_at DESC)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_recipes_user_favorite_created_at "
        "ON recipes (user_id, is_favorite, created_at DESC)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_recipes_user_difficulty_cook_time "
        "ON recipes (user_id, difficulty, cook_time)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_pantry_items_user_category_name "
        "ON pantry_items (user_id, category, name)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_scans_user_created_at "
        "ON scans (user_id, created_at DESC)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_shopping_lists_user_created_at "
        "ON shopping_lists (user_id, created_at DESC)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_shopping_lists_user_created_at")
    op.execute("DROP INDEX IF EXISTS ix_scans_user_created_at")
    op.execute("DROP INDEX IF EXISTS ix_pantry_items_user_category_name")
    op.execute("DROP INDEX IF EXISTS ix_recipes_user_difficulty_cook_time")
    op.execute("DROP INDEX IF EXISTS ix_recipes_user_favorite_created_at")
    op.execute("DROP INDEX IF EXISTS ix_recipes_user_created_at")

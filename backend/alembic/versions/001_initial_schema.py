"""Initial schema with all models

Revision ID: 001_initial
Revises:
Create Date: 2026-02-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(100)),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('preferences', sa.JSON(), default={}),
    )

    # Create scans table
    op.create_table(
        'scans',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('image_path', sa.String(500), nullable=False),
        sa.Column('status', sa.String(50), default='processing'),
        sa.Column('ingredients', sa.JSON(), default=[]),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Create recipes table
    op.create_table(
        'recipes',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), index=True),
        sa.Column('scan_id', sa.String(36), sa.ForeignKey('scans.id', ondelete='SET NULL'), index=True),
        sa.Column('title', sa.String(300), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('cook_time', sa.Integer()),
        sa.Column('difficulty', sa.String(50)),
        sa.Column('servings', sa.Integer()),
        sa.Column('ingredients', sa.JSON(), nullable=False),
        sa.Column('instructions', sa.JSON(), nullable=False),
        sa.Column('is_favorite', sa.Boolean(), default=False),
        sa.Column('times_made', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Create shopping_lists table
    op.create_table(
        'shopping_lists',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('recipe_id', sa.String(36), sa.ForeignKey('recipes.id', ondelete='SET NULL'), index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('items', sa.JSON(), default=[]),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Create pantry_items table
    op.create_table(
        'pantry_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('quantity', sa.String(100), default='some'),
        sa.Column('category', sa.String(100), default='Other'),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('added_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('pantry_items')
    op.drop_table('shopping_lists')
    op.drop_table('recipes')
    op.drop_table('scans')
    op.drop_table('users')

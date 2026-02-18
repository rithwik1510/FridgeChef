"""Add password reset token fields to users

Revision ID: 002_password_reset
Revises: 001_initial
Create Date: 2026-02-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_password_reset'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('reset_token', sa.String(64), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(), nullable=True))
    op.create_index('ix_users_reset_token', 'users', ['reset_token'])


def downgrade() -> None:
    op.drop_index('ix_users_reset_token', table_name='users')
    op.drop_column('users', 'reset_token_expires')
    op.drop_column('users', 'reset_token')

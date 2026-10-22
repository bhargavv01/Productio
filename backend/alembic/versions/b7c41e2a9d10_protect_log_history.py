"""protect log history: restrict category delete, index log times

Revision ID: b7c41e2a9d10
Revises: 9099af093781
Create Date: 2026-10-22 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b7c41e2a9d10'
down_revision: Union[str, Sequence[str], None] = '9099af093781'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FK_NAME = 'log_entries_category_id_fkey'


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(FK_NAME, 'log_entries', type_='foreignkey')
    op.create_foreign_key(
        FK_NAME, 'log_entries', 'categories', ['category_id'], ['id'], ondelete='RESTRICT'
    )
    op.create_index(op.f('ix_log_entries_start_time'), 'log_entries', ['start_time'], unique=False)
    op.create_index(op.f('ix_log_entries_end_time'), 'log_entries', ['end_time'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_log_entries_end_time'), table_name='log_entries')
    op.drop_index(op.f('ix_log_entries_start_time'), table_name='log_entries')
    op.drop_constraint(FK_NAME, 'log_entries', type_='foreignkey')
    op.create_foreign_key(
        FK_NAME, 'log_entries', 'categories', ['category_id'], ['id'], ondelete='CASCADE'
    )

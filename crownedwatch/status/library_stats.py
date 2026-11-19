COUNTS = """
    SELECT SUM(is_folder) folders,
           SUM(is_folder=0 AND archived=0 AND status='ready') ready,
           SUM(is_folder=0 AND archived=0 AND status='processing') processing,
           SUM(is_folder=0 AND status='failed') failed,
           SUM(is_folder=0 AND archived=1) archived
    FROM node
"""


def counts(db) -> dict:
    totals = dict(db.execute(COUNTS).fetchone())

    return {name: value or 0 for name, value in totals.items()}


def failed(db) -> list[dict]:
    rows = db.execute("SELECT id, name, error FROM node WHERE status='failed'")

    return [dict(failed_row) for failed_row in rows]


def name_of(db, node_id) -> str | None:
    node_row = db.execute("SELECT name FROM node WHERE id=?", (node_id,)).fetchone()

    return node_row["name"] if node_row else None

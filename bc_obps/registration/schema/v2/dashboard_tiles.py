from ninja import Schema


class DashboardTile(Schema):
    """
    Schema for the dashboard tile
    """

    content: str
    href: str
    title: str

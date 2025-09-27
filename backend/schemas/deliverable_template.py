from pydantic import BaseModel


class DeliverableTemplate(BaseModel):
    id: str
    name: str
    type: str

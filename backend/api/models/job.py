from pydantic import BaseModel

class Job(BaseModel):
    title: str
    application_url: str
    company: str
    location: str
    salary: str
    benefits: str

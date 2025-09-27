from enum import Enum


class ContactMethod(str, Enum):
    email = "email"
    sms = "sms"
    whatsapp = "whatsapp"
    slack = "slack"

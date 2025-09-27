import logging
import os
import smtplib
from email.message import EmailMessage
from textwrap import dedent

logger = logging.getLogger(__name__)


def _bool_from_env(var_name: str, default: str = "true") -> bool:
    value = os.getenv(var_name, default).strip().lower()
    return value in {"1", "true", "yes", "on"}


def _send_email(recipient: str, subject: str, body: str) -> None:
    host = os.getenv("SMTP_HOST")
    port_raw = os.getenv("SMTP_PORT", "587")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_SENDER") or username

    if not host:
        logger.warning("SMTP_HOST is not configured. Skipping email delivery.")
        logger.info(body)
        return

    try:
        port = int(port_raw)
    except ValueError:
        logger.error("Invalid SMTP_PORT value '%s'. Skipping email delivery.", port_raw)
        logger.info(body)
        return

    if not sender:
        logger.warning("SMTP_SENDER/SMTP_USERNAME is not configured. Skipping email delivery.")
        logger.info(body)
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = recipient
    message.set_content(body)

    use_ssl = _bool_from_env("SMTP_USE_SSL", "false")
    use_tls = _bool_from_env("SMTP_USE_TLS", "true")

    try:
        if use_ssl:
            smtp: smtplib.SMTP = smtplib.SMTP_SSL(host, port)
        else:
            smtp = smtplib.SMTP(host, port)

        with smtp as server:
            server.ehlo()
            if not use_ssl and use_tls:
                server.starttls()
                server.ehlo()

            if username and password:
                server.login(username, password)

            server.send_message(message)

        logger.info("Sent email '%s' to %s", subject, recipient)
    except Exception:
        logger.exception("Failed to send email '%s' to %s", subject, recipient)
        logger.info(body)


def send_registration_code_email(recipient: str, code: str) -> None:
    body = dedent(
        f"""
        Gracias por registrarte en AI Act Compliance Manager.
        Tu código de verificación es: {code}

        Este código caduca en unos minutos. Introduce el código en la pantalla de verificación para completar tu alta.
        """
    ).strip()

    _send_email(
        recipient=recipient,
        subject="Código de verificación - AI Act Compliance Manager",
        body=body,
    )


def send_welcome_email(recipient: str, full_name: str) -> None:
    body = dedent(
        f"""
        Hola {full_name},

        ¡Tu cuenta en AI Act Compliance Manager está activa! Ya puedes acceder al panel de control y comenzar a trabajar.
        """
    ).strip()

    _send_email(
        recipient=recipient,
        subject="Bienvenida - AI Act Compliance Manager",
        body=body,
    )

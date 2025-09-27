import logging
from textwrap import dedent

logger = logging.getLogger(__name__)


def send_registration_code_email(recipient: str, code: str) -> None:
    message = dedent(
        f"""
        [Email] Registration verification
        To: {recipient}

        Gracias por registrarte en AI Act Compliance Manager.
        Tu código de verificación es: {code}

        Este código caduca en unos minutos. Introduce el código en la pantalla de verificación para completar tu alta.
        """
    ).strip()
    logger.info(message)


def send_welcome_email(recipient: str, full_name: str) -> None:
    message = dedent(
        f"""
        [Email] Bienvenida
        To: {recipient}

        Hola {full_name},

        ¡Tu cuenta en AI Act Compliance Manager está activa! Ya puedes acceder al panel de control y comenzar a trabajar.
        """
    ).strip()
    logger.info(message)

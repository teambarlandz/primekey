"""Upload validation helpers.

Pure-Python magic-byte (file signature) checking with an allowlist for
landlord document uploads. No external dependencies (libmagic/python-magic
not required) and safe to run in any environment.

Rejects:
- anything whose content does not match a whitelisted signature,
- double-extension tricks (e.g. ``proof.pdf.exe``),
- zero-byte / unreadable files.
"""

import zipfile
from pathlib import Path

_MAGIC_CHUNK_SIZE = 512 * 1024  # 512 KB read for validation


def _read_head(file_obj, size=_MAGIC_CHUNK_SIZE):
    file_obj.seek(0)
    head = file_obj.read(size)
    file_obj.seek(0)
    return head


def _is_pdf(head):
    return head[:5] == b"%PDF-"


def _is_jpeg(head):
    return head[:3] == b"\xff\xd8\xff"


def _is_png(head):
    return head[:8] == b"\x89PNG\r\n\x1a\n"


def _is_webp(head):
    return head[:4] == b"RIFF" and head[8:12] == b"WEBP"


def _is_gif(head):
    return head[:4] in (b"GIF8",)


def _is_docx(head):
    # DOCX is a ZIP container whose root holds [Content_Types].xml
    if head[:4] != b"PK\x03\x04":
        return False
    try:
        with zipfile.ZipFile(head) as zf:
            names = zf.namelist()
    except (zipfile.BadZipFile, OSError, ValueError):
        return False
    return any(n.lower() == "[content_types].xml" for n in names)


# Mapping of MIME type -> (allowed extensions, magic-byte validator)
_ALLOWED_SIGNATURES = {
    "application/pdf": (("pdf",), _is_pdf),
    "image/jpeg": (("jpg", "jpeg"), _is_jpeg),
    "image/png": (("png",), _is_png),
    "image/webp": (("webp",), _is_webp),
    "image/gif": (("gif",), _is_gif),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
        ("docx",),
        _is_docx,
    ),
}


def allowed_upload_types():
    """Return a human-readable list of allowed file types for error messages."""
    return ", ".join(
        "*." + ext
        for exts, _ in _ALLOWED_SIGNATURES.values()
        for ext in exts
    )


def validate_upload(file_obj):
    """
    Validate an uploaded file against the allowlist.

    Returns the detected content type (MIME) on success or raises
    ``ValueError`` with a safe, user-facing message on rejection.
    """
    if file_obj is None:
        raise ValueError("No file was provided.")

    original_name = getattr(file_obj, "name", "") or ""
    name = Path(original_name.replace("\\", "/")).name
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""

    if not ext:
        raise ValueError(f"File must be one of: {allowed_upload_types()}")

    head = _read_head(file_obj)
    if not head:
        raise ValueError("The uploaded file appears to be empty.")

    for mime, (exts, checker) in _ALLOWED_SIGNATURES.items():
        if ext not in exts:
            continue
        if not checker(head):
            raise ValueError(
                f"The file extension .{ext} does not match the file content. "
                f"Allowed types: {allowed_upload_types()}"
            )
        return mime

    raise ValueError(
        f"File type not allowed. Allowed types: {allowed_upload_types()}"
    )

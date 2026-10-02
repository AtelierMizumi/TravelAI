"""RFC 7807 Problem Details Exceptions."""

from typing import Any


class ProblemDetailsException(Exception):
    """Base exception class formatted according to RFC 7807 Problem Details."""

    def __init__(
        self,
        status_code: int,
        title: str,
        detail: str,
        type_uri: str,
        instance: str | None = None,
        invalid_params: list[dict[str, Any]] | None = None,
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.title = title
        self.detail = detail
        self.type_uri = type_uri
        self.instance = instance
        self.invalid_params = invalid_params


class UnsupportedMediaTypeException(ProblemDetailsException):
    """Exception raised when an uploaded file is not an allowed MIME type (HTTP 415)."""

    def __init__(
        self,
        detail: str = "Unsupported media type.",
        instance: str | None = None,
    ) -> None:
        super().__init__(
            status_code=415,
            title="Unsupported Media Type",
            detail=detail,
            type_uri="https://api.travelai.internal/errors/unsupported-media-type",
            instance=instance,
        )


class PayloadTooLargeException(ProblemDetailsException):
    """Exception raised when an uploaded file exceeds the max size limit (HTTP 413)."""

    def __init__(
        self,
        detail: str = "File size exceeds the allowed limit.",
        instance: str | None = None,
    ) -> None:
        super().__init__(
            status_code=413,
            title="Payload Too Large",
            detail=detail,
            type_uri="https://api.travelai.internal/errors/payload-too-large",
            instance=instance,
        )


class UnprocessableImageException(ProblemDetailsException):
    """Exception raised when image binary data cannot be decoded or is corrupted (HTTP 422)."""

    def __init__(
        self,
        detail: str = "Unable to decode image buffer. File may be corrupted.",
        instance: str | None = None,
    ) -> None:
        super().__init__(
            status_code=422,
            title="Unprocessable Content",
            detail=detail,
            type_uri="https://api.travelai.internal/errors/unprocessable-image",
            instance=instance,
        )


class VisionTimeoutException(ProblemDetailsException):
    """Exception raised when upstream Google Cloud Vision API request times out (HTTP 504)."""

    def __init__(
        self,
        detail: str = "Vision recognition provider timed out while analyzing the image.",
        instance: str | None = None,
    ) -> None:
        super().__init__(
            status_code=504,
            title="Gateway Timeout",
            detail=detail,
            type_uri="https://api.travelai.internal/errors/vision-timeout",
            instance=instance,
        )


class VisionProviderException(ProblemDetailsException):
    """Exception raised when upstream Google Cloud Vision API returns an error (HTTP 502)."""

    def __init__(
        self,
        detail: str = "Vision recognition provider encountered an error.",
        instance: str | None = None,
    ) -> None:
        super().__init__(
            status_code=502,
            title="Bad Gateway",
            detail=detail,
            type_uri="https://api.travelai.internal/errors/vision-provider-error",
            instance=instance,
        )

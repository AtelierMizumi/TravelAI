"""Global Exception Handlers for RFC 7807 Problem Details."""

import logging
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import ProblemDetailsException
from app.schemas.error import ProblemDetails

logger = logging.getLogger("travelai.ai.exceptions")


def register_exception_handlers(app: FastAPI) -> None:
    """Register all application exception handlers formatting to RFC 7807."""

    @app.exception_handler(ProblemDetailsException)
    async def problem_details_handler(
        request: Request, exc: ProblemDetailsException
    ) -> JSONResponse:
        problem = ProblemDetails(
            type=exc.type_uri,
            title=exc.title,
            status=exc.status_code,
            detail=exc.detail,
            instance=exc.instance or str(request.url.path),
            invalid_params=exc.invalid_params,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=problem.model_dump(),
            media_type="application/problem+json",
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        invalid_params = []
        for err in exc.errors():
            loc = " -> ".join(str(p) for p in err.get("loc", []))
            invalid_params.append(
                {
                    "name": loc,
                    "reason": err.get("msg", "Validation error"),
                    "type": err.get("type", "value_error"),
                }
            )

        problem = ProblemDetails(
            type="https://api.travelai.internal/errors/validation-error",
            title="Validation Error",
            status=422,
            detail="The request contains invalid or missing parameters.",
            instance=str(request.url.path),
            invalid_params=invalid_params,
        )
        return JSONResponse(
            status_code=422,
            content=problem.model_dump(),
            media_type="application/problem+json",
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        status_code = exc.status_code
        try:
            status_title = HTTPStatus(status_code).phrase
        except ValueError:
            status_title = "HTTP Error"

        problem = ProblemDetails(
            type=f"https://api.travelai.internal/errors/http-{status_code}",
            title=status_title,
            status=status_code,
            detail=str(exc.detail),
            instance=str(request.url.path),
        )
        return JSONResponse(
            status_code=status_code,
            content=problem.model_dump(),
            media_type="application/problem+json",
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server exception: %s", str(exc))
        problem = ProblemDetails(
            type="https://api.travelai.internal/errors/internal-server-error",
            title="Internal Server Error",
            status=500,
            detail="An unexpected internal error occurred while processing the request.",
            instance=str(request.url.path),
        )
        return JSONResponse(
            status_code=500,
            content=problem.model_dump(),
            media_type="application/problem+json",
        )

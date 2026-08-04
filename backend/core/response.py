from rest_framework.response import Response
from rest_framework import status as http_status


def success_response(data=None, message=None, meta=None, status_code=http_status.HTTP_200_OK):
    """
    Standard success envelope.

    Returns:
        {"success": True, "data": ..., "message": ..., "meta": ...}
    """
    body = {"success": True}
    if message is not None:
        body["message"] = message
    if data is not None:
        body["data"] = data
    if meta is not None:
        body["meta"] = meta
    return Response(body, status=status_code)


def error_response(message="An error occurred", errors=None, status_code=http_status.HTTP_400_BAD_REQUEST):
    """
    Standard error envelope.

    Returns:
        {"success": False, "message": ..., "errors": ...}
    """
    body = {"success": False, "message": message}
    if errors is not None:
        body["errors"] = errors
    return Response(body, status=status_code)


def paginated_response(queryset, serializer_class, request, per_page=None):
    """
    Paginated list envelope.

    Returns:
        {"success": True, "data": [...], "meta": {"count": N, "page": P, "per_page": M}}
    """
    page = request.query_params.get("page", 1)
    per_page = per_page or int(request.query_params.get("per_page", 50))

    from django.core.paginator import Paginator, EmptyPage
    paginator = Paginator(queryset, per_page)
    try:
        page_obj = paginator.page(page)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)

    serializer = serializer_class(page_obj, many=True, context={"request": request})
    return success_response(
        data=serializer.data,
        meta={
            "count": paginator.count,
            "page": page_obj.number,
            "per_page": per_page,
            "total_pages": paginator.num_pages,
        },
    )

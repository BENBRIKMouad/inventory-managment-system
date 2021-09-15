from rest_framework.pagination import (
    LimitOffsetPagination,
    PageNumberPagination,
    )


class MachineLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 20


class ModelLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 20


class OsLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 20

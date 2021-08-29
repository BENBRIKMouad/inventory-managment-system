from rest_framework.pagination import (
    LimitOffsetPagination,
    PageNumberPagination,
    )


class MachineLimitOffsetPagination(LimitOffsetPagination):
    max_limit = 20
    default_limit = 10


class ModelLimitOffsetPagination(LimitOffsetPagination):
    max_limit = 30
    default_limit = 25


class OsLimitOffsetPagination(LimitOffsetPagination):
    max_limit = 10
    default_limit = 5

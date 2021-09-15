from rest_framework.pagination import (
    LimitOffsetPagination,
    PageNumberPagination,
    )
from collections import OrderedDict

from rest_framework.response import Response


class MachineLimitOffsetPagination(PageNumberPagination):
    default_limit = 20


class ModelLimitOffsetPagination(PageNumberPagination):
    default_limit = 20


class NoCountPageNumberPagination(PageNumberPagination):
    default_limit = 20

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))

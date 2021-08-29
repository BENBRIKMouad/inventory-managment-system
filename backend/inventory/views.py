from .serializers import *
from rest_framework.response import Response
import re
from rest_framework import viewsets
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.db.models import Q
from .pagination import *
from rest_framework.reverse import reverse

# Create your views here.

# class MachineList(mixins.ListModelMixin,
#                   mixins.CreateModelMixin,
#                   generics.GenericAPIView):
#     queryset = Machine.objects.all()
#     request_serializer = RequestMachineSerializer
#     response_serializer = ResponseMachineSerializer
#
#     def get(self, request, *args, **kwargs):
#         return self.list(request, *args, **kwargs)
#
#     def post(self, request, *args, **kwargs):
#         return self.create(request, *args, **kwargs)
#
#     def get_serializer_class(self):
#         if self.request.method == 'GET':
#             return self.response_serializer
#         if self.request.method == 'POST':
#             return self.request_serializer
#
#
# class MachineDetail(mixins.RetrieveModelMixin,
#                     mixins.UpdateModelMixin,
#                     mixins.DestroyModelMixin,
#                     generics.GenericAPIView):
#     queryset = Machine.objects.all()
#     request_serializer = RequestMachineSerializer
#     response_serializer = ResponseMachineSerializer
#     lookup_field = "machine_id"
#
#     def get(self, request, *args, **kwargs):
#         self.serializer_class = ResponseMachineSerializer
#         return self.retrieve(request, *args, **kwargs)
#
#     def put(self, request, *args, **kwargs):
#         self.serializer_class = RequestMachineSerializer
#         return self.update(request, *args, **kwargs)
#
#     def delete(self, request, *args, **kwargs):
#         return self.destroy(request, *args, **kwargs)
#
#     def get_serializer_class(self):
#         if self.request.method == 'GET':
#             return self.response_serializer
#         if self.request.method == 'PUT':
#             return self.request_serializer
#         if self.request.method == 'DELETE':
#             return RequestMachineSerializer


class ModelViewSet(viewsets.ViewSet):
    """
          Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **Model**

          Filter accept GET AND POST method and support queries that supported by django model filter method

          for more details about django model filter please [see here][ref]

          [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

       """
    serializer_class = ModelSerializer
    queryset = Model.objects.all()
    lookup_field = "model"
    pagination_class = ModelLimitOffsetPagination
    paginator = ModelLimitOffsetPagination()

    def list(self, request):
        serializer = self.serializer_class(Model.objects.all(), many=True)
        for obj in serializer.data:
            obj['url'] = reverse('model-detail', args=[obj[self.lookup_field]], request=request)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, model=None):
        model = get_object_or_404(self.queryset, model=model)
        serializer = self.serializer_class(model)
        return Response(serializer.data)

    def update(self, request, model=None):
        instance = self.queryset.get(model=model)
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, model=None):
        instance = self.queryset.get(model=model)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, model=None):
        instance = self.queryset.get(model=model)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get', 'post'], detail=False)
    def filter(self, request):
        self.serializer_class = FilterModelSerializer
        serialized_instance = ModelSerializer(Model.objects.all()[0]).data
        serializer_fields = [k for k, v in serialized_instance.items()]
        data = {}

        if request.method == 'POST':
            if type(request.data) == 'dict':
                data = request.data.dict()
            else:
                data = request.data
        if request.method == 'GET':
            data = request.query_params.dict()

        data = {k: v for k, v in data.items() if not re.match(".*?id.*?", k) and v}
        data = {k: v for k, v in data.items() if [e for e in serializer_fields if e in k]}

        model = self.queryset.filter(**data)
        serializer_class = OsSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)

        return Response(serializer.data, status=status.HTTP_302_FOUND)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')
        if request.method == 'GET':
            query = request.query_params.get('q', '')
        model = self.queryset.filter(
            Q(name__icontains=query) | Q(type__icontains=query) | Q(cpu__icontains=query)
        )
        serializer_class = ModelSerializer
        serializer = serializer_class(model, many=True)
        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        page = self.paginator.paginate_queryset(serializer.data, request)

        if page is not None:
            return self.paginator.get_paginated_response(page)

        return Response(serializer.data, status=status.HTTP_302_FOUND)


class OsViewset(viewsets.ViewSet):
    """
          Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **OS**

          Filter accept GET AND POST method and support queries that supported by django model filter method

          for more details about django model filter please [see here][ref]

          [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

       """
    serializer_class = OsSerializer
    queryset = Os.objects.all()
    lookup_field = "os"
    pagination_class = OsLimitOffsetPagination
    paginator = OsLimitOffsetPagination()

    def list(self, request):
        serializer = OsSerializer(Os.objects.all(), many=True)
        for obj in serializer.data:
            obj['url'] = reverse('os-detail', args=[obj[self.lookup_field]], request=request)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)
        return Response(serializer.data)

    def create(self, request):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, os=None):
        model = get_object_or_404(self.queryset, os=os)
        serializer = self.serializer_class(model)
        return Response(serializer.data)

    def update(self, request, os=None):
        instance = self.queryset.get(os=os)
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, os=None):
        instance = self.queryset.get(os=os)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, os=None):
        instance = self.queryset.get(os=os)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get', 'post'], detail=False)
    def filter(self, request):
        self.serializer_class = FilterOsSerializer
        serialized_instance = OsSerializer(Os.objects.all()[0]).data
        serializer_fields = [k for k, v in serialized_instance.items()]
        data = {}

        if request.method == 'POST':
            if type(request.data) == 'dict':
                data = request.data.dict()
            else:
                data = request.data
        if request.method == 'GET':
            data = request.query_params.dict()

        data = {k: v for k, v in data.items() if not re.match(".*?id.*?", k) and v}
        data = {k: v for k, v in data.items() if [e for e in serializer_fields if e in k]}

        model = self.queryset.filter(**data)
        serializer_class = OsSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)

        return Response(serializer.data, status=status.HTTP_302_FOUND)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')

        if request.method == 'GET':
            query = request.query_params.get('q', '')
        model = self.queryset.filter(
            Q(name__icontains=query) | Q(type__icontains=query)
        )

        serializer_class = OsSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)

        return Response(serializer.data, status=status.HTTP_302_FOUND)


class MachineViewSet(viewsets.ViewSet):
    """
       Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **Machines**

       Filter accept GET AND POST method and support queries that supported by django model filter method

       for more details about django model filter please [see here][ref]

       [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

    """

    serializer_class = RequestMachineSerializer
    queryset = Machine.objects.all().prefetch_related()
    lookup_field = "machine"
    pagination_class = MachineLimitOffsetPagination
    paginator = MachineLimitOffsetPagination()

    def list(self, request):
        serializer_class = ResponseMachineSerializer
        serializer = serializer_class(Machine.objects.all().prefetch_related(), many=True)
        for obj in serializer.data:
            obj['url'] = reverse('machine-detail', args=[obj[self.lookup_field]], request=request)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, machine=None):
        serializer_class = ResponseMachineSerializer
        model = get_object_or_404(self.queryset, machine=machine)
        serializer = serializer_class(model)
        return Response(serializer.data, status=status.HTTP_302_FOUND)

    def update(self, request, machine=None):
        instance = self.queryset.get(machine=machine)
        if request.data.get("model"):
            request.data["model"] = Model.objects.get(model=request.data["model"]).id
        if request.data.get("os"):
            request.data["os"] = Os.objects.get(os=request.data["os"]).id
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, machine=None):
        instance = self.queryset.get(machine=machine)
        if request.data.get("model"):
            request.data["model"] = Model.objects.get(model=request.data["model"]).id
        if request.data.get("os"):
            request.data["os"] = Os.objects.get(os=request.data["os"]).id
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, machine=None):
        instance = self.queryset.get(machine=machine)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get', 'post'], detail=False)
    def filter(self, request):
        self.serializer_class = FilterMachineSerializer
        serialized_instance = RequestMachineSerializer(Machine.objects.all()[0]).data
        serializer_fields = [k for k, v in serialized_instance.items()]
        data = {}

        if request.method == 'POST':
            if type(request.data) == 'dict':
                data = request.data.dict()
            else:
                data = request.data
        if request.method == 'GET':
            data = request.query_params.dict()

        data = {k: v for k, v in data.items() if not re.match(".*?id.*?", k) and v}
        data = {k: v for k, v in data.items() if [e for e in serializer_fields if e in k]}

        model = self.queryset.filter(**data)
        serializer_class = ResponseMachineSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)

        return Response(serializer.data, status=status.HTTP_302_FOUND)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')

        if request.method == 'GET':
            query = request.query_params.get('q', '')

        model = self.queryset.filter(
            Q(name__icontains=query) | Q(serial_number__icontains=query) | Q(os__type__icontains=query)
            | Q(os__name__icontains=query) | Q(model__name__icontains=query) | Q(reference__icontains=query)
        )

        serializer_class = ResponseMachineSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        page = self.paginator.paginate_queryset(serializer.data, request)
        if page is not None:
            return self.paginator.get_paginated_response(page)

        return Response(serializer.data, status=status.HTTP_302_FOUND)

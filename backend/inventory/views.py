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
from rest_framework.permissions import IsAuthenticated
from rest_framework.negotiation import BaseContentNegotiation
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie, vary_on_headers

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
cache_time = 2


class IgnoreClientContentNegotiation(BaseContentNegotiation):
    def select_parser(self, request, parsers):
        """
        Select the first parser in the `.parser_classes` list.
        """
        return parsers[0]

    def select_renderer(self, request, renderers, format_suffix):
        """
        Select the first renderer in the `.renderer_classes` list.
        """
        return (renderers[0], renderers[0].media_type)


class ModelViewSet(viewsets.ModelViewSet):
    """
          Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **Model**

          Filter accept GET AND POST method and support queries that supported by django model filter method

          for more details about django model filter please [see here][ref]

          [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

       """
    permission_classes = [IsAuthenticated]
    serializer_class = ModelSerializer
    queryset = Model.objects.all().order_by("name")
    lookup_field = "model"

    @method_decorator(cache_page(cache_time))
    @method_decorator(vary_on_headers("Authorization",))
    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(page)
        serializer = self.get_serializer(page, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, model=None, **kwargs):
        model = get_object_or_404(self.queryset, model=model)
        serializer = self.serializer_class(model)
        return Response(serializer.data)

    def update(self, request, model=None, **kwargs):
        instance = self.queryset.get(model=model)
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, model=None, **kwargs):
        instance = self.queryset.get(model=model)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, model=None, **kwargs):
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

        model = self.queryset.filter(**data).order_by("name")
        serializer_class = ModelSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')
        if request.method == 'GET':
            query = request.query_params.get('q', '')
        model = self.queryset.filter(
            Q(name__icontains=query) | Q(cpu__icontains=query)
        ).order_by("name")
        serializer_class = ModelSerializer
        serializer = serializer_class(model, many=True)
        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)


class OsViewset(viewsets.ModelViewSet):
    """
          Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **OS**

          Filter accept GET AND POST method and support queries that supported by django model filter method

          for more details about django model filter please [see here][ref]

          [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

       """
    permission_classes = [IsAuthenticated]
    serializer_class = OsSerializer
    queryset = Os.objects.all()
    lookup_field = "os"

    @method_decorator(cache_page(cache_time))
    @method_decorator(vary_on_headers("Authorization", ))
    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(page)
        serializer = self.get_serializer(page, many=True)
        return Response(serializer.data)

    def create(self, request, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, os=None, **kwargs):
        model = get_object_or_404(self.queryset, os=os)
        serializer = self.serializer_class(model)
        return Response(serializer.data)

    def update(self, request, os=None, **kwargs):
        instance = self.queryset.get(os=os)
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, os=None, **kwargs):
        instance = self.queryset.get(os=os)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, os=None, **kwargs):
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

        model = self.queryset.filter(**data).order_by("name")
        serializer_class = OsSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')

        if request.method == 'GET':
            query = request.query_params.get('q', '')
        model = self.queryset.filter(
            Q(name__icontains=query) | Q(type__icontains=query)
        ).order_by("name")

        serializer_class = OsSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)


class MachineViewSet(viewsets.ModelViewSet):
    """
       Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **Machines**

       Filter accept GET AND POST method and support queries that supported by django model filter method

       for more details about django model filter please [see here][ref]

       [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

    """

    permission_classes = [IsAuthenticated]
    serializer_class = RequestMachineSerializer
    queryset = Machine.objects.all().prefetch_related()
    lookup_field = "machine"

    @method_decorator(cache_page(cache_time))
    @method_decorator(vary_on_headers("Authorization", ))
    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(page)
        serializer = self.get_serializer(page, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        if request.data.get("model"):
            request.data["model"] = get_object_or_404(Model,model=request.data["model"]).id
        if request.data.get("os"):
            request.data["os"] = get_object_or_404(Os,os=request.data["os"]).id
        if request.data.get("employee"):
            request.data["employee"] = get_object_or_404(Employee,employee=request.data["employee"]).id

        data = request.data
        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, machine=None, **kwargs):
        serializer_class = ResponseMachineSerializer
        model = get_object_or_404(self.queryset, machine=machine)
        serializer = serializer_class(model)
        return Response(serializer.data, status=status.HTTP_302_FOUND)

    def update(self, request, machine=None, **kwargs):
        instance = get_object_or_404(Machine,machine=machine)
        if request.data.get("model"):
            request.data["model"] = get_object_or_404(Model, model=request.data["model"]).id
        if request.data.get("os"):
            request.data["os"] = get_object_or_404(Os, os=request.data["os"]).id
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, machine=None, **kwargs):
        instance = get_object_or_404(Machine,machine=machine)
        if request.data.get("model"):
            request.data["model"] = get_object_or_404(Model,model=request.data["model"]).id
        if request.data.get("os"):
            request.data["os"] = get_object_or_404(Os,os=request.data["os"]).id
        if request.data.get("employee"):
            request.data["employee"] = get_object_or_404(Employee,employee=request.data["employee"]).id
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, machine=None, **kwargs):
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

        model = self.queryset.filter(**data).order_by("name")
        serializer_class = ResponseMachineSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')

        if request.method == 'GET':
            query = request.query_params.get('q', '')

        model = self.queryset.filter(
            Q(name__icontains=query) | Q(serial_number__icontains=query) | Q(os__type__icontains=query)
            | Q(os__name__icontains=query) | Q(model__name__icontains=query) | Q(reference__icontains=query)
        ).order_by("name")

        serializer_class = ResponseMachineSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({'results': serializer.data}, status=status.HTTP_200_OK)


class SoftwareViewSet(viewsets.ModelViewSet):
    """
       Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **Machines**

       Filter accept GET AND POST method and support queries that supported by django model filter method

       for more details about django model filter please [see here][ref]

       [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

    """
    permission_classes = [IsAuthenticated]
    serializer_class = SoftwareSerializer
    queryset = Software.objects.all().order_by("name")
    lookup_field = "software"
    pagination_class = NoCountPageNumberPagination

    @method_decorator(cache_page(cache_time))
    @method_decorator(vary_on_headers("Authorization", ))
    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.paginator.get_paginated_response(page)
        serializer = self.get_serializer(page, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, software=None, **kwargs):
        software = get_object_or_404(self.queryset, software=software)
        serializer = self.serializer_class(software)
        return Response(serializer.data, status=status.HTTP_302_FOUND)

    def update(self, request, software=None, **kwargs):
        instance = self.queryset.get(software=software)
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, software=None, **kwargs):
        instance = self.queryset.get(software=software)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, software=None, **kwargs):
        instance = self.queryset.get(software=software)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get', 'post'], detail=False)
    def filter(self, request):
        self.serializer_class = FilterSoftwareSerializer
        serialized_instance = SoftwareSerializer(Software.objects.all()[0]).data
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

        software = self.queryset.filter(**data).order_by("name")
        serializer = SoftwareSerializer(software, many=True)

        if software.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')

        if request.method == 'GET':
            query = request.query_params.get('q', '')

        software = self.queryset.filter(
            Q(name__icontains=query) | Q(editor__icontains=query) | Q(version__icontains=query)
        ).order_by("name")
        serializer_class = SoftwareSerializer
        serializer = serializer_class(software, many=True)
        if software.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)


class PoleViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    serializer_class = PoleSerializer
    queryset = Pole.objects.all()
    pagination_class = None


class DivisionViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    serializer_class = DivisionSerializer
    queryset = Division.objects.all()
    pagination_class = None


class FunctionViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    serializer_class = FunctionSerializer
    queryset = Function.objects.all()
    pagination_class = None


class EmployeeViewset(viewsets.ModelViewSet):
    """
          Provide the option to list,create,retrieve,update,partial update,destroy,search,filter **OS**

          Filter accept GET AND POST method and support queries that supported by django model filter method

          for more details about django model filter please [see here][ref]

          [ref]: https://docs.djangoproject.com/en/3.2/topics/db/queries/#field-lookups

       """
    permission_classes = [IsAuthenticated]
    serializer_class = RequestEmployeeSerializer
    queryset = Employee.objects.all().order_by("last_name")
    lookup_field = "employee"

    @method_decorator(cache_page(cache_time))
    @method_decorator(vary_on_headers("Authorization", ))
    def list(self, request, **kwargs):
        serializer_class = EmployeeSerializer
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializer_class(page, many=True)
            resp = self.paginator.get_paginated_response(serializer.data)
            return resp
        serializer = serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, **kwargs):

        if request.data.get("division"):
            request.data["division"] = get_object_or_404(Division, division=request.data["division"]).id
        if request.data.get("pole"):
            request.data["pole"] = get_object_or_404(Pole, pole=request.data["pole"]).id
        if request.data.get("function"):
            request.data["function"] = get_object_or_404(Function, function=request.data["function"]).id

        data = request.data
        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, employee=None, **kwargs):
        employee = get_object_or_404(self.queryset, employee=employee)
        serializer = self.serializer_class(employee)
        return Response(serializer.data)

    def update(self, request, employee=None, **kwargs):
        instance = self.queryset.get(employee=employee)
        serializer = self.serializer_class(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def partial_update(self, request, employee=None, **kwargs):
        if request.data.get("division"):
            request.data["division"] = get_object_or_404(Division, division=request.data["division"]).id
        if request.data.get("pole"):
            request.data["pole"] = get_object_or_404(Pole, pole=request.data["pole"]).id
        if request.data.get("function"):
            request.data["function"] = get_object_or_404(Function, function=request.data["function"]).id

        instance = self.queryset.get(employee=employee)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def destroy(self, request, employee=None, **kwargs):
        instance = self.queryset.get(employee=employee)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get', 'post'], detail=False)
    def filter(self, request):
        self.serializer_class = FilterEmployeeSerializer
        serialized_instance = EmployeeSerializer(Employee.objects.all()[0]).data
        serializer_fields = [k for k, v in serialized_instance.items()]
        data = {}

        if request.method == 'POST':
            if type(request.data) == 'dict':
                data = request.data.dict()
            else:
                data = request.data
        if request.method == 'GET':
            data = request.query_params.dict()

        data = {k: v for k, v in data.items() if not k == 'id' and not k == 'pk'  and v}
        data = {k: v for k, v in data.items() if [e for e in serializer_fields if e in k]}

        model = self.queryset.filter(**data).order_by("last_name")
        serializer_class = EmployeeSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=False)
    def search(self, request):
        self.serializer_class = QuerySerializer
        query = request.data.get('query', '')

        if request.method == 'GET':
            query = request.query_params.get('q', '')
        model = self.queryset.filter(
            Q(first_name__icontains=query) | Q(last_name__icontains=query)
        ).order_by("last_name")

        serializer_class = EmployeeSerializer
        serializer = serializer_class(model, many=True)

        if model.count() == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

    @action(methods=['get', 'post'], detail=True)
    def add_software(self, request, employee=None):
        employee = get_object_or_404(self.queryset, employee=employee)
        software = request.data.get('software', '')
        software = get_object_or_404(Software, software=software)
        for emp_software in employee.software.all():
            if emp_software == software:
                serializer = self.serializer_class(employee)
                return Response(serializer.data)
        employee.software.add(software)
        employee.save()
        serializer = self.serializer_class(employee)
        return Response(serializer.data)

    @action(methods=['get', 'post'], detail=True)
    def remove_software(self, request, employee=None):
        serializer_class = EmployeeSerializer
        employee = get_object_or_404(self.queryset, employee=employee)
        software = request.data.get('software', '')
        software = get_object_or_404(employee.software.all(), software=software)
        employee.software.remove(software)
        employee.save()
        serializer = serializer_class(employee)
        return Response(serializer.data)

from rest_framework import serializers
from .models import *


class ModelSerializer(serializers.ModelSerializer):
    count = serializers.SerializerMethodField()
    c_available = serializers.SerializerMethodField()
    available = serializers.SerializerMethodField()

    @staticmethod
    def get_count(obj):
        return Machine.objects.filter(model=obj).count()

    @staticmethod
    def get_c_available(obj):
        return Machine.objects.filter(model=obj, assigned=False).count()

    @staticmethod
    def get_available(obj):
        machines = Machine.objects.filter(model=obj, assigned=False)
        return RequestMachineSerializer(machines, many=True).data

    class Meta:
        model = Model
        fields = ['model', 'name', 'cpu', 'ram', 'count', 'c_available', 'available']


class FilterModelSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    name__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='name')
    cpu__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='cpu')
    ram = serializers.IntegerField(required=False)
    ram__gte = serializers.IntegerField(required=False, label='ram more then')
    ram__lte = serializers.IntegerField(required=False, label='ram less then')


class OsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Os
        fields = ['os', 'name', 'type']


class FilterOsSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    name__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='name')
    type__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='type')


class ResponseMachineSerializer(serializers.ModelSerializer):
    model = ModelSerializer(many=False)
    os = OsSerializer(many=False)

    class Meta:
        model = Machine
        fields = ['machine', 'name', 'serial_number', 'reference', 'storage', 'assigned', 'model', 'os', 'assigned']


class RequestMachineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Machine
        fields = ['machine', 'name', 'serial_number', 'reference', 'storage', 'assigned', 'model', 'os']


class FilterMachineSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    name__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='name')
    serial_number = serializers.CharField(required=False, allow_blank=True, max_length=100)
    reference = serializers.CharField(required=False, allow_blank=True, max_length=100)
    storage = serializers.IntegerField(required=False)
    storage__gte = serializers.IntegerField(required=False, label='storage more then')
    storage__lte = serializers.IntegerField(required=False, label='storage less then')
    assigned = serializers.BooleanField(required=False)
    model__name__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='Model name')
    model__cpu__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='Model_cpu')
    model__ram = serializers.IntegerField(required=False)
    os__name__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='Os name')
    os__type__icontains = serializers.CharField(required=False, allow_blank=True, max_length=100, label='Os type')


class QuerySerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    query = serializers.CharField(required=False, allow_blank=True, max_length=100)

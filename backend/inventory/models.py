from django.db import models
from django.conf import settings
import uuid
# Create your models here.


class Model(models.Model):
    model = models.CharField(max_length=120, blank=True)
    name = models.CharField(max_length=120, unique=True)
    cpu = models.CharField(max_length=120)
    ram = models.IntegerField()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.pk:
            self.model = uuid.uuid4().hex.__str__()
        super(Model, self).save(*args, **kwargs)


class Os(models.Model):
    os = models.CharField(max_length=120, blank=True)
    name = models.CharField(max_length=120)
    type = models.CharField(max_length=120)

    class Meta:
        unique_together = ('name', 'type')

    def __str__(self):
        return self.name + " " + self.type

    def save(self, *args, **kwargs):
        if not self.pk:
            self.os = uuid.uuid4().hex.__str__()
        super(Os, self).save(*args, **kwargs)


class Software(models.Model):
    software = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=255)
    editor = models.CharField(max_length=255)
    version = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.pk:
            self.software = uuid.uuid4().hex.__str__()
        super(Software, self).save(*args, **kwargs)


class Employee(models.Model):
    employee = models.CharField(max_length=255, blank=True)
    email = models.EmailField(null=True, blank=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    identifier = models.CharField(max_length=55, blank=True)
    software = models.ManyToManyField(Software, blank=True)

    def __str__(self):
        return self.first_name + " " + self.last_name

    def save(self, *args, **kwargs):
        if not self.pk:
            self.employee = uuid.uuid4().hex.__str__()
        super(Employee, self).save(*args, **kwargs)


class Machine(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True)
    machine = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=120)
    serial_number = models.CharField(max_length=255)
    reference = models.CharField(max_length=255)
    storage = models.IntegerField()
    #assigned = models.BooleanField(default=False)
    model = models.ForeignKey(Model, on_delete=models.CASCADE)
    os = models.ForeignKey(Os, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.pk:
            self.machine = uuid.uuid4().hex.__str__()
        super(Machine, self).save(*args, **kwargs)

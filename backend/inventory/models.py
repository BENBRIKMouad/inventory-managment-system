from django.db import models
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
        self.os = uuid.uuid4().hex.__str__()
        super(Os, self).save(*args, **kwargs)


class Machine(models.Model):
    machine = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=120)
    serial_number = models.CharField(max_length=255)
    reference = models.CharField(max_length=255)
    storage = models.IntegerField()
    assigned = models.BooleanField(default=False)
    model = models.ForeignKey(Model, on_delete=models.CASCADE)
    os = models.ForeignKey(Os, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.machine = uuid.uuid4().hex.__str__()
        super(Machine, self).save(*args, **kwargs)

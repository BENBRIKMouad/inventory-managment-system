# Generated by Django 3.2.5 on 2021-08-31 14:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0014_auto_20210831_1547'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employee',
            name='identifier',
            field=models.CharField(blank=True, max_length=55),
        ),
    ]
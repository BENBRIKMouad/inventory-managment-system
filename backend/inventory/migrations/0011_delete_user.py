# Generated by Django 3.2.5 on 2021-08-31 13:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0010_remove_machine_user'),
    ]

    operations = [
        migrations.DeleteModel(
            name='User',
        ),
    ]

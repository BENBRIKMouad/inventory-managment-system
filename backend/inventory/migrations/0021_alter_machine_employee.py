# Generated by Django 3.2.5 on 2021-09-01 15:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0020_rename_user_machine_employee'),
    ]

    operations = [
        migrations.AlterField(
            model_name='machine',
            name='employee',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='inventory.employee'),
        ),
    ]

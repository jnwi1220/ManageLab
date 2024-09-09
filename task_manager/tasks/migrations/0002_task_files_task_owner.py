# Generated by Django 4.2.13 on 2024-06-16 10:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="files",
            field=models.FileField(blank=True, null=True, upload_to="uploads/"),
        ),
        migrations.AddField(
            model_name="task",
            name="owner",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]

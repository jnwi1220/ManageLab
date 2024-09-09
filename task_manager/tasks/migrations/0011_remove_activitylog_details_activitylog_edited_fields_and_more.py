# Generated by Django 4.2.13 on 2024-08-08 05:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0010_activitylog_details"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="activitylog",
            name="details",
        ),
        migrations.AddField(
            model_name="activitylog",
            name="edited_fields",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="activitylog",
            name="from_status",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="activitylog",
            name="task_title",
            field=models.CharField(default="Unknown Task", max_length=255),
        ),
        migrations.AddField(
            model_name="activitylog",
            name="to_status",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]

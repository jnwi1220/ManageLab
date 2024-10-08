# Generated by Django 4.2.9 on 2024-08-29 11:40

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("tasks", "0021_task_deadline_task_percentage"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="task",
            name="owner",
        ),
        migrations.AddField(
            model_name="task",
            name="owner",
            field=models.ManyToManyField(
                blank=True, related_name="tasks", to=settings.AUTH_USER_MODEL
            ),
        ),
    ]

# Generated by Django 3.2.4 on 2021-06-14 12:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SpotifyToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.CharField(max_length=100, unique=True, verbose_name='User session key')),
                ('token_type', models.CharField(max_length=50, verbose_name='Token Type')),
                ('access_token', models.CharField(max_length=150, verbose_name='Access Token')),
                ('refresh_token', models.CharField(max_length=150, verbose_name='Refresh Token')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('expires_in', models.DateTimeField(verbose_name='Expires In')),
            ],
        ),
    ]

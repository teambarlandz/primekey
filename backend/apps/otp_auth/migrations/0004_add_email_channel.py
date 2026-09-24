# Generated for dual-channel OTP (Resend email + Sendchamp SMS)
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("otp_auth", "0003_alter_otpcode_code"),
    ]

    operations = [
        migrations.AddField(
            model_name="otpcode",
            name="email",
            field=models.EmailField(blank=True, db_index=True, help_text="Email for Resend delivery", max_length=254, null=True),
        ),
        migrations.AddField(
            model_name="otpcode",
            name="channel",
            field=models.CharField(choices=[("sms", "SMS via Sendchamp"), ("email", "Email via Resend")], default="sms", max_length=10),
        ),
        migrations.AlterField(
            model_name="otpcode",
            name="phone",
            field=models.CharField(blank=True, db_index=True, help_text="Nigerian phone for SMS (Sendchamp)", max_length=20, null=True),
        ),
        migrations.AddIndex(
            model_name="otpcode",
            index=models.Index(fields=["email", "purpose", "used"], name="otp_email_purpose_used_idx"),
        ),
    ]

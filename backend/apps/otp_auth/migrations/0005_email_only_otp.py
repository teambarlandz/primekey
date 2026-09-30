from django.db import migrations, models


class Migration(migrations.Migration):
    """Email-only OTP: drop the SMS (Sendchamp) phone/channel columns."""

    dependencies = [
        ("otp_auth", "0004_add_email_channel"),
    ]

    operations = [
        # SMS-issued codes have no email address and cannot be represented by
        # the new model, so they are purged before email becomes non-nullable.
        migrations.RunSQL(
            sql="DELETE FROM otp_auth_otpcode WHERE email IS NULL OR email = '';",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RemoveIndex(
            model_name="otpcode",
            name="otp_auth_ot_phone_65300b_idx",
        ),
        migrations.RemoveField(
            model_name="otpcode",
            name="phone",
        ),
        migrations.RemoveField(
            model_name="otpcode",
            name="channel",
        ),
        migrations.AlterField(
            model_name="otpcode",
            name="email",
            field=models.EmailField(
                db_index=True,
                help_text="Destination for Resend delivery",
                max_length=254,
            ),
        ),
    ]

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.profile import Profile
from next_crm.models.email_backups import EmailBackups


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('user_id', type=int, nargs='?', default=None)

    def handle(self, *args, **options):
        user_id = options['user_id']
        if user_id:
            users = User.objects.select_related('profile','company').filter(is_active=True, is_superuser=True).filter(profile__activation_key__isnull=False).filter(id=user_id)
        else:
            users = User.objects.select_related('profile','company').filter(is_active=True, is_superuser=True).filter(profile__activation_key__isnull=False)
        print(users.query)
        if users:
            for user in users:
                profiles = Profile.objects.filter(company_id=user.company.id)
                company = Company.objects.get(pk=user.company.id)
                if profiles:
                    for profile in profiles:
                        if profile.user.id != user.id:
                            company_user = User.objects.get(pk=profile.user.id)
                            # To do now user will not fully delete only his/her status will only changed
                            company_user.delete()
                            EmailBackups.objects.create(email=profile.user.email)
                if company:
                    Company.cascade_delete(company)

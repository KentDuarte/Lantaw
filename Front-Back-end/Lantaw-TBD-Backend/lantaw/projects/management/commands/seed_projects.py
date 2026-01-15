from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from projects.models import Project, ProjectMembers, ProjectPersonnel
from personnel.models import Personnel
from django_seed import Seed

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample projects and project personnel associations'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to seed projects...'))
        
        seeder = Seed.seeder()

        # Get or create users (they should exist from users seeder)
        try:
            admin_user = User.objects.get(email='admin@lantaw.com')
            staff_users = User.objects.filter(role='PROJECT_STAFF')[:2]
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Users not found. Please run seed_users first.'))
            return

        # Create sample projects using faker
        project_statuses = ['ACTIVE', 'ACTIVE', 'ON_HOLD']
        created_projects = []
        
        for i in range(3):
            project_name = seeder.faker.catch_phrase()
            description = seeder.faker.text(max_nb_chars=200)
            grant_amount = float(seeder.faker.random_int(min=1000000, max=10000000))
            project_status = project_statuses[i]
            
            # Generate dates
            days_ago = seeder.faker.random_int(min=15, max=60)
            days_ahead = seeder.faker.random_int(min=180, max=730)
            date_start = timezone.now().date() - timedelta(days=days_ago)
            date_end = timezone.now().date() + timedelta(days=days_ahead)
            
            project, created = Project.objects.get_or_create(
                name=project_name,
                defaults={
                    'description': description,
                    'grant_amount': grant_amount,
                    'project_status': project_status,
                    'date_start': date_start,
                    'date_end': date_end,
                }
            )
            if created:
                created_projects.append(project)
                self.stdout.write(self.style.SUCCESS(f'Created project: {project.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Project already exists: {project.name}'))

        # Add project members
        if created_projects:
            # Add admin to all projects
            for project in created_projects:
                ProjectMembers.objects.get_or_create(
                    user=admin_user,
                    project=project
                )
                self.stdout.write(self.style.SUCCESS(f'Added {admin_user.email} to {project.name}'))

            # Add staff to projects
            for i, project in enumerate(created_projects[:2]):
                if i < len(staff_users):
                    ProjectMembers.objects.get_or_create(
                        user=staff_users[i],
                        project=project
                    )
                    self.stdout.write(self.style.SUCCESS(f'Added {staff_users[i].email} to {project.name}'))

        # Seed project personnel associations (if personnel exist)
        # This will be handled by seed_personnel if personnel don't exist yet
        self._seed_project_personnel(seeder)

        self.stdout.write(self.style.SUCCESS('Successfully seeded projects!'))
    
    def _seed_project_personnel(self, seeder):
        """
        Helper method to seed project personnel associations.
        Can be called from seed_projects or seed_personnel.
        """
        # Get all projects (including existing ones)
        all_projects = Project.objects.all()
        if not all_projects.exists():
            return
        
        # Get personnel
        personnel_list = Personnel.objects.all()
        if not personnel_list.exists():
            # Silently skip if personnel don't exist yet - they'll be created by seed_personnel
            return
        
        self.stdout.write(self.style.SUCCESS('Starting to seed project personnel associations...'))
        
        # Create project-personnel associations using faker
        # Assign each personnel to 1-3 random projects
        created_count = 0
        
        for personnel in personnel_list:
            # Randomly assign personnel to 1-3 projects
            num_projects = seeder.faker.random_int(min=1, max=min(3, all_projects.count()))
            selected_projects = seeder.faker.random.sample(list(all_projects), num_projects)
            
            for project in selected_projects:
                project_personnel, created = ProjectPersonnel.objects.get_or_create(
                    personnel=personnel,
                    project=project,
                    defaults={
                        'personnel': personnel,
                        'project': project,
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created project personnel: {personnel.first_name} {personnel.last_name} -> {project.name}'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Project personnel already exists: {personnel.first_name} {personnel.last_name} -> {project.name}'
                        )
                    )
        
        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} project personnel associations!'))



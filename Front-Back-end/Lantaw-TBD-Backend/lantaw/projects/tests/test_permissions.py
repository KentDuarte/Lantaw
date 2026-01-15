import pytest 
from projects.models import Project, ProjectMembers, ProjectPersonnel

# Test project creation 
@pytest.mark.django_db
def test_create_project(demo_project):
    assert 
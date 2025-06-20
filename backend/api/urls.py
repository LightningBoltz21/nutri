from django.urls import path
from . import views

urlpatterns = [
    path("api/notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("api/notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
]

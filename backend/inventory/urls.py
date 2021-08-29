from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'model', ModelViewSet, basename='model')
router.register(r'machine', MachineViewSet, basename='machine')
router.register(r'os', OsViewset, basename='os')
urlpatterns = router.urls

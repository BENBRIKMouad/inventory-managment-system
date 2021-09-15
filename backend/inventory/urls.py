from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'machine', MachineViewSet, basename='machine')
router.register(r'model', ModelViewSet, basename='model')
router.register(r'os', OsViewset, basename='os')
router.register(r'software', SoftwareViewSet, basename='software')
router.register(r'employee', EmployeeViewset, basename='employee')
router.register(r'pole', PoleViewSet, basename='pole')
router.register(r'division', DivisionViewSet, basename='division')
router.register(r'function', FunctionViewSet, basename='function')
urlpatterns = router.urls

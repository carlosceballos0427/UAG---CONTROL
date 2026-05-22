from rest_framework import permissions

class IsAdminOrRadicadorOrReadOnly(permissions.BasePermission):
    """
    Permite lectura a cualquier usuario autenticado, pero escritura
    solo a administradores y radicadores.
    """
    def has_permission(self, request, view):
        # Permisiones de lectura son permitidas para cualquier request (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Permisiones de escritura son solo para admin y radicador
        return request.user and request.user.is_authenticated and request.user.rol in ['admin', 'radicador']

class IsAdminOrSelf(permissions.BasePermission):
    """
    Permisos para UsuarioViewSet:
    - Permite cambio de contraseña propia a cualquier usuario autenticado.
    - Permite GET (list, retrieve) a cualquier usuario autenticado (el queryset en la vista
      se encarga de limitar a los no-admins a ver solo su propio perfil).
    - Restringe creación (POST), edición (PUT/PATCH) y eliminación (DELETE) solo a administradores.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Permitir cambiar su propia contraseña
        if view.action == 'change_password':
            return True
            
        # Permitir ver (GET) perfiles (la vista filtra qué registros pueden ver)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Operaciones de escritura (POST, PUT, PATCH, DELETE) requieren rol admin
        return request.user.rol == 'admin'

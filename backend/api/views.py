from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario, Proceso, Adicion, Pago
from .serializers import UsuarioSerializer, ProcesoSerializer, AdicionSerializer, PagoSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'username']

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({"error": "Nueva contraseña requerida"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        return Response({"success": "Contraseña actualizada"})

class ProcesoViewSet(viewsets.ModelViewSet):
    serializer_class = ProcesoSerializer

    def get_queryset(self):
        queryset = Proceso.objects.all()
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(year=year)
        return queryset.order_by('-fecha_creacion')
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(creado_por=self.request.user)
        else:
            serializer.save()

class AdicionViewSet(viewsets.ModelViewSet):
    queryset = Adicion.objects.all()
    serializer_class = AdicionSerializer

class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer

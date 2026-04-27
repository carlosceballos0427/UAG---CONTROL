from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Usuario, Proceso

class APISecurityAndFlowTests(APITestCase):
    def setUp(self):
        # Crear un usuario de prueba
        self.user = Usuario.objects.create_user(
            username='carlos_test',
            email='carlos@test.com',
            password='testpassword123',
            rol='radicador'
        )
        self.procesos_url = reverse('procesos-list')

    def test_unauthenticated_access_is_denied(self):
        """
        Prueba que un usuario sin token/sesión no pueda acceder a los procesos.
        Garantiza que la API está debidamente protegida con IsAuthenticated.
        """
        response = self.client.get(self.procesos_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(str(response.data['detail']), "Authentication credentials were not provided.")

    def test_authenticated_access_is_allowed(self):
        """
        Prueba que un usuario autenticado pueda listar procesos.
        """
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.procesos_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_proceso_creation_sets_creado_por(self):
        """
        Prueba que al crear un proceso logueado, se asigne automáticamente su creador (creado_por).
        """
        self.client.force_authenticate(user=self.user)
        data = {
            'year': '2024',
            'numero_proceso': 'TEST-001',
            'objeto': 'Adquisición de servicios de prueba',
            'estado': 'PENDIENTE'
        }
        response = self.client.post(self.procesos_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Validar en base de datos
        self.assertEqual(Proceso.objects.count(), 1)
        proceso = Proceso.objects.get()
        self.assertEqual(proceso.year, '2024')
        self.assertEqual(proceso.creado_por, self.user)

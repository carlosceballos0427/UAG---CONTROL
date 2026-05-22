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
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
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

    def test_visualizador_can_read_but_not_write(self):
        """
        Prueba que un usuario con rol 'visualizador' pueda consultar los procesos
        pero no pueda crearlos.
        """
        visualizador = Usuario.objects.create_user(
            username='visualizador_test',
            email='vis@test.com',
            password='testpassword123',
            rol='visualizador'
        )
        self.client.force_authenticate(user=visualizador)
        
        # Consultar listado (debe poder)
        response = self.client.get(self.procesos_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Crear proceso (debe fallar con 403)
        data = {
            'year': '2024',
            'numero_proceso': 'TEST-VIS',
            'objeto': 'Intento de creación visualizador',
            'estado': 'PENDIENTE'
        }
        response = self.client.post(self.procesos_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_visualizador_cannot_modify_or_delete_processes(self):
        """
        Prueba que un usuario con rol 'visualizador' no pueda editar ni eliminar procesos existentes.
        """
        # Crear un proceso
        proceso = Proceso.objects.create(
            year='2025',
            numero_proceso='PROCESO-A-EDITAR',
            estado='PENDIENTE'
        )
        
        visualizador = Usuario.objects.create_user(
            username='visualizador_test2',
            email='vis2@test.com',
            password='testpassword123',
            rol='visualizador'
        )
        self.client.force_authenticate(user=visualizador)
        
        # Intentar modificar (PUT)
        proceso_detail_url = reverse('procesos-detail', kwargs={'pk': proceso.id})
        response = self.client.put(proceso_detail_url, {'year': '2025', 'numero_proceso': 'MODIFICADO', 'estado': 'TERMINADO'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Intentar eliminar (DELETE)
        response = self.client.delete(proceso_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_visualizador_cannot_manage_other_users_but_can_change_own_password(self):
        """
        Prueba las restricciones de usuario para un visualizador:
        - No puede listar a otros usuarios (solo a sí mismo).
        - No puede crear otros usuarios.
        - Sí puede cambiar su propia contraseña.
        """
        # Crear un admin para comprobar que no lo ve en la lista
        Usuario.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='adminpassword',
            rol='admin'
        )
        
        visualizador = Usuario.objects.create_user(
            username='visualizador_test3',
            email='vis3@test.com',
            password='testpassword123',
            rol='visualizador'
        )
        self.client.force_authenticate(user=visualizador)
        
        # Listar usuarios (solo debe devolver a sí mismo)
        usuarios_url = reverse('usuario-list')
        response = self.client.get(usuarios_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'visualizador_test3')
        
        # Intentar crear un usuario (debe fallar)
        response = self.client.post(usuarios_url, {
            'username': 'nuevo_usuario_infiltrado',
            'password': 'claveinfiltrada',
            'rol': 'radicador'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Cambiar su propia contraseña (debe funcionar)
        change_password_url = reverse('usuario-change-password')
        response = self.client.post(change_password_url, {'new_password': 'nuevaclavesupersegura'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

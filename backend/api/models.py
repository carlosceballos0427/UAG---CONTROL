from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class Usuario(AbstractUser):
    """
    Modelo de usuario personalizado.
    Requerimos un administrador y radicadores.
    """
    ROLE_CHOICES = (
        ('admin', 'Administrador'),
        ('radicador', 'Radicador'),
    )
    rol = models.CharField(max_length=20, choices=ROLE_CHOICES, default='radicador')

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"

class Proceso(models.Model):
    """
    Representa un Contrato o Proceso de Seguimiento.
    Basado en los campos que venían del esquema de GraphQL.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    year = models.CharField(max_length=4)
    numero_item = models.CharField(max_length=50, blank=True, null=True, verbose_name="Número de Ítem")
    mes = models.CharField(max_length=20, blank=True, null=True)
    numero_proceso = models.CharField(max_length=100, blank=True, null=True, verbose_name="Número de Proceso")
    area_encargada = models.CharField(max_length=200, blank=True, null=True, verbose_name="Área Encargada")
    dependencia = models.CharField(max_length=200, blank=True, null=True)
    bp = models.CharField(max_length=100, blank=True, null=True, verbose_name="BP")
    proceso_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID del Proceso")
    objeto = models.TextField(blank=True, null=True)
    modalidad = models.CharField(max_length=100, blank=True, null=True)
    tipo_contrato = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tipo de Contrato")
    presupuesto_estimado = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True, verbose_name="Presupuesto Estimado")
    valor_adjudicado = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True, verbose_name="Valor Adjudicado")
    cdp = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True, verbose_name="CDP")
    
    estado = models.CharField(max_length=50, default="PENDIENTE")
    
    supervisor = models.CharField(max_length=200, blank=True, null=True)
    apoyo_supervision = models.CharField(max_length=200, blank=True, null=True, verbose_name="Apoyo a la Supervisión")
    contratista = models.CharField(max_length=200, blank=True, null=True)
    
    # Auditoría básica
    creado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='procesos_creados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Proceso {self.numero_proceso or 'Sin número'} - {self.year}"

class Adicion(models.Model):
    """
    Tabla para Adiciones de presupuesto (Uno a Muchos con Proceso)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proceso = models.ForeignKey(Proceso, on_delete=models.CASCADE, related_name='adiciones')
    descripcion = models.TextField(blank=True, null=True)
    valor = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Adición a {self.proceso}"

class Pago(models.Model):
    """
    Tabla para Pagos / Cuentas de Cobro (Uno a Muchos con Proceso)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proceso = models.ForeignKey(Proceso, on_delete=models.CASCADE, related_name='pagos')
    periodo = models.CharField(max_length=50, blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    valor = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.periodo} - {self.proceso}"

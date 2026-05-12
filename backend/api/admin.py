from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Proceso, Adicion, Pago

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'rol', 'is_staff')
    list_filter = ('rol', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Rol UAG', {'fields': ('rol',)}),
    )

@admin.register(Proceso)
class ProcesoAdmin(admin.ModelAdmin):
    list_display = ('numero_proceso', 'year', 'contratista', 'estado', 'modalidad', 'link_secop', 'fecha_creacion')
    list_filter = ('year', 'estado', 'modalidad')
    search_fields = ('numero_proceso', 'contratista', 'objeto', 'link_secop')

@admin.register(Adicion)
class AdicionAdmin(admin.ModelAdmin):
    list_display = ('proceso', 'descripcion', 'valor')

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('proceso', 'periodo', 'fecha', 'valor')

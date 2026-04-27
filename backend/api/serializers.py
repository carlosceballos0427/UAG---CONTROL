from rest_framework import serializers
from .models import Usuario, Proceso, Adicion, Pago

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'first_name', 'last_name', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class AdicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adicion
        fields = '__all__'

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'

class ProcesoSerializer(serializers.ModelSerializer):
    adiciones = AdicionSerializer(many=True, read_only=True)
    pagos = PagoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Proceso
        fields = '__all__'
        read_only_fields = ['id', 'creado_por', 'fecha_creacion', 'fecha_actualizacion']

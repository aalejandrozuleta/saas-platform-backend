# Flujo de Registro de Usuario

1. El usuario envía email y contraseña
2. Se validan como Value Objects
3. Se verifica si el usuario ya existe
4. La contraseña se encripta
5. Se crea la entidad User
6. Se guarda el usuario en el repositorio
7. Se registra un evento de auditoría REGISTER_SUCCESS

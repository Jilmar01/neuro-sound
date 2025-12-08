# Neuro Sound

Dominio del la API definido en las variables de entorno .env

#### .env

```
URL=http://localhost:
PORT=5000
```

#### Ejemplo final:
`http://localhost:5000/api/user/register`

## Usuarios

### Registrar usuario

Crea un nuevo usuario en el sistema.

#### Metodo POST

#### `/api/v1/user/register`

#### Cuerpo

```json
{
	"name": "Admin",
	"last_name": "Admin",
	"email": "admin@neurosound.com",
	"password": "12345678"
}
```

#### Respuesta

```json
{
	"success": true,
	"status": 201,
	"message": "Usuario creado exitosamente",
	"data": {
		"name": "Admin",
		"last_name": "Admin",
		"email": "admin@neurosound.com",
		"photo": null,
		"status": true,
		"_id": "692b72695e40ebd6c0ff809b",
		"createdAt": "2025-11-29T22:23:37.569Z",
		"updatedAt": "2025-11-29T22:23:37.569Z"
	}
}
```
### Obtener Datos de Usuario

Obtiene la información de un usuario mediante su ID.

#### Metodo GET

### `/api/user/data/{id}`

#### Parameters

- `id` - ID del usuario

#### Cuerpo

```json
{}
```

#### Respuesta

```json
{
	"success": true,
	"status": 200,
	"message": "Datos del usuario",
	"data": {
		"_id": "692b72695e40ebd6c0ff809b",
		"name": "Admin",
		"last_name": "Admin",
		"email": "admin@neurosound.com",
		"photo": null,
		"status": true,
		"createdAt": "2025-11-29T22:23:37.569Z",
		"updatedAt": "2025-11-29T22:23:37.569Z"
	}
}
```

### Actualizar Datos del Usuario

Actualiza la información del usuario especificado por ID.

#### Metodo PUT

### `/api/user/update/{id}`

#### Parameters

- `id` - ID del usuario

#### Cuerpo

```json
{
	"name": "Admin",
	"last_name": "Root"
}
```

#### Respuesta

```json
{
	"success": true,
	"status": 200,
	"message": "Usuario actualizado",
	"data": {
		"_id": "692b72695e40ebd6c0ff809b",
		"name": "Admin",
		"last_name": "Root",
		"email": "admin@neurosound.com",
		"photo": null,
		"status": true,
		"createdAt": "2025-11-29T22:23:37.569Z",
		"updatedAt": "2025-11-29T22:24:45.415Z"
	}
}
```

### Eliminar Usuario

Elimina un usuario de la base de datos basado en su ID.

#### Metodo DELETE

### `/api/user/DELETE/{id}`

#### Parameters

- `id` - ID del usuario

#### Cuerpo

```json
{}
```

#### Respuesta

```json
{
	"success": true,
	"status": 200,
	"message": "Usuario eliminado",
	"data": {
		"_id": "692b72695e40ebd6c0ff809b",
		"name": "Admin",
		"last_name": "Root",
		"email": "admin@neurosound.com",
		"photo": null,
		"status": true,
		"createdAt": "2025-11-28T13:06:30.295Z",
		"updatedAt": "2025-11-28T13:06:30.295Z"
	}
}
```
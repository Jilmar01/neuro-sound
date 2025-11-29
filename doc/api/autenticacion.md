# Neuro Sound

Dominio del la API definido en las variables de entorno .env

#### .env

```
URL=http://localhost:
PORT=5000
```

#### Ejemplo final:
`http://localhost:5000/api/user/register`

## Autenticacion

### Iniciar Sesion

Autentica al usuario y genera el token correspondiente.

#### Metodo POST

### `/api/auth/login`

#### Cuerpo

```json
{
	"email": "admin@neurosound.com",
	"password": "12345678"
}
```

#### Respuesta

```json
{
	"success": true,
	"status": 200,
	"message": "Login exitoso",
	"data": {
		"user": {
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
}
```

### Cerrar Sesion

Cierra la sesión del usuario activo o invalida su token.

#### Metodo POST

### `/api/auth/logout`

#### Cuerpo

```json
{}
```

#### Respuesta

```json
{
	"success": true,
	"status": 200,
	"message": "Logout exitoso",
	"data": null
}
```

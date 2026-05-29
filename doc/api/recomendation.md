# Neuro Sound

## Recomendación de Canciones

Estas rutas permiten generar y obtener recomendaciones musicales personalizadas para el usuario autenticado.

> **Importante:**  
> Todas las rutas de recomendación requieren autenticación mediante token.

---

## Dominio de la API

El dominio de la API se define en las variables de entorno `.env`.

#### `.env`

```env
URL=http://url-servidor
```

#### Ejemplo final

```bash
http://url-servidor/api/recommend/generate
```

---

## Generar Recomendación

Genera una nueva recomendación de canciones basada en los datos del usuario.

#### Método GET

### `/api/recommend/generate`

#### URL Completa

```bash
http://url-servidor/api/recommend/generate
```

#### Headers

```json
{
	"Authorization": "Bearer TOKEN"
}
```

#### Cuerpo

```json
{}
```

#### Respuesta

```json
{
	"success": true,
	"status": 200,
	"message": "Recomendación generada correctamente",
	"data": {
		"recommendationId": "6930ab529b3a8c4f2d1e7781",
		"generatedAt": "2026-05-27T15:30:00.000Z"
	}
}
```

---

## Obtener Última Recomendación

Obtiene la última recomendación de canciones generada para el usuario autenticado.

#### Método GET

### `/api/recommend/latest`

#### URL Completa

```bash
http://url-servidor/api/recommend/latest
```

#### Headers

```json
{
	"Authorization": "Bearer TOKEN"
}
```

#### Cuerpo

```json
{}
```

#### Respuesta

```json
{
	"success": true,
	"status": 200,
	"message": "Recomendación obtenida correctamente",
	"data": {
		"recommendationId": "6930ab529b3a8c4f2d1e7781",
		"songs": [
			{
				"title": "Blinding Lights",
				"artist": "The Weeknd"
			},
			{
				"title": "Levitating",
				"artist": "Dua Lipa"
			},
			{
				"title": "Shape of You",
				"artist": "Ed Sheeran"
			}
		],
		"generatedAt": "2026-05-27T15:30:00.000Z"
	}
}
```
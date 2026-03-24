# Consulta tracking

- Source: https://soporte.pagopar.com/portal/es/kb/articles/consulta-tracking
- Article ID: 387583000001737139
- Created: 2020-11-04T00:51:51.000Z
- Updated: 2025-10-01T17:36:25.000Z

## Summary

Descripción Si utilizó las funcionalidades de couriers ofrecidos por Pagopar (AEX, Mobi), puede que quiera consultar el estado del tracking de un pedido o de un producto específico, este endpoint le permite realizar dicha operación. URL: ...

## Content

DescripciónSi utilizó las funcionalidades de [couriers ofrecidos por Pagopar (AEX, Mobi),](https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery) puede que quiera consultar el estado del tracking de un pedido o de un producto específico, este endpoint le permite realizar dicha operación.URL: [https://api.pagopar.com/api/pedidos/1.1/tracking](http://api.pagopar.local/api/pedidos/1.1/tracking)Método: POSTDatos a enviar
```
{
"token_publico": "12a1a8b7e2de887fcf451cc0a2c73e4f",
"token": "a2ac64dc286e75c6f2d5c7a5dd3c35266532dfd8",
"hash_pedido": "906a7c0f81a0c3213594c5208973d6dcfcc56a82ec112804190ca58214bfd8b3",
"id_producto": "642317"
}
```

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token_publico | Clave privada obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | 12a1a8b7e2de887fcf451cc0a2c73e4f |
| token | Se genera concatenando el token privado con el string 'CONSULTA' de la siguiente forma sha1(private_key.CONSULTA) | a2ac64dc286e75c6f2d5c7a5dd3c35266532dfd8 |
| hash_pedido | Hash de pedido obtenido al iniciar transacción | 906a7c0f81a0c3213594c5208973d6dcfcc56a82ec112804190ca58214bfd8b3 |
| id_producto | Es un parámetro opcional, en caso que queramos saber el tracking de un producto específico dentro de nuestro pedido | 642317 |
Datos a recibir en caso exitoso
```
{
"respuesta": true,
"resultado": [
{
"id_tracking": "A000164544",
"estado_aex": "Entregada",
"evento_aex": "Entrega realizada",
"url_tracking": "http://pagopar.local/tracking/8c5c71a0de617d653991061a64c3e4d361a1c473548b87aa7639557c4b33ccc5%22,
"etapa": "3",
"fecha_estimada_entrega": "2020-08-03 22:14:29.232815",
"monto": "22620.00",
"metodo_envio": "AEX",
"id_productos": [
"642317"
]
}
]
}
```
Datos a recibir en caso fallido
```
{
"respuesta": false,
"resultado": "Token no coincide."
}
```

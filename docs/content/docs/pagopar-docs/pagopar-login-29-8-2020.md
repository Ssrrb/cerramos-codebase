---
title: "Pagopar Login"
---

# Pagopar Login

- Source: https://soporte.pagopar.com/portal/es/kb/articles/pagopar-login-29-8-2020
- Article ID: 387583000000961033
- Created: 2020-08-29T19:24:11.000Z
- Updated: 2025-08-18T20:34:20.000Z
- Tags: marketplace, pagopar login, split billing

## Summary

¿Qué es Pagopar Login? Pagopar Login es una herramienta que te permite conectar una cuenta de usuario de tu sitio web con una cuenta específica (comercio) de Pagopar. Esto puede ser muy útil cuando se utiliza Split Billing, ya que Pagopar retorna los ...

## Content

# ¿Qué es Pagopar Login?

Pagopar Login es una herramienta que te permite conectar una cuenta de usuario de tu sitio web con una cuenta específica (comercio) de Pagopar. Esto puede ser muy útil cuando se utiliza Split Billing, ya que Pagopar retorna los datos necesarios para identificar a dicho usuario Pagopar, para luego poder acreditarle ventas hechas en tu sitio web. Si tenés un sitio web tipo marketplace esta herramienta puede ser muy útil.

## Requisitos

Para utilizar esta funcionalidad primero debe contactarse con el equipo comercial a [comercial@pagopar.com](mailto:comercial@pagopar.com)

## Conceptos básicos

Comercio Padre: Es el comercio que posee el plan empresarial y quien desarrolla la integración con Pagopar Login. El comercio padre puede ganar una comisión, definida por el mismo de forma dinámica, de acuerdo a sus reglas de negocios (planes propios en su sitio web) por cada venta que se tenga. Un ejemplo a nivel mundial de marketplace podría ser Amazon.com   Comercio Hijo: Es el comercio dueño del producto o servicio que se está vendiendo, vinculará su cuenta del sitio web del comercio padre con un comercio de su cuenta de Pagopar. Siguiendo el ejemplo anterior, si Amazon.com es el comercio padre, los comercios hijos serían todos los comercios dentro de Amazon.com que venden.

## Pasos para integrar Pagopar Login

### Pantalla inicial

El primer paso es tener una página donde expliques al usuario sobre la vinculación, en caso de que cobres un adicional por venta, deberías explicar en esta pantalla también. Además, se debe tener un botón con un link de vinculación ,dicho link sería el siguiente:

![image](https://desk.zoho.com/DocsDisplay?zgId=687739706&mode=inline&blockId=blojt1568e77ffb8e4e02a76474e52ed80842)

Ejemplo de página inicial. En este caso, el link de vinculación se encuentra en el botón "Empezar"

### Link de vinculación

El link de vinculación sería el siguiente:
```
https://www.pagopar.com/v1.0/pagopar-login/login/?hash_comercio=A8aEa8X9e3te9w7fcf451cx0a2cz3xYf&usuario_id=4161&url_redirect=https%3A%2F%2Fwww.comerciopadre.com%2Fcallback-pagopar-login%2F%3Fpro%3D0&plan=1
```

| Campo | Explicación | Ejemplo |
| --- | --- | --- |
| hash_comercio | Clave pública del comercio padre. | A8aEa8X9e3te9w7fcf451cx0a2cz3xYf |
| usuario_id | El id de usuario/cuenta del usuario en el sitio web del comercio padre | 4161 |
| url_redirect | URL donde se realizará un redireccionamiento al finalizar la vinculación | [https://www.comerciopadre.com/callback-pagopar-login&pro=0](https://www.comerciopadre.com/callback-pagopar-login&pro=0) |
| plan | **(opcional)** Plan de Pagopar al que se va a suscribir el usuario. Para ver los planes disponibles puede visitar [https://www.pagopar.com/planes](https://www.pagopar.com/planes) | 1 |

### Página de Pagopar Login

Una vez que el cliente haga clic en la url de vinculación, verá la página de Pagopar Login, en la cual se puede loguear a su cuenta Pagopar o registrar en caso que no posea una cuenta.

![image](https://desk.zoho.com/DocsDisplay?zgId=687739706&mode=inline&blockId=blojtacc8c4ea5a584764b37c14df39b07890)

Resultado de hacer clic en el link de vinculación   Una vez en esta página, pueden suceder varias opciones:

1. Si el usuario se loguea:
2. Si el usuario decide registrarse

### Redireccionamiento de vinculación

Una vez vinculada la cuenta, se redireccionará a la url de redireccionamiento previamente definida (url_redirect) pero con un parámetro agregado, explicado a continuación.
| **Campo** | **Explicación** | **Ejemplo** |
| --- | --- | --- |
| hash_comercio | Clave pública del comercio hijo. | H8aEa8X9e3te9w7fcf451cx0a2cz3xYf |

> ℹ️ El hash_comercio debe ser guardado en el sitio de cliente, con este dato serán invocadas los endpoint correspondientes al comercio hijo.

### Confirmación de vinculación

Una vez aterrizada en la página del cliente, se debe confirmar la vinculación, esto finaliza el proceso de vinculación:      URL: https://api.pagopar.com/api/pagopar-login/2.0/confirmar-vinculacion/  Método: POST      Generación del token

```
sha1(token_privado + 'PAGOPAR-LOGIN'),
```
Datos a enviar
```
{
"token":"d17c2ccd82bf1929bf734b046e3a611e",
"token_publico":"3301513c6ce2e98985b231c5801de515",
"token_comercio_hijo":"e433de7422c08f1e15a6d9929d1e3f59",
"usuario_id":4161,
}
```
Datos retornados en caso de error
```
{
"respuesta": false,
"resultado": "Token no corresponde."
}
```
Datos retornados en caso de éxito
```
{
"respuesta": true,
"resultado": {
"descripcion": "Ushop",
"porcentaje_comision": 6.05,
"razon_social": "Ushop de Enrique González",
"ruc": "1234567-8",
"modo_pago_denominacion": "Pagopar-Card",
"servicios": true,
"retiro_local": true,
"envio_propio": true,
"comercio": 12,
"ranking": 5,
"modo_pago": 1,
"contrato_firmado": false,
"permisos_link_venta": false,
"forma_pago": [
{
"monto_minimo": 1000,
"forma_pago": "Pago Express",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - Tarjetas de crédito",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Tigo Money",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 50000,
"forma_pago": "Practipago",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Billetera Personal",
"tipo": "Diferenciado",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Pago Móvil",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Infonet Cobranzas",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Procard - Tarjetas de crédito",
"tipo": "Defecto",
"porcentaje_comision": 7.7
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - Catastrar Tarjeta",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Aqui Pago",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Contra Entrega",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Zimple",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - V2.0",
"tipo": "Defecto",
"porcentaje_comision": 6.05
}
],
"plan": {
"plan": 3,
"descripcion": "Avanzado",
"costo": 199000,
"fecha_siguiente_factura": "2020-08-01T12:36:56.685076"
},
"entorno": "Staging",
"tipo_venta": "Venta Comercio",
"usuario": {
"email": "emailcliente@gmail.com",
"nombre": "Enrique",
"apellido": "González",
"celular": "0972123456",
"saldo": 26661,
"documento": "1234567",
"fecha_saldo_actualizacion": "2020-07-17T13:10:35.428805",
"monto_pendiente_cobro": -33002,
"hash": null,
"estado_pago": "N",
"pago_plan": true,
"pago_tarjeta": true
},
"pedidos_pendientes": [
{
"url": "https://pagopar.com/pagos/0b7a21a9e019a98568b857d868e4bbd8c66df72372697033d7d2e6670cd3326b%22,
"fecha_maxima_pago": "2020-09-01T00:00:00",
"estado": "Pendiente",
"monto": 199000,
"descripcion": "Pago mensual plan: Avanzado Junio"
},
{
"url": "https://pagopar.com/pagos/2b5e93ca665affefb34476b7d7bc29af609e162cbf0e7c91795a0b11ac00e30e%22,
"fecha_maxima_pago": "2020-09-01T00:00:00",
"estado": "Pendiente",
"monto": 199000,
"descripcion": "Pago mensual plan: Avanzado Mayo"
}
]
}
}
```

### Obtener datos del comercio hijo

Este endpoint no está dentro del circuito de Pagopar Login, pero puede ser útil cuando se necesite obtener datos de la cuenta vinculada en tiempo real, por ejemplo, para mostrar las deudas que tiene en Pagopar en el sitio web del comercio padre.      URL: https://api.pagopar.com/api/pagopar-login/2.0/datos-comercio/  Método: POST      Generación del token

```
sha1(token_privado + 'PAGOPAR-LOGIN'),
```
Datos a enviar
```
{
"token":"d17c2ccd82bf1929bf734b046e3a611e",
"token_publico":"3301513c6ce2e98985b231c5801de515",
"token_comercio_hijo":"e433de7422c08f1e15a6d9929d1e3f59",
"usuario_id":4161,
}
```
Datos retornados en caso de error
```
{
"respuesta": false,
"resultado": "Token no corresponde."
}
```
Datos retornados en caso de éxito
```
{
"respuesta": true,
"resultado": {
"descripcion": "Ushop",
"porcentaje_comision": 6.05,
"razon_social": "Ushop de Enrique González",
"ruc": "1234567-8",
"modo_pago_denominacion": "Pagopar-Card",
"servicios": true,
"retiro_local": true,
"envio_propio": true,
"comercio": 12,
"ranking": 5,
"modo_pago": 1,
"contrato_firmado": false,
"permisos_link_venta": false,
"forma_pago": [
{
"monto_minimo": 1000,
"forma_pago": "Pago Express",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - Tarjetas de crédito",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Tigo Money",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 50000,
"forma_pago": "Practipago",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Billetera Personal",
"tipo": "Diferenciado",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Pago Móvil",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Infonet Cobranzas",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Procard - Tarjetas de crédito",
"tipo": "Defecto",
"porcentaje_comision": 7.7
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - Catastrar Tarjeta",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Aqui Pago",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Contra Entrega",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Zimple",
"tipo": "Defecto",
"porcentaje_comision": 6.05
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - V2.0",
"tipo": "Defecto",
"porcentaje_comision": 6.05
}
],
"plan": {
"plan": 3,
"descripcion": "Avanzado",
"costo": 199000,
"fecha_siguiente_factura": "2020-08-01T12:36:56.685076"
},
"entorno": "Staging",
"tipo_venta": "Venta Comercio",
"usuario": {
"email": "emailcliente@gmail.com",
"nombre": "Enrique",
"apellido": "González",
"celular": "0972123456",
"saldo": 26661,
"documento": "1234567",
"fecha_saldo_actualizacion": "2020-07-17T13:10:35.428805",
"monto_pendiente_cobro": -33002,
"hash": null,
"estado_pago": "N",
"pago_plan": true,
"pago_tarjeta": true
},
"pedidos_pendientes": [
{
"url": "https://pagopar.com/pagos/0b7a21a9e019a98568b857d868e4bbd8c66df72372697033d7d2e6670cd3326b%22,
"fecha_maxima_pago": "2020-09-01T00:00:00",
"estado": "Pendiente",
"monto": 199000,
"descripcion": "Pago mensual plan: Avanzado Junio"
},
{
"url": "https://pagopar.com/pagos/2b5e93ca665affefb34476b7d7bc29af609e162cbf0e7c91795a0b11ac00e30e%22,
"fecha_maxima_pago": "2020-09-01T00:00:00",
"estado": "Pendiente",
"monto": 199000,
"descripcion": "Pago mensual plan: Avanzado Mayo"
}
]
}
}
```

---
title: "API - Integración de medios de pagos"
---

# API - Integración de medios de pagos

- Source: https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos
- Article ID: 387583000000629069
- Created: 2020-06-25T01:50:20.000Z
- Updated: 2025-08-18T20:10:47.000Z
- Tags: integracion, api

## Summary

Flujo normal de compra Paso #1: El comercio crea un pedido en Pagopar Paso #2: El comercio redirecciona a la página de Checkout de Pagopar Paso #3: Pagopar notifica al comercio sobre el pago Paso #4: Pagopar redirecciona a la página del resultado de ...

## Content

## Flujo normal de compra

1. Paso #1: El comercio crea un pedido en Pagopar
2. Paso #2: El comercio redirecciona a la página de Checkout de Pagopar
3. Paso #3: Pagopar notifica al comercio sobre el pago
4. Paso #4: Pagopar redirecciona a la página del resultado de pago del Comercio

> Para facilidad de integración, contamos con un [proyecto en POSTMAN](https://www.postman.com/pagopar/workspace/pagopar/overview) con los endpoints utilizados en esta documentación.

## Paso #1: El comercio crea un pedido en Pagopar

Descripción El comercio genera un pedido en Pagopar, Pagopar retorna un hash que servirá para armar una URL Observación El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com Token para este endpoint se genera: En PHP:

```
<?php sha1($datos['comercio_token_privado'] . $idPedido . strval(floatval($j['monto_total']))); ?>
```

### ¿Vas a utilizar medios de envíos tercerizados ofrecidos por Pagopar?

Para ello, debes seguir estos pasos adicionales explicados en [la documentación.](https://soporte.pagopar.com/portal/es/kb/articles/integraci%C3%B3n-de-servicios-de-pickup-delivery#Pasos_para_Agregar_soporte_de_servicio_de_pickupdelivery)URL: [https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion](https://api.pagopar.com/api/comercios/1.1/iniciar-transaccion) Método: POST Datos de ejemplo que el Comercio enviaría a Pagopar: Contenido:

```
{
```

```
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d",
"comprador": {
"ruc": "1234567-8",
"email": "mailcomprador@gmail.com",
"ciudad": null,
"nombre": "Enrique González",
"telefono": "0971111234",
"direccion": "",
"documento": "1234567",    "coordenadas": "",
"razon_social": "Enrique González",    "tipo_documento": "CI",
"direccion_referencia": null
},
"public_key": "63820974a40fe7c5c5c53c429af8b25bed599dbf",
"monto_total": 100000,
"tipo_pedido": "VENTA-COMERCIO",
"compras_items": [
{
"ciudad": "1",
"nombre": "Ticket virtual a evento Ejemplo 2017",
"cantidad": 1,
"categoria": "909",
"public_key": "63820974a40fe7c5c5c53c429af8b25bed599dbf",      "url_imagen": "http://www.example.com/d7/wordpress/wp-content/uploads/2017/10/ticket.png",
"descripcion": "Ticket virtual a evento Ejemplo 2017",
"id_producto": 895,
"precio_total": 100000,
"vendedor_telefono": "",
"vendedor_direccion": "",
"vendedor_direccion_referencia": "",
"vendedor_direccion_coordenadas": ""
}
],
"fecha_maxima_pago": "2018-01-04 14:14:48",
"id_pedido_comercio": "1134",
"descripcion_resumen": "",
"forma_pago": 9
}
```
Explicación de datos a enviar

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1($datos['comercio_token_privado'] . $idPedido . strval(floatval($j['monto_total']))); | ef4f7ebd763e205a45a9fae5e5d8d7508235778d |
| comprador.ruc | Ruc del comprador. El campo debe estar presente, si no tiene ruc, debe ir con el valor vacío ("") | 1234567-8 |
| comprador.email | E-mail del comprador. Campo obligatorio. | [mailcomprador@gmail.com](mailto:fernandogoetz@gmail.com) |
| comprador.ciudad | Si no está utilizando los servicios de couriers ofrecidos por pagopar (Sólo para productos físicos), debe enviar de todas formas el campo con el valor 1. De lo contrario utilizar la [documentación de integración de couriers](https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery) para obtener el ID de ciudad | 1 |
| comprador.nombre | Nombre del comprador. Campo obligatorio. | Enrique González |
| comprador.telefono | Número de teléfono en formato internacional. | +595971111234 |
| comprador.direccion | Dirección del comprador. El campo debe estar presente, si no tiene dirección, enviar el valor vacío (""). |  |
| comprador.documento | Número de cédula. Campo obligatorio. En caso que la forma de pago sea PIX se debe enviar el CPF o CPNJ | 1234567 |
| comprador.coordenadas | Coordenadas de la dirección del comprador, si no tiene, enviar con el valor vacío. |  |
| comprador.razon_social | Razón social del comprador, si no tiene, enviar el campo con el valor vacío. |  |
| comprador.tipo_documento | Tipo de documento del comprador, por el momento siempre debe enviarse el valor "CI" inclusive si la forma de pago sea PIX. | CI |
| comprador.direccion_referencia | Referencia de la dirección del comprador. El campo debe estar presente, si no tiene referencia, enviar vacío. |  |
| public_key | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | 63820974a40fe7c5c5c53c429af8b25bed599dbf |
| monto_total | Monto total que se va a transaccionar, en guaranies (PYG). | 100000 |
| tipo_pedido | Si se trata de una transacción simple, debe enviarse el valor "VENTA-COMERCIO". Si es split billing "COMERCIO-HEREDADO". | VENTA-COMERCIO |
| compras_items.[0].ciudad | La ciudad del comprador, si no tiene, enviar el valor 1. | 1 |
| compras_items.[0].nombre | Nombre del producto o servicio que se está comprando. Obligatorio. | Ticket virtual a evento Ejemplo 2017 |
| compras_items.[0].cantidad | Cantidad del producto que se está comprando, solo con fines informativos. | 1 |
| compras_items.[0].categoria | Si no está utilizando los servicios de couriers ofrecidos por pagopar (Sólo para productos físicos), debe enviar de todas formas el campo con el valor 909. De lo contrario utilizar la [documentación de integración de couriers](https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery) para obtener el ID de la categoría | 909 |
| compras_items.[0].public_key | Clave publica del vendedor, si no es una transacción split billing, será el mismo valor que el campo public_key. | 63820974a40fe7c5c5c53c429af8b25bed599dbf |
| compras_items.[0].url_imagen | URL de la imagen del producto. Si no tiene imagen, enviar el campo con el valor vacío. | [http://www.example.com/d7/wordpress/wp-content/uploads/2017/10/ticket.png](http://www.example.com/d7/wordpress/wp-content/uploads/2017/10/ticket.png) |
| compras_items.[0].descripcion | Descripción del producto que se está comprando. | Ticket virtual a evento Ejemplo 2017 |
| compras_items.[0].id_producto | Identificador del producto/servicio que se está comprando. | 895 |
| compras_items.[0].precio_total | Precio total del producto/servicio que se está comprando (No es el precio unitario, sino el precio total agrupado por producto) | 100000 |
| compras_items.[0].vendedor_telefono | Telefono del vendedor. Si no tiene, debe enviarse el valor vacío. |  |
| compras_items.[0].vendedor_direccion | Dirección del vendedor. Si no tiene, debe enviarse el valor vacío. |  |
| compras_items.[0].vendedor_direccion_referencia | Referencia de la dirección del vendedor. Si no tiene, debe enviarse el valor vacío. |  |
| compras_items.[0].vendedor_direccion_coordenadas | Coordenadas de la dirección del vendedor. Si no tiene, debe enviarse el valor vacío. |  |
| fecha_maxima_pago | Es la fecha máxima que tiene el comprador para pagar el pedido, una vez que llegue a la fecha establecida, el pedido automáticamente se cancela y ya no puede pagarse. | 2018-01-04 14:14:48 |
| id_pedido_comercio | ID del pedido/transacción del comercio. Debe ser único tanto en entorno de Desarrollo y Producción. Alfanumérico. | 1134 |
| descripcion_resumen | Descripción breve del pedido, puede coincidir con el valor de compras_items.[0].nombre o enviar con el valor vacío. | Ticket virtual a evento Ejemplo 2017 |
| forma_pago | Forma de pago en la que se pagará el pedido creado | 9 |
Datos de ejemplo que Pagopar retornaría en caso de éxito (retorna el hash de pedido):

```
{
"respuesta": true,
"resultado": [
{
"data": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",           "pedido": "1750"        }
]
}
```

> El campo 'data' es el que utilizará en su base de datos para relacionar los datos de cada pedido, este campo es obligatorio almacenarlo. En cambio el campo 'pedido' tiene un uso meramente informativo

> ![Info](https://img.zohostatic.com/zde/static/images/info.png)A tener en cuenta, el valor de resultado.data es el identificador del pedido.

Datos de ejemplo que Pagopar retornaría en caso de error:

```
{
"respuesta": false,   "resultado": "Token no coincide."}
```
Puede ver el detalle de los [distintos tipos de errores](https://soporte.pagopar.com/portal/es/kb/articles/listado-de-errores-al-iniciar-transacci%C3%B3n) que pudiera retornar la ejecución del endpoint iniciar-transacción.

> ![Notes](https://static.zohocdn.com/zoho-desk-editor/static/images/file.png)Para cobrar con divisa en dólares: En lugar de utilizar el endpoint iniciar-transaccion, debes utilizar [el endpoint iniciar-transaccion-divisa](https://soporte.pagopar.com/portal/es/kb/articles/divisa-usd) para iniciar una transacción en dólares estadounidenses.

## Paso #2: El comercio redirecciona a la página de Checkout de Pagopar

Descripción El comercio redirecciona a la página de Checkout de Pagopar, con el dato obtenido en el paso anterior. Antes de redireccionar, se debe asociar el identificador de pedido del comercio con el hash del Pedido de Pagopar. Ejemplo en PHP:

```
<?php header('Location: https://www.pagopar.com/pagos/ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn'); exit(); ?>
```
Página de Checkout de Pagopar:

![image](https://lh3.googleusercontent.com/CJuEC2Efs4jcErYNQIaLG75NuY9ynW1i511Mtjszkv31VTtqZGlMiZfg9JoYT86KWFYOghdaIt4iHjavX931o_7iRb-RVVymhosjJ9imKZZtEpv4c9QmL7PV8tqPOujlmlSBMKqZ)

¿Tenés permiso de redireccionamiento automático?
Esta caracteristica sólo la tienen algunos comercios previa solicitud y aprobación. Esto sirve para “saltar” la pantalla de Pagopar implementando los medios de pagos en el sitio del comercio, de tal forma, que el cliente final selecciona el medio de pago en el sitio de comercio, le da “finalizar compra” y no verá la pantalla de Pagopar, simplemente verá la página del vPos para abonar con tarjeta de crédito (en caso que haya seleccionado tarjeta de crédito), y en caso de que haya seleccionado alguna boca de cobranza verá la pantalla de redireccionamiento del sitio del comercio, no así la de pagopar. Para indicar qué medio de pago seleccionó la persona, simplemente hay que agregar el parámetro al momento de redireccionar a la plataforma de Pagopar
```
https://www.pagopar.com/pagos/$hash?forma_pago=' + idFormaPago;
```
Lista de formas de pago

| **Identificador** | **Forma de Pago** | **URL Imagen** |
| --- | --- | --- |
| 9 | Bancard - Tarjetas de crédito/débito (Acepta Visa, Mastercard, American Express, Discover, Diners Club y Credifielco.) | [https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png](https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png) |
| 1 | Procard - Tarjetas de crédito/débito(Acepta Visa, Mastercard, Credicard y Unica) | [https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png](https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png) |
| 2 | Aqui Pago | [https://cdn.pagopar.com/assets/images/pago-aquipago.png](https://cdn.pagopar.com/assets/images/pago-aquipago.png) |
| 3 | Pago Express | [https://cdn.pagopar.com/assets/images/pago-pagoexpress.png](https://cdn.pagopar.com/assets/images/pago-pagoexpress.png) |
| 4 | Practipago | [https://cdn.pagopar.com/assets/images/pago-practipago.png](https://cdn.pagopar.com/assets/images/pago-practipago.png) |
| 10 | Tigo Money | [https://cdn.pagopar.com/assets/images/pago-tigo-money.png](https://cdn.pagopar.com/assets/images/pago-tigo-money.png) |
| 11 | Transferencia Bancaria | [https://pago.pagopar.com/assets/images/metodos-pago/pago-manual.png](https://pago.pagopar.com/assets/images/metodos-pago/pago-manual.png) |
| 12 | Billetera Personal | [https://cdn.pagopar.com/assets/images/pago-billetera-personal.png](https://cdn.pagopar.com/assets/images/pago-billetera-personal.png) |
| 13 | Pago Móvil | [https://cdn.pagopar.com/assets/images/pago-infonet-pago-movil.png](https://cdn.pagopar.com/assets/images/pago-infonet-pago-movil.png) |
| 15 | Infonet Cobranzas | [https://cdn.pagopar.com/assets/images/pago-infonet.png](https://cdn.pagopar.com/assets/images/pago-infonet.png) |
| 18 | Zimple | [https://cdn.pagopar.com/assets/images/pago-zimple.png](https://cdn.pagopar.com/assets/images/pago-zimple.png) |
| 20 | Wally | [https://cdn.pagopar.com/assets/images/wally.png](https://cdn.pagopar.com/assets/images/wally.png) |
| 22 | Wepa | [https://cdn.pagopar.com/assets/images/wepa.png](https://cdn.pagopar.com/assets/images/wepa.png) |
| 23 | Giros Claro | [https://cdn.pagopar.com/assets/images/logos_Giros_Claro.png](https://cdn.pagopar.com/assets/images/logos_Giros_Claro.png) |
| 24 | Pago QR | [https://cdn.pagopar.com/assets/images/pago-qr-app.png](https://cdn.pagopar.com/assets/images/pago-qr-app.png) |
| 25 | PIX | [https://cdn.pagopar.com/assets/images/pago-pix-beeteller.png](https://cdn.pagopar.com/assets/images/pago-pix-beeteller.png) |
Lista de formas de pago vía WS
Token para este endpoint se genera:

```
sha1(Private_key + “FORMA-PAGO”)
```
En PHP: sha1($datos['comercio_token_privado'] . “FORMA-PAGO”) URL: [https://api.pagopar.com/api/forma-pago/1.1/traer/](https://api.pagopar.com/api/forma-pago/1.1/traer/)Método: POST Datos de ejemplo que el comercio enviará a Pagopar:Contenido:

```
{
"token": "56c042541873efa67da5fa085cab8c6b4b41ca66",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf"
}
```
Datos de ejemplo que Pagopar retornará para la petición anterior: Contenido:
```
{
"respuesta": true,
"resultado": [
{
"forma_pago": "25",
"titulo": "PIX",
"descripcion": "PIX vía QR",
"monto_minimo": "1000",
"porcentaje_comision": "3.00"
},
{
"forma_pago": "24",
"titulo": "Pago QR",
"descripcion": "Pagá con la app de tu banco, financiera o cooperativa a través de un QR",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "18",
"titulo": "Zimple",
"descripcion": "Utilice sus fondos de Zimple",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "9",
"titulo": "Tarjetas de crédito",
"descripcion": "Acepta Visa, Mastercard, American Express, Cabal, Panal, Discover, Diners Club.",
"monto_minimo": "1000",
"porcentaje_comision": "6.82",
"pagos_internacionales": false
},
{
"forma_pago": "10",
"titulo": "Tigo Money",
"descripcion": "Utilice sus fondos de Tigo Money",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "11",
"titulo": "Transferencia Bancaria",
"descripcion": "Pago con transferencias bancarias. Los pagos se procesan de 08:30 a 17:30 hs.",
"monto_minimo": "1000",
"porcentaje_comision": "3.30"
},
{
"forma_pago": "12",
"titulo": "Billetera Personal",
"descripcion": "Utilice sus fondos de Billetera Personal",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "13",
"titulo": "Pago Móvil",
"descripcion": "Usando la App Pago Móvil / www.infonet.com.py",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "20",
"titulo": "Wally",
"descripcion": "Utilice sus fondos de Wally",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "23",
"titulo": "Giros Claro",
"descripcion": "Utilice sus fondos de Billetera Claro",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "22",
"titulo": "Wepa",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "2",
"titulo": "Aqui Pago",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "3",
"titulo": "Pago Express",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "15",
"titulo": "Infonet Cobranzas",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
}
]
}
```

## Paso #3: Pagopar notifica al comercio sobre el pago

Descripción Pagopar realiza una petición a la URL de respuesta especificada en la opción “Integrar con mi sitio web” de Pagopar.com. En este endpoint, el comercio debe poner como “pagado” un pedido específico en su sistema, por tanto, este punto es crítico, ya que si alguna persona supiera la URL de Respuesta, conociendo el API y el funcionamiento del mismo, podría poner como pagado en el sistema del comercio ciertos pedidos arbitrariamente. Para evitar esto, es extrictamente necesario hacer una validación del token antes de actualizar el estado del pedido a Pagado. Con esto se evita lo anteriormente mencionado, ya que para generar el token se utiliza la clave privada que nunca debe ser compartida ni expuesta. El comercio debe retornar Código 200, en caso de que el comercio no retorne dicho código de estado, ya sea por un problema de conectividad, servidor caído o similar, Pagopar volverá a avisar sobre el pago cada 10 minutos hasta obtener la respuesta correcta. Esta notificación puede demorar hasta 2 minutos en realizarse, para ver el estado real del pedido debe consultar al endpoint especificado en el [Paso #4](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos#Paso_4_Pagopar_redirecciona_a_la_pgina_del_resultado_de_pago_del_Comercio).Observación El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com El Token en este punto se genera de la siguiente forma: sha1(private_key + hash_pedido) URL: [https://api.misitio.com/pagopar/respuesta/](https://api.misitio.com/pagopar/respuesta/) Método: POST Datos de ejemplo que Pagopar enviaría al Comercio en caso de pedido pagado: Contenido:

```
{
"resultado": [
{
"pagado": true,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": "2023-06-07 09:11:49.52895",
"monto": "100000.00",
"fecha_maxima_pago": "2023-06-14 09:11:32",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
],
"respuesta": true
}
```
Datos de ejemplo que el Comercio debe responder a Pagopar en caso de pedido pagado: Contenido:
```
[
{
"pagado": true,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": "2023-06-07 09:11:49.52895",
"monto": "100000.00",
"fecha_maxima_pago": "2023-06-14 09:11:32",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
]
```
Datos de ejemplo que Pagopar enviaría al Comercio en caso de reversión: Contenido:
```
{
"resultado": [
{
"pagado": false,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-04 23:40:36",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
],
"respuesta": true
}
```
Datos de ejemplo que el Comercio debe responder a Pagopar en caso de pedido reversado: Contenido:

```
[
{
"pagado": false,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-04 23:40:36",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
]
```
Datos de ejemplo que Pagopar enviaría al Comercio en caso de pedido confirmado (pendiente de pago) para reversión: Contenido:
```
{
"resultado": [
{
"pagado": false,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Pagoexpress",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-04 23:40:36",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "3",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
],
"respuesta": true
}
```

> ![Idea](https://static.zohocdn.com/zoho-desk-editor/static/images/lights.png)A nivel de código: Recomendamos que el comercio retorne directamente el contenido del resultado del JSON enviado por Pagopar, de este modo se evita armar el JSON manualmente optimizando el código y el funcionamiento (se evitará hacer ajustes adicionales al armado del JSON en caso de que hayan actualizaciones en la estructura del JSON enviado por Pagopar).

> ![Notes](https://img.zohostatic.com/zde/static/images/file.png)Obs.: Estas notificaciones de pago son realizadas únicamente cuando se hace el pago del pedido y se hacen conforme al estado de la transacción (pagado/reversado).

Ejemplo de la validación del Token en Woocommerce/PHP: Contenido:

```
<?php $rawInput = file_get_contents('php://input');
```

```
$json_pagopar = json_decode($rawInput, true);
```

```
global $wpdb;
```

```
#Obtenemos el ID de Pedido
```

```
$order_db = $wpdb->get_results($wpdb->prepare( "SELECT id FROM wp_transactions_pagopar WHERE hash = %s ORDER BY id DESC LIMIT 1", $json_pagopar['resultado'][0]['hash_pedido']));
```

```
#Obtenemos key privado
```

```
$db = new DBPagopar(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, "wp_transactions_pagopar");
```

```
$pedidoPagopar = new Pagopar(null, $db, $origin_pagopar);
```

```
$payments = WC()->payment_gateways->payment_gateways();
```

```
# Si coinciden los token, esta validación es extrictamente obligatoria para evitar el uso malisioso de este endpoint
```

```
if (sha1($payments['pagopar']->settings['private_key'] . $json_pagopar['resultado'][0]['hash_pedido']) === $json_pagopar['resultado'][0]['token']) {
```

```
# Marcamos como pagado en caso de que ya se haya pagado
```

```
if (isset($order_db[0]->id)) {
```

```
if ($json_pagopar['resultado'][0]['pagado'] === true) {
```

```
$order_id = $order_db[0]->id;
```

```
global $woocommerce;
```

```
$customer_order = new WC_Order((int) $order_id);
```

```
// Marcamos el pedido como Pagado
```

```
$customer_order->payment_complete();
```

```
$customer_order->update_status('completed', 'Pedido Completado/Pagado.');
```

```
} elseif ($json_pagopar['resultado'][0]['pagado'] === false) {
```

```
// Marcamos el pedido como Pendiente
```

```
}
```

```
}
```

```
} else {
```

```
echo 'Token no coincide';
```

```
return '';
```

```
}
```

```
echo json_encode($json_pagopar['resultado']);
```

```
?>
```

> ![Warning](https://img.zohostatic.com/zde/static/images/caution.png)Es sumamente importante hacer el control de que el token que envía pagopar es igual al token que genera el comercio, para evitar que personas que puedan conocer su URL de respuesta pueda hacer peticiones e impactar en el estado de sus pedidos, ejemplo, marcando como Pagado.

## Paso #4: Pagopar redirecciona a la página del resultado de pago del Comercio

Descripción Pagopar redirecciona a la página de resultado especificada en la opción “Integrar con mi sitio web” de Pagopar.com, con el hash de pedido. En ese momento, el Comercio realiza una petición a Pagopar para saber el estado de dicho pedido en tiempo real del pedido, y de acuerdo a eso le muestra el mensaje de Pagado/Error al pagar/Pendiente de Pago. Observación El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CONSULTA") URL de ejemplo a la que Pagopar redireccionará: https:// [www.misitio.com/pagopar/resultado/](http://www.misitio.com/pagopar/resultado/) Método: GET URL a la que el Comercio hará la petición: [https://api.pagopar.com/api/pedidos/1.1/traer](https://api.pagopar.com/api/pedidos/1.1/traer)Método: POST Datos de ejemplo que el comercio enviará a Pagopar:Contenido
```
{
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"token": "4f10caab2c4b757b37786ded541732f314166186",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf"
}
```
Datos de ejemplo que Pagopar retornará para la petición anterior:Contenido:
```
{
"respuesta": true,
"resultado": [
{
"pagado": false,
"forma_pago": "Pago Express",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-05 02:09:37",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",      "numero_pedido": "1750",
"cancelado": true,
"forma_pago_identificador": "3",
"token": "4f10caab2c4b757b37786ded541732f314166186",
"mensaje_resultado_pago": {
"titulo": "Pedido pendiente de pago",
"descripcion": "<ul><li>  Eligió pagar con Pago Express, recuerde que tiene hasta las
```

```
02:09:37 del 05/01/2018 para pagar.</li><li>  Debe ir a boca de cobranza de Pago Express,
```

```
decir que quiere pagar el comercio <strong>Pagopar</strong>, mencionando su cédula <strong>
```

```
0</strong> o número de pedido <strong>1.750</strong>.</li></ul>"
}
}
]
}
```

![Pagina de redireccionamiento](https://lh4.googleusercontent.com/sSlofPyZi9B16cucD6PMSpGG0ZZ18BXWHs4IFa32_Tl6idxDvMu7QHZOUBabhFbc8_IUUZ69GBBDk5e-6B9kOU2Ld9YFZM0b3cLTpP76e0SAb98M_ca_Jiebt_U_fi-k1sSoQYDY)

Pagina de redireccionamiento

> ![Info](https://img.zohostatic.com/zde/static/images/info.png)Posterior a finalizar los pasos de esta documentación solo faltaría hacer [el pase a producción](https://soporte.pagopar.com/portal/es/kb/articles/entornos-pase-a-producci%C3%B3n) .

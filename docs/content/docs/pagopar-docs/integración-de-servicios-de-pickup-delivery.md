# Integración de Servicios de pickup/delivery

- Source: https://soporte.pagopar.com/portal/es/kb/articles/integraci%C3%B3n-de-servicios-de-pickup-delivery
- Article ID: 387583000009909007
- Created: 2022-01-07T14:16:12.000Z
- Updated: 2024-08-08T15:51:06.000Z
- Tags: delivery, aex, courier, mobi, entrega

## Summary

Pasos para Agregar soporte de servicio de pickup/delivery Flujo normal de Paso #1: Obtener lista de ciudades Paso #2: Obtener lista de categorías Pagopar (opcional) Paso #3: Calcular flete / costo de envío Paso #4: Seleccionar método de envio Paso ...

## Content

## Pasos para Agregar soporte de servicio de pickup/delivery

## Flujo normal de

1. Paso #1: Obtener lista de ciudades
2. Paso #2: Obtener lista de categorías Pagopar (opcional)
3. Paso #3: Calcular flete / costo de envío
4. Paso #4: Seleccionar método de envio
5. Paso #5: Crear el pedido

## Paso #1: Obtener lista de ciudades

## Descripción

El comercio obtiene las ciudades disponibles a para el pickup y entrega ofrecidos por las emrpesas de delivery asociadas a Pagopar, por el momento AEX y Mobi.       Observación:

1. El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com
2. El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CIUDADES")

URL: [https://api.pagopar.com/api/ciudades/1.1/traer](https://api.pagopar.com/api/ciudades/1.1/traer)   Método: POST       Datos de ejemplo que el Comercio enviaría a Pagopar:   Contenido
```
{
"token": "3821d00d4b9dc48706b145d503f91fd2de2112a5",
"token_publico": "e65486d288714ab17e64c8c7febe3851"
}
```
Datos de ejemplo que Pagopar retornaría en caso de éxito:
```
{
"respuesta": true,
"resultado": [
{
"ciudad": "1",
"descripcion": "Asuncion"
},
{
"ciudad": "7",
"descripcion": "Ñemby"
},
{
"ciudad": "4",
"descripcion": "San Lorenzo"
},
{
"ciudad": "202",
"descripcion": "Villarrica"
}
]
}
```
Datos de ejemplo que Pagopar retornaría en caso de error:
```
{
"respuesta": false,
"resultado": "Token no corresponde."
}
```

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png) Obs: En caso que su comercio requiera listar las ciudades con sus respectivos barrios, puede utilizar el endpoint de [Listar Ciudades con Barrios.](https://soporte.pagopar.com/portal/es/kb/articles/listar-ciudades-con-barrios)

## Paso #2: Obtener lista de categorías Pagopar (opcional)

Descripción   Para determinar el costo que tendrá un envío se necesitan saber la ciudad de origen y destino, peso y dimensiones del producto (alto, largo y ancho). La categoría Pagopar se creó para los comercios que no cuenten con el peso y dimensiones de sus productos. Ejemplo, consumiendo el siguiente endpoint verá que la categoría "Notebooks 15 pulgadas" corresponde al ID 3820, entonces enviando ese ID usted indica dicha categoría sin necesidad de tener los datos de peso y dimensiones de su producto. En caso de tener las dimensiones exactas de su productos, recomendamos usar estas, ya que las categorías se basan en tamaños promedios que podrían ser superior al tamaño de su producto real, lo cual puede hacer que el envío cueste un poco más caro en el caso que se compre más de un artículo.      Observación:

1. El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com
2. El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CATEGORIAS")

URL: [https://api.pagopar.com/api/categorias/2.0/traer](https://api.pagopar.com/api/categorias/2.0/traer)   Método: POST      Datos de ejemplo que el Comercio enviaría a Pagopar:   Contenido
```
{
"token_publico": "3821d00d4b9dc48706b145d503f91fd2de2112a5",
"token": "508fc88ca15ff3d8668321d57831bcdc162e7161"
}
```
Datos de ejemplo que Pagopar retornaría en caso de éxito:
```
{
"respuesta": true,
"resultado": [
{
"categoria": "7587",
"descripcion": "Pistolas de Silicona",
"descripcion_completa": "Productos -> Librería y Mercería -> Pistolas de Silicona -> Mercería",
"medidas": true,
"producto_fisico": true,
"envio_aex": true
},
{
"categoria": "3820",
"descripcion": "15 Pulgadas",
"descripcion_completa": "Productos -> Electrónica -> Computación -> Notebooks y Accesorios -> 15 Pulgadas -> Notebooks",
"medidas": false,
"producto_fisico": true,
"envio_aex": true
},
{
"categoria": "4008",
"descripcion": "Auriculares",
"descripcion_completa": "Productos -> Electrónica -> Telefonía y Radiofrecuencia -> Radiofrecuencia -> Auriculares -> Accesorios",
"medidas": true,
"producto_fisico": true,
"envio_aex": true
}
]
}
```

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| categoría | ID de la categoría, a utilizarse al momento de calcular flete. | 3820 |
| descripcion | Nombre de la categoría. |  |
| descripcion_completa | Descripción que incluye todos los niveles de categorías superiores a la categoría en cuestion, escrito en forma de breadcrumb. | Productos -> Electrónica -> Computación -> Notebooks y Accesorios -> 15 Pulgadas -> Notebooks |
| medidas | Si se debe, además de especificar el id de categoría al momento de calcular flete, enviar las medidas del producto. Si la categoría dice true, significa que con el ID de la categoría es suficiente. | false |
| producto_fisico | Si se trata de una categoría física o no, esto debido a que podría ser una categoría asociada a un producto no fisico, como los servicios o productos virtuales. | true |
| envio_aex | Si es que la categoría soporta envío ofrecidos por Pagopar (AEX, Mobi) | true |
Datos de ejemplo que Pagopar retornaría en caso de error:
```
{
"respuesta": false,
"resultado": "Token no corresponde."
}
```

## Paso #3: Calcular flete / costo de envío

## Descripción

El comercio solicita a Pagopar los servicios disponibles por las distintas empresas de delivery, mostrando costos y tiempos de entrega. Envia los datos del pedido que aún no se generó, seguido de datos adicio         Observación

1. El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com
2. El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CALCULAR-FLETE")

URL: [https://api.pagopar.com/api/calcular-flete/2.0/traer](https://api.pagopar.com/api/calcular-flete/2.0/traer)   Método: POST         Datos de ejemplo que el comercio enviará a Pagopar:   Contenido:
```
{
"tipo_pedido": "VENTA-COMERCIO",
"fecha_maxima_pago": "2020-05-08 14:01:00",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"id_pedido_comercio": 1,
"monto_total": 910000,
"token": "4a79f883ba4d83759842f9a1432d4602ab1dedf6",
"descripcion_resumen": "",
"comprador": {
"nombre": "Rudolph Goetz",
"ciudad": "1",
"email": "fernandogoetz@gmail.com",
"telefono": "0972200046",
"tipo_documento": "CI",
"documento": "4247903",
"direccion": "Direccion por defecto del comprador para calcular envio",
"direccion_referencia": "",
"coordenadas": "-25.26080770331157, -57.51165674656511",
"ruc": null,
"razon_social": null
},
"compras_items": [
{
"nombre": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"cantidad": 1,
"precio_total": 10000,
"ciudad": "1",
"descripcion": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/10/5533fcbba66a44954e091b640296ae9cf147584a-300x300.jpg",
"peso": "",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 405,
"largo": "",
"ancho": "",
"alto": "",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local"
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 16,
"destino": "1",
"precio": 1500
}
]
},
"metodo_mobi": null
}
},
{
"nombre": "Iphone SE 2.0b",
"cantidad": 1,
"precio_total": 900000,
"ciudad": "1",
"descripcion": "Iphone SE 2.0b",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/09/8605bf8a5816a70b20181123221233000000-30-225x300.jpeg",
"peso": "",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 327,
"largo": "",
"ancho": "",
"alto": "",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local"
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 17,
"destino": "1",
"precio": 1500
}
]
},
"metodo_mobi": null
}
}
],
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb"
}
```

| **Contenido del json dato** |  |  |  |
| --- | --- | --- | --- |
| **Nombre del campo** | **Explicación** | **Dato ejemplo** |  |
| tipo_pedido | Tipo de venta: por defecto: VENTA-COMERCIO | VENTA-COMERCIO |  |
| fecha_maxima_pago | Fecha máxima disponible para el pago de un pedido | 2020-05-08 14:01:00 |  |
| public_key | Valor obtenido desde el panel de “Integrar con mi sitio web” | 98b96ce444802bf2657ab5c4ff2d4q14 |  |
| id_pedido_comercio | ID del pedido o transacción que utiliza en el sistema del comercio, en este endpoint lo más probable es que el valor sea vacío |  |  |
| monto_total | Monto final que el cliente debe abonar | 100000 |  |
| token | Valor alfanumérico generado: Sha1(Private_key + "CALCULAR-FLETE") | cebe636cA6b55ec95309060941f5a2c03be9b4b6 |  |
| descripcion_resumen | Resumen de lo que se está comprando | Celular Iphone 8 y mouse |  |
|  |  |  |  |
| comprador.nombre | Nombre del comprador | Rudolph Goetz |  |
| comprador.ciudad | Ciudad del comprador (Este id viene del #Paso 1) | 1 |  |
| comprador.email | Email del comprador | [fernando@pagopar.com](mailto:fernando@pagopar.com) |  |
| comprador.telefono | Teléfono del comrpador | 0972200046 |  |
| comprador.tipo_documento | Tipo de documento del comprador, por el momento siempre CI | CI |  |
| comprador.documento | Cédula de identidad del comprador | 1234567 |  |
| comprador.direccion | Dirección del comprador, a esta dirección se enviará el producto | Mariscal Lopez 12345 casi España |  |
| comprador.direccion_referencia | Referencia de la casa del comprador | Porton gris, muralla blanca |  |
| comprador.coordenadas | Coordenadas del la casa del comprador | -25.27595570421349, -57.548081202468374 |  |
| comprador.ruc | Ruc del comprador | Razón Social SA |  |
| comprador.razon_social | Razón social del comprador | 800123123-0 |  |
| **compras_items (Pueden ser varios elementos)** |  |  |  |
| compras_items.nombre | Nombre del producto | Celular Iphone 8 |  |
| compras_items.cantidad | Cantidad del producto comprado | 1 |  |
| compras_items.precio_total | monto total del item/cantidad comprado | 100000 |  |
| compras_items.ciudad | Ciudad donde se encuentra el producto | 1 |  |
| compras_items.descripcion | Descripción más larga de lo que se está comprando | Iphone 8 color blanco, 32gb de espacio |  |
| compras_items.url_imagen | URL de la imagen principal del producto | [https://cdn.pagopar.com/assets/images/logo-pagopar-400px.png](https://cdn.pagopar.com/assets/images/logo-pagopar-400px.png) |  |
| compras_items.vendedor_telefono | Teléfono del vendedor | 0972200046 |  |
| compras_items.vendedor_direccion | Dirección del vendedor. A esta dirección la empresa de delivery pasará a buscar el producto | España casi Mcal Lopez |  |
| compras_items.vendedor_direccion_referencia | Referencia de la dirección de donde se encuentra el producto | Portón gris |  |
| compras_items.vendedor_direccion_coordenadas | Coordenadas de donde se encuentra el producto |  |  |
| compras_items.public_key | Valor obtenido desde el panel de “Integrar con mi sitio web” |  |  |
| compras_items.id_producto | Identificdor único del producto del sitio del cliente | 171 |  |
| compras_items.categoria | ID de la categoria Pagopar obtenido en el paso anterior. Si tiene las medidas del producto use 979, si no quiere habilitar AEX, utilice 980. | 979 | **Datos necesarios para habilitar AEX** |
| compras_items.peso | Peso en kilogramos | 1 |  |
| compras_items.largo | Largo del producto en centímetros | 10 |  |
| compras_items.ancho | Ancho del producto en centímetros | 5 |  |
| compras_items.alto | Altodel producto en centímetros | 12 |  |
| **compras_items.opciones_envio** |  |  |  |
| compras_items.opciones_envio.metodo_retiro |  |  | **Datos si queremos habilitar “Retiro de sucursal”** |
| compras_items.opciones_envio.observacion | Comentario de dónde puede pasar a retirar el producto | Retiro en sucursal Matriz Mcal Lopez de 08:00 a 18:00 |  |
| **compras_items.opciones_envio.metodo_propio** |  |  |  |
| compras_items.opciones_envio.listado |  |  | **Datos necesarios para habilitar método de envio propio, se envía la lista de ciudades a las que podemos hacer delivery, el tiempo que nos comprometemos a entregar el producto y el costo adicional para el cliente.** |
Datos de ejemplo que Pagopar retornaría en caso de éxito:
```
{
"tipo_pedido": "VENTA-COMERCIO",
"fecha_maxima_pago": "2020-05-08 14:01:00",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"id_pedido_comercio": 1,
"monto_total": 910000,
"token": "4a79f883ba4d83759842f9a1432d4602ab1dedf6",
"descripcion_resumen": "",
"comprador": {
"nombre": "Rudolph Goetz",
"ciudad": "1",
"email": "fernandogoetz@gmail.com",
"telefono": "0972200046",
"tipo_documento": "CI",
"documento": "4247903",
"direccion": "Direccion por defecto del comprador para calcular envio",
"direccion_referencia": "",
"coordenadas": "-25.26080770331157, -57.51165674656511",
"ruc": null,
"razon_social": null
},
"compras_items": [
{
"nombre": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"cantidad": 1,
"precio_total": 10000,
"ciudad": "1",
"descripcion": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/10/5533fcbba66a44954e091b640296ae9cf147584a-300x300.jpg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 405,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 16,
"destino": "1",
"precio": 1500
}
],
"costo": 1500,
"tiempo_entrega": 16
},
"metodo_mobi": null,
"metodo_aex": {
"id": null,
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 22620,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": null,
"costo": null
}
}
},
{
"nombre": "Iphone SE 2.0b",
"cantidad": 1,
"precio_total": 900000,
"ciudad": "1",
"descripcion": "Iphone SE 2.0b",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/09/8605bf8a5816a70b20181123221233000000-30-225x300.jpeg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 327,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 17,
"destino": "1",
"precio": 1500
}
],
"costo": 0,
"tiempo_entrega": 17
},
"metodo_mobi": null,
"metodo_aex": {
"id": null,
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 22620,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": null,
"costo": 0
}
}
}
],
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb"
}
```
Observación:   Como puede observarse, Pagopar retorna lo mismo que se envió, pero además agrega un array, que pertenece a la opciones de couries disponibles (metodo_aex y metodo_mobi).
| **Nombre del campo** | **Explicación** | **Dato ejemplo** |
| --- | --- | --- |
| metodo_aex | Array con los datos de AEX |  |
| metodo_aex.id | En este endpoint siempre retornará el valor null, en caso de seleccionar alguna opción del método de envío AEX en el siguiente endpoint, se debe reemplazar por el id de dicha opción. | null |
| metodo_aex.opciones | Tiempo (en horas) en que AEX se compromete a entregar el producto, teniendo en cuenta el pickup y entrega de las ciudades definidas del comprador y vendedor. | 24 |
| metodo_aex.opciones.id | Identificador de la opción de envío de AEX, con este valor se define la opción seleccionada | 3-0 |
| metodo_aex.opciones.descripcion | Descripción del servicio. Para tener en cuenta AEX cuenta con varios tipos de servicios: Bumer: es un servicio express, se recoge el producto y se envía al destinatario de forma más rápida Standar: el servicio de recogida del producto y entrega del mismo en tiempo convencional. E-Lockers: es un servicio en el cual se retira el producto, y se lleva a unos casilleros estratégicamente ubicados, para que luego el comprador pase a retirar. | Envio Standard |
| metodo_aex.opciones.costo | Valor en guaraníes del costo que define AEX del producto con la categoría, peso y dimensiones especificadas, teniendo en cuenta la ciudad del pickup y entrega | 20756 |
| metodo_aex.opciones.tiempo_entrega | Tiempo (en horas) en que AEX se compromete a entregar el producto, teniendo en cuenta el pickup y entrega de las ciudades definidas del comprador y vendedor. | 24 |

| **Nombre del campo** | **Explicación** | **Dato ejemplo** |
| --- | --- | --- |
| metodo_mobi | Array con los datos de MOBI |  |
| metodo_mobi.id | En este endpoint siempre retornará el valor null, en caso de seleccionar alguna opción del método de envío MOBI en el siguiente endpoint, se debe reemplazar por el id de dicha opción. | null |
| metodo_mobi.opciones | Tiempo (en horas) en que MOBI se compromete a entregar el producto, teniendo en cuenta el pickup y entrega de las ciudades definidas del comprador y vendedor. | 24 |
| metodo_mobi.opciones.id | Identificador de la opción de envío de MOBI, con este valor se define la opción seleccionada | 3-0 |
| metodo_mobi.opciones.descripcion | Descripción del servicio. | Envio Standard |
| metodo_mobi.opciones.costo | Valor en guaraníes del costo que define MOBI del producto con la categoría, peso y dimensiones especificadas, teniendo en cuenta la ciudad del pickup y entrega | 15000 |
| metodo_mobi.opciones.tiempo_entrega | Tiempo (en horas) en que MOBI se compromete a entregar el producto, teniendo en cuenta el pickup y entrega de las ciudades definidas del comprador y vendedor. | 24 |

> ![image](https://img.zohostatic.com/zde/static/images/info.png) Para que retorne la opción de envío de MOBI, al momento de calcular el flete, se debe agregar en raíz del JSON el campo forma_pago y el campo comprador.coordenadas debe estar definido.

Datos de ejemplo que Pagopar retornaría en caso de error:
```
{
"respuesta": false,
"resultado": "Token no corresponde."
}
```

## Paso #4 - Elegir medio de envio

Descripción   El comercio elige un medio de envío, para ello, debe tomar la respuesta de Pagopar del paso anterior realizar los siguientes cambios:
| **Campo** | Acción a realizar | Ejemplo |
| --- | --- | --- |
| opciones_envio.metodo_aex.id | Se debe reemplazar por el ID de la opción seleccionada. En caso de ser una opción de MOBI la seleccionada el campo a definir el valor es opciones_envio.metodo_mobi.id | 3-0 |
| opciones_envio.costo_envio | Se debe sumar el valor de todas las opciones seleccionadas (en caso que haya más de un producto habrán varias opciones por seleccionar) al campo costo. | 22620 |
| opciones_envio.envio_seleccionado | Se debe especificar el método de envió seleccionado. Las opciones son: 1. aex 2. mobi 3. propio 4. retiro | aex |

## Observación 1. El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com 2. El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CALCULAR-FLETE") URL: [https://api.pagopar.com/api/calcular-flete/2.0/traer](https://api.pagopar.com/api/calcular-flete/2.0/traer) Método: POST Datos a enviar

```
{
"id_pedido_comercio": "Test-715",
"comprador": {
"nombre": "Rudolph Goetz",
"ciudad": "1",
"email": "fernandogoetz@gmail.com",
"telefono": "0972200046",
"tipo_documento": "CI",
"documento": "4247903",
"direccion": "direccion comprador 1234",
"direccion_referencia": null,
"coordenadas": null,
"ruc": "X",
"razon_social": "SIN NOMBRE"
},
"compras_items": [
{
"nombre": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"cantidad": 1,
"precio_total": 10000,
"ciudad": "1",
"descripcion": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/10/5533fcbba66a44954e091b640296ae9cf147584a-300x300.jpg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 405,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 16,
"destino": "1",
"precio": 1500
}
],
"costo": 1500,
"tiempo_entrega": 16
},
"metodo_mobi": null,
"metodo_aex": {
"id": "3-0",
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 22620,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": "24",
"costo": 22620
}
},
"costo_envio": 22620,
"envio_seleccionado": "aex",
"comercio_comision": 0
},
{
"nombre": "Iphone SE 2.0b",
"cantidad": 1,
"precio_total": 900000,
"ciudad": "1",
"descripcion": "Iphone SE 2.0b",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/09/8605bf8a5816a70b20181123221233000000-30-225x300.jpeg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 327,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 17,
"destino": "1",
"precio": 1500
}
],
"costo": 0,
"tiempo_entrega": 17
},
"metodo_mobi": null,
"metodo_aex": {
"id": "3-0",
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 22620,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": "24",
"costo": 22620
}
},
"costo_envio": 22620,
"envio_seleccionado": "aex",
"comercio_comision": 0
}
],
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"tipo_pedido": "VENTA-COMERCIO",
"fecha_maxima_pago": "2021-06-28 21:25:03",
"descripcion_resumen": "",
"monto_total": 932620,
"token": "4a79f883ba4d83759842f9a1432d4602ab1dedf6"
}
```
Datos de ejemplo que Pagopar retornaría en caso de éxito:
```
{
"id_pedido_comercio": "Test-715",
"comprador": {
"nombre": "Rudolph Goetz",
"ciudad": "1",
"email": "fernandogoetz@gmail.com",
"telefono": "0972200046",
"tipo_documento": "CI",
"documento": "4247903",
"direccion": "direccion comprador 1234",
"direccion_referencia": null,
"coordenadas": null,
"ruc": "X",
"razon_social": "SIN NOMBRE"
},
"compras_items": [
{
"nombre": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"cantidad": 1,
"precio_total": 10000,
"ciudad": "1",
"descripcion": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/10/5533fcbba66a44954e091b640296ae9cf147584a-300x300.jpg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 405,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 16,
"destino": "1",
"precio": 1500
}
],
"costo": 1500,
"tiempo_entrega": 16
},
"metodo_mobi": null,
"metodo_aex": {
"id": "3-0",
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 22620,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": "24",
"costo": 22620
}
},
"costo_envio": 22620,
"envio_seleccionado": "aex",
"comercio_comision": 0
},
{
"nombre": "Iphone SE 2.0b",
"cantidad": 1,
"precio_total": 900000,
"ciudad": "1",
"descripcion": "Iphone SE 2.0b",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/09/8605bf8a5816a70b20181123221233000000-30-225x300.jpeg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 327,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 17,
"destino": "1",
"precio": 1500
}
],
"costo": 0,
"tiempo_entrega": 17
},
"metodo_mobi": null,
"metodo_aex": {
"id": "3-0",
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 0,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": "24",
"costo": 0
}
},
"costo_envio": 0,
"envio_seleccionado": "aex",
"comercio_comision": 0
}
],
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"tipo_pedido": "VENTA-COMERCIO",
"fecha_maxima_pago": "2021-06-28 21:25:03",
"descripcion_resumen": "",
"monto_total": 932620,
"token": "4a79f883ba4d83759842f9a1432d4602ab1dedf6"
}
```

> ![image](https://img.zohostatic.com/zde/static/images/info.png) Al momento de elegir un medio de envío, tener en cuenta que en caso de tener más de un producto que tiene la misma dirección de pickup y además de elegir la misma opción de envío, se retornará el total del costo sumado en la primera opción de envío y luego el costo será 0 Gs. ya que agrupado en la primera opción, por tratarse de solo un servicio de pickup/envío y no dos por serparado.

## Paso #5 - Crear pedido

Se debe enviar la respuesta del paso anterior al endpoint de [Iniciar Transacción](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos#Paso_1_El_comercio_crea_un_pedido_en_Pagopar), reemplazando el valor de token por el token de generación de pedido, es decir: sha1($datos['comercio_token_privado'] . $idPedido . strval(floatval($j['monto_total'])));. Ya que el token se estaba generando hasta este punto, para el cálculo del flete y el token para crear el pedido se genera de forma distinta. Además, la URL a la que debe enviarse es la versión 2.0 del API, como especifica más adelante:       URL: [https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion](https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion)   Método: POST
```
{
"id_pedido_comercio": "Test-715",
"comprador": {
"nombre": "Rudolph Goetz",
"ciudad": "1",
"email": "fernandogoetz@gmail.com",
"telefono": "0972200046",
"tipo_documento": "CI",
"documento": "4247903",
"direccion": "direccion comprador 1234",
"direccion_referencia": null,
"coordenadas": null,
"ruc": "X",
"razon_social": "SIN NOMBRE"
},
"compras_items": [
{
"nombre": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"cantidad": 1,
"precio_total": 10000,
"ciudad": "1",
"descripcion": "Accesorios y repuestos para notebook nuevos y sin garantia 2",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/10/5533fcbba66a44954e091b640296ae9cf147584a-300x300.jpg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 405,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 16,
"destino": "1",
"precio": 1500
}
],
"costo": 1500,
"tiempo_entrega": 16
},
"metodo_mobi": null,
"metodo_aex": {
"id": "3-0",
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 22620,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": "24",
"costo": 22620
}
},
"costo_envio": 22620,
"envio_seleccionado": "aex",
"comercio_comision": 0
},
{
"nombre": "Iphone SE 2.0b",
"cantidad": 1,
"precio_total": 900000,
"ciudad": "1",
"descripcion": "Iphone SE 2.0b",
"url_imagen": "http://wordpress.local/wp-content/uploads/2020/09/8605bf8a5816a70b20181123221233000000-30-225x300.jpeg",
"peso": "3.00",
"vendedor_telefono": "12341234123",
"vendedor_direccion": "Rafael Barret 6581",
"vendedor_direccion_referencia": "Portón verde, muralla blanca",
"vendedor_direccion_coordenadas": "",
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"categoria": "1471",
"id_producto": 327,
"largo": "32.00",
"ancho": "23.00",
"alto": "16.00",
"opciones_envio": {
"metodo_retiro": {
"observacion": "Recogida local",
"costo": 0,
"tiempo_entrega": 0
},
"metodo_propio": {
"listado": [
{
"tiempo_entrega": 17,
"destino": "1",
"precio": 1500
}
],
"costo": 0,
"tiempo_entrega": 17
},
"metodo_mobi": null,
"metodo_aex": {
"id": "3-0",
"opciones": [
{
"id": "10-0",
"descripcion": "BUMER",
"costo": 26738,
"tiempo_entrega": "12"
},
{
"id": "3-0",
"descripcion": "Envio Standard",
"costo": 0,
"tiempo_entrega": "24"
},
{
"id": "5-17",
"descripcion": "Elocker - Super6 Mburucuyá (Santísima Trinidad y Julio Correa)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-13",
"descripcion": "Elocker - AEX Casa Central (Avda. España Nro. 436 casi Dr. Bestard)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-15",
"descripcion": "Elocker - Super6 Total (Colón y Carlos Antonio López)",
"costo": 16043,
"tiempo_entrega": "24"
},
{
"id": "5-14",
"descripcion": "Elocker - Super6 Villa Morra (Avda. Mariscal Lopez esq. Monseñor Bogarin)",
"costo": 16043,
"tiempo_entrega": "24"
}
],
"tiempo_entrega": "24",
"costo": 0
}
},
"costo_envio": 0,
"envio_seleccionado": "aex",
"comercio_comision": 0
}
],
"public_key": "ebcad4d95e229113a4e871cb491fbcfb",
"tipo_pedido": "VENTA-COMERCIO",
"fecha_maxima_pago": "2021-06-28 21:25:03",
"descripcion_resumen": "",
"monto_total": 932620,
"token": "021537ccae41532ecc9aa0d2a058180e283022d0"
}
```

> ![image](https://img.zohostatic.com/zde/static/images/info.png) Se obtendrá el hash de pedido en caso de éxito, el flujo de compra debe integrarse según la documentación de [integración de medios de pagos.](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos#Paso_1_El_comercio_crea_un_pedido_en_Pagopar).

---
title: "Integración de Servicios de pickup/delivery - Versión 1.1"
---

# Integración de Servicios de pickup/delivery - Versión 1.1

- Source: https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery
- Article ID: 387583000000629077
- Created: 2020-06-25T02:24:51.000Z
- Updated: 2022-01-10T03:01:46.000Z

## Summary

Hemos actualizado la versión de servicio de Pickup/delivery a la versión 2.0, el cual agrega más opciones de envío por parte de AEX, además de agregar un nuevo proveedor llamado MOBI. Recomendamos altamente integrar la versión 2.0 para mayor soporte ...

## Content

> ![image](https://img.zohostatic.com/zde/static/images/caution.png) Hemos actualizado la versión de servicio de [Pickup/delivery a la versión 2.0](https://soporte.pagopar.com/portal/es/kb/articles/integraci%C3%B3n-de-servicios-de-pickup-delivery), el cual agrega más opciones de envío por parte de AEX, además de agregar un nuevo proveedor llamado MOBI. Recomendamos altamente integrar la [versión 2.0](https://soporte.pagopar.com/portal/es/kb/articles/integraci%C3%B3n-de-servicios-de-pickup-delivery) para mayor soporte y funciones.

**Pasos para Agregar soporte de servicio de pickup/delivery**

**Flujo normal de compra**

Paso #1: Obtener lista de ciudades

Paso #2: Calcular flete

Paso #3: Seleccionar método de envio y crea el pedido

**Paso #1: Obtener lista de ciudades**

**Descripción** El comercio obtiene las ciudades disponibles a para el pickup y entrega ofrecidos por las emrpesas de delivery asociadas a Pagopar, por el momento AEX y Mobi.

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CIUDADES")

**URL:** https://api.pagopar.com/api/ciudades/1.1/traer

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

| { "token": "3821d00d4b9dc48706b145d503f91fd2de2112a5", "token_publico": "e65486d288714ab17e64c8c7febe3851" } |
| --- |

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

| { "respuesta": true, "resultado": [ { "ciudad": "1", "descripcion": "Asuncion" }, { "ciudad": "7", "descripcion": "Ñemby" }, { "ciudad": "4", "descripcion": "San Lorenzo" }, { "ciudad": "202", "descripcion": "Villarrica" } ] } |
| --- |

**Datos de ejemplo que Pagopar retornaría en caso de error:**

| { "respuesta": false, "resultado": "Token no corresponde." } |
| --- |

**Paso #2: Calcular flete**

**Descripción** El comercio solicita a Pagopar los servicios disponibles por las distintas empresas de delivery, mostrando costos y tiempos de entrega. Envia los datos del pedido que aún no se generó, seguido de datos adicio

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CALCULAR-FLETE")

**URL de ejemplo:** https://api.pagopar.com/api/calcular-flete/1.1/traer

**Método**: POST

**Datos de ejemplo que el comercio enviará a Pagopar:**

**Contenido**:

| { "token": "4a79f883ba4d83759842f9a1432d4602ab1dedf6", "token_publico": "ebcad4d95e229113a4e871cb491fbcfb", "dato": "{\\"tipo_pedido\\":\\"VENTA-COMERCIO\\",\\"fecha_maxima_pago\\":\\"2020-05-08 14:01:00\\",\\"public_key\\":\\"ebcad4d95e229113a4e871cb491fbcfb\\",\\"id_pedido_comercio\\":{},\\"monto_total\\":100000,\\"token\\":\\"21bbb36ebbae26c4a6a18acd2715cf299b8d0e3d\\",\\"descripcion_resumen\\":\\"\\",\\"comprador\\":{\\"nombre\\":\\"Rudolph Goetz\\",\\"ciudad\\":\\"1\\",\\"email\\":\\"fernandogoetz@gmail.com\\",\\"telefono\\":\\"0972200046\\",\\"tipo_documento\\":\\"CI\\",\\"documento\\":\\"4247903\\",\\"direccion\\":\\"Rafael Barret casi Conradi\\",\\"direccion_referencia\\":\\"\\",\\"coordenadas\\":\\"\\",\\"ruc\\":null,\\"razon_social\\":null},\\"compras_items\\":[{\\"nombre\\":\\"Producto fisico con delivery tercerizado\\",\\"cantidad\\":1,\\"precio_total\\":\\"100000\\",\\"ciudad\\":\\"1\\",\\"descripcion\\":\\"Producto fisico con delivery tercerizado\\",\\"url_imagen\\":false,\\"peso\\":\\"1\\",\\"vendedor_telefono\\":\\"0972200046\\",\\"vendedor_direccion\\":\\"Rafael Barret casi Conradi\\",\\"vendedor_direccion_referencia\\":\\"Port\\ón verde\\",\\"vendedor_direccion_coordenadas\\":\\"\\",\\"public_key\\":\\"ebcad4d95e229113a4e871cb491fbcfb\\",\\"categoria\\":\\"979\\",\\"id_producto\\":171,\\"largo\\":\\"1\\",\\"ancho\\":\\"1\\",\\"alto\\":\\"1\\",\\"opciones_envio\\":{\\"metodo_retiro\\":{\\"observacion\\":\\"Retiro en sucursal Matriz Mcal Lopez de 08:00 a 18:00\\"},\\"metodo_propio\\":{\\"listado\\":[{\\"tiempo_entrega\\":\\"24\\",\\"destino\\":\\"1\\",\\"precio\\":\\"0\\"},{\\"tiempo_entrega\\":\\"48\\",\\"destino\\":\\"5\\",\\"precio\\":\\"10000\\"}]}}}]}" } |
| --- |

**Explicación de datos enviados**

| **Nombre del campo** | **Explicación** | **Dato ejemplo** |
| --- | --- | --- |
| token | Valor alfanumérico generado: Sha1(Private_key + "CALCULAR-FLETE") | cebe636cA6b55ec95309060941f5a2c03be9b4b6 |
| token_publico | Valor obtenido desde el panel de “Integrar con mi sitio web” | 98b96ce444802bf2657ab5c4ff2d4q14 |
| dato | Json del Array con los datos del pedido que se va a generar | Ver tabla “Contenido de json dato” |

| **Contenido del json dato** |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| **Nombre del campo** | **Explicación** | **Dato ejemplo** |  |  |  |  |
| tipo_pedido | Tipo de venta: por defecto: VENTA-COMERCIO | VENTA-COMERCIO |  |  |  |  |
| fecha_maxima_pago | Fecha máxima disponible para el pago de un pedido | 2020-05-08 14:01:00 |  |  |  |  |
| public_key | Valor obtenido desde el panel de “Integrar con mi sitio web” | 98b96ce444802bf2657ab5c4ff2d4q14 |  |  |  |  |
| id_pedido_comercio | ID del pedido o transacción que utiliza en el sistema del comercio, en este endpoint lo más probable es que el valor sea vacío |  |  |  |  |  |
| monto_total | Monto final que el cliente debe abonar | 100000 |  |  |  |  |
| token | Valor alfanumérico generado: Sha1(Private_key + "CALCULAR-FLETE") | cebe636cA6b55ec95309060941f5a2c03be9b4b6 |  |  |  |  |
| descripcion_resumen | Resumen de lo que se está comprando | Celular Iphone 8 y mouse |  |  |  |  |
|  |  |  |  |  |  |  |
| comprador.nombre | Nombre del comprador | Rudolph Goetz |  |  |  |  |
| comprador.ciudad | Ciudad del comprador (Este id viene del #Paso 1) | 1 |  |  |  |  |
| comprador.email | Email del comprador | fernando@pagopar.com |  |  |  |  |
| comprador.telefono | Teléfono del comrpador | 0972200046 |  |  |  |  |
| comprador.tipo_documento | Tipo de documento del comprador, por el momento siempre CI | CI |  |  |  |  |
| comprador.documento | Cédula de identidad del comprador | 1234567 |  |  |  |  |
| comprador.direccion | Dirección del comprador, a esta dirección se enviará el producto | Mariscal Lopez 12345 casi España |  |  |  |  |
| comprador.direccion_referencia | Referencia de la casa del comprador | Porton gris, muralla blanca |  |  |  |  |
| comprador.coordenadas | Coordenadas del la casa del comprador | -25.27595570421349, -57.548081202468374 |  |  |  |  |
| comprador.ruc | Ruc del comprador | Razón Social SA |  |  |  |  |
| comprador.razon_social | Razón social del comprador | 800123123-0 |  |  |  |  |
| **compras_items (Pueden ser varios elementos)** |  |  |  |  |  |  |
| compras_items.nombre | Nombre del producto | Celular Iphone 8 |  |  |  |  |
| compras_items.cantidad | Cantidad del producto comprado | 1 |  |  |  |  |
| compras_items.precio_total | monto total del item/cantidad comprado | 100000 |  |  |  |  |
| compras_items.ciudad | Ciudad donde se encuentra el producto | 1 |  |  |  |  |
| compras_items.descripcion | Descripción más larga de lo que se está comprando | Iphone 8 color blanco, 32gb de espacio |  |  |  |  |
| compras_items.url_imagen | URL de la imagen principal del producto | https://cdn.pagopar.com/assets/images/logo-pagopar-400px.png |  |  |  |  |
| compras_items.vendedor_telefono | Teléfono del vendedor | 0972200046 |  |  |  |  |
| compras_items.vendedor_direccion | Dirección del vendedor. A esta dirección la empresa de delivery pasará a buscar el producto | España casi Mcal Lopez |  |  |  |  |
| compras_items.vendedor_direccion_referencia | Referencia de la dirección de donde se encuentra el producto | Portón gris |  |  |  |  |
| compras_items.vendedor_direccion_coordenadas | Coordenadas de donde se encuentra el producto |  |  |  |  |  |
| compras_items.public_key | Valor obtenido desde el panel de “Integrar con mi sitio web” |  |  |  |  |  |
| compras_items.id_producto | Identificdor único del producto del sitio del cliente | 171 |  |  |  |  |
| compras_items.categoria | ID de la categoria. Consulte a [desarrollo@pagopar.com](mailto:desarrollo@pagopar.com) las categorias. Si tiene las medidas del producto use 979, si no quiere habilitar AEX, utilice 980. | 979 | **Datos necesarios para habilitar AEX** |  |  |  |
| compras_items.peso | Peso en kilogramos | 1 |  |  |  |  |
| compras_items.largo | Largo del producto en centímetros | 10 |  |  |  |  |
| compras_items.ancho | Ancho del producto en centímetros | 5 |  |  |  |  |
| compras_items.alto | Altodel producto en centímetros | 12 |  |  |  |  |
| **compras_items.opciones_envio** |  |  |  |  |  |  |
| compras_items.opciones_envio.metodo_retiro |  |  | **Datos si queremos habilitar “Retiro de sucursal”** |  |  |  |
| compras_items.opciones_envio.observacion | Comentario de dónde puede pasar a retirar el producto | Retiro en sucursal Matriz Mcal Lopez de 08:00 a 18:00 |  |  |  |  |
| **compras_items.opciones_envio.metodo_propio** |  |  |  |  |  |  |
| compras_items.opciones_envio.listado |  |  | Datos necesarios para habilitar método de envio propio, se envía la lista de ciudades a las que podemos hacer delivery, el tiempo que nos comprometemos a entregar el producto y el costo adicional para el cliente. |  |  |  |
| compras_items.opciones_envio.listado.tiempo_entrega | Tiempo de entrega | 24 |  |  |  |  |
| compras_items.opciones_envio.listado.destino | ID de la ciudad de dónde hay que entregar el producto | 1 |  |  |  |  |
| compras_items.opciones_envio.listado.destino.precio | Precio adicional que costará al cliente por hacer el delivery | 0 |  |  |  |  |
| compras_items.opciones_envio.listado.tiempo_entrega | (Item 2) Tiempo de entrega | 48 |  |  |  |  |
| compras_items.opciones_envio.listado.destino | (Item 2) ID de la ciudad de dónde hay que entregar el producto | 5 |  |  |  |  |
| compras_items.opciones_envio.listado.destino.precio | (Item 2 ) Precio adicional que costará al cliente por hacer el delivery | 10000 |  |  |  |  |

**Datos de ejemplo que Pagopar retornará para la petición anterior:**

**Contenido**:

| { "tipo_pedido": "VENTA-COMERCIO", "fecha_maxima_pago": "2020-05-08 14:01:00", "public_key": "ebcad4d95e229113a4e871cb491fbcfb", "id_pedido_comercio": [], "monto_total": 100000, "token": "21bbb36ebbae26c4a6a18acd2715cf299b8d0e3d", "descripcion_resumen": "", "comprador": { "nombre": "Rudolph Goetz", "ciudad": "1", "email": "fernandogoetz@gmail.com", "telefono": "0972200046", "tipo_documento": "CI", "documento": "4247903", "direccion": "Rafael Barret casi Conradi", "direccion_referencia": "", "coordenadas": "", "ruc": null, "razon_social": null }, "compras_items": [ { "nombre": "Producto fisico con delivery tercerizado", "cantidad": 1, "precio_total": "100000", "ciudad": "1", "descripcion": "Producto fisico con delivery tercerizado", "url_imagen": false, "peso": "1", "vendedor_telefono": "0972200046", "vendedor_direccion": "Rafael Barret casi Conradi", "vendedor_direccion_referencia": "Portón verde", "vendedor_direccion_coordenadas": "", "public_key": "ebcad4d95e229113a4e871cb491fbcfb", "categoria": "979", "id_producto": 171, "largo": "1", "ancho": "1", "alto": "1", "opciones_envio": { "metodo_retiro": { "observacion": "Retiro en sucursal Matriz Mcal Lopez de 08:00 a 18:00" }, "metodo_propio": { "listado": [ { "tiempo_entrega": "24", "destino": "1", "precio": "0" }, { "tiempo_entrega": "48", "destino": "5", "precio": "10000" } ], "costo": 0, "tiempo_entrega": "24" }, "metodo_aex": { "costo": 20756, "tiempo_entrega": "24" } }, "costo_envio": null } ] } |
| --- |

**Observación de la respuesta de Pagopar:**

Como se observa, Pagopar retorna lo mismo que se envió en el campo datos, en forma de JSON y con varios campos adicionales, como ser:

| **Nombre del campo** | **Explicación** | **Dato ejemplo** |  |  |
| --- | --- | --- | --- | --- |
| metodo_aex | Array con los datos de AEX |  |  |  |
| metodo_aex.costo | Valor en guaraníes del costo que define AEX del producto con la categoría, peso y dimensiones especificadas, teniendo en cuenta la ciudad del pickup y entrega | 20756 |  |  |
| metodo_aex.tiempo_entrega | Tiempo (en horas) en que AEX se compromete a entregar el producto, teniendo en cuenta el pickup y entrega de las ciudades definidas del comprador y vendedor. | 24 |  |  |
| **metodo.propio.listado** |  |  |  |  |
| costo | Agrega este campo porque debe enviarse al confirmar el pedido |  |  |  |
| tiempo_entrega | Agrega este campo porque debe enviarse al confirmar el pedido |  |  |  |
| **opciones_envio** |  |  |  |  |
| costo_envio | Agrega este campo porque debe enviarse al confirmar el pedido | null |  |  |

**Paso #3: Seleccionar método de envio y crear el pedido**

**Descripción** El comercio crea el pedido, en la misma petición se selecciona el método de envio preferido por el usuario

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

El Token en este punto se genera de la siguiente forma: Sha1(Private_key + "CALCULAR-FLETE")

**URL de ejemplo:** https://api.pagopar.com/api/calcular-flete/1.1/traer

**Método**: POST

**Datos de ejemplo que el comercio enviará a Pagopar:**

**Contenido**:

| { "tipo_pedido": "VENTA-COMERCIO", "fecha_maxima_pago": "2020-05-09 00:32:50", "public_key": "ebcad4d95e229113a4e871cb491fbcfb", "id_pedido_comercio": "173", "monto_total": 120756, "token": "3e0f874a21223163c650739ed83746a5d49c74eb", "descripcion_resumen": "", "comprador": { "nombre": "Rudolph Goetz", "ciudad": "1", "email": "fernandogoetz@gmail.com", "telefono": "0972200046", "tipo_documento": "CI", "documento": "4247903", "direccion": "Rafael Barret casi Conradi", "direccion_referencia": "", "coordenadas": "", "ruc": "X", "razon_social": "SIN NOMBRE" }, "compras_items": [ { "nombre": "Producto fisico con delivery tercerizado", "cantidad": 1, "precio_total": "100000", "ciudad": "1", "descripcion": "Producto fisico con delivery tercerizado", "url_imagen": "", "peso": "1", "vendedor_telefono": "0972200046", "vendedor_direccion": "Rafael Barret casi Conradi", "vendedor_direccion_referencia": "Portón verde", "vendedor_direccion_coordenadas": "", "public_key": "ebcad4d95e229113a4e871cb491fbcfb", "categoria": "979", "id_producto": 171, "largo": "1", "ancho": "1", "alto": "1", "opciones_envio": { "metodo_retiro": { "observacion": "Retiro en sucursal Matriz Mcal Lopez de 08:00 a 18:00" }, "metodo_propio": { "listado": [ { "tiempo_entrega": "24", "destino": "1", "precio": "0" }, { "tiempo_entrega": "48", "destino": "5", "precio": "10000" } ], "costo": 0, "tiempo_entrega": "24" }, "metodo_aex": { "costo": 20756, "tiempo_entrega": "24" } }, "costo_envio": 20756, "envio_seleccionado": "aex" } ] } |
| --- |

**Observación**

El JSON a enviar es el mismo json que retornó Pagopar en el punto anterior, con los siguientes campos adicionales

| **Nombre del campo** | **Explicación** | **Dato ejemplo** |
| --- | --- | --- |
| opciones_envio.costo_envio | Valor del costo de envio que fue seleccionado | 20756 |
| opciones_envio.envio_seleccionado | Tipo de envio seleccionado. Puede ser: aex, propio, o sucursal. | aex |
| dato | Json del Array con los datos del pedido que se va a generar | Ver tabla “Contenido de json dato” |

**Datos de ejemplo que Pagopar responderá al comercio:**

**Contenido**:

| { "respuesta": true, "resultado": [ { "data": "4336bf1810675feca2d2a5d226318d892363b1c97d6f865af15cff0a55ea1dbf" } ] } |
| --- |

**Observación** El dato resultado.data es el hash del pedido, esto significa que se creó correctamente el pedido. Desde este punto, debe seguir desde el**Paso #2** de la [documentación del flujo de pago.](https://docs.google.com/document/d/1mJ1Srp0MVMDY4JovE-qCahCumoJhAZw_0xPjFEK4wK8/edit)

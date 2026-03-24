# Sincronización de productos

- Source: https://soporte.pagopar.com/portal/es/kb/articles/sincronizaci%C3%B3n-de-productos
- Article ID: 387583000001224053
- Created: 2020-09-30T18:04:49.000Z
- Updated: 2022-04-06T18:14:02.000Z
- Tags: sincronizacion, api, productos

## Summary

Introducción En ciertos casos un comercio puede tener un sitio web con sus respectivos productos, y querrá que se sincronicen con los links de pago de Pagopar, de tal forma de evitar la doble carga de productos y sobre todo la doble administración de ...

## Content

## Introducción

En ciertos casos un comercio puede tener un sitio web con sus respectivos productos, y querrá que se sincronicen con los links de pago de Pagopar, de tal forma de evitar la doble carga de productos y sobre todo la doble administración de productos. Esta API nos permitirá sincronizar los productos, incluyendo el stock. La sincronización se hace en un sentido bidireccional y puede soportar varios comercios. Por ejemplo: se publica un producto en el sitio web del comercio, este se creará en Pagopar, y a su vez también en un marketplace donde el comercio esté registrado. Si se realiza una actualización de dicho producto en el marketplace, esto se reflejará en Pagopar y a su vez en el sitio del comercio.

## Circuito de Sincronización

## ![Circuito de sincronización de productos - Pagopar](https://desk.zoho.com/DocsDisplay?zgId=687739706&mode=inline&blockId=cpuhw83d4fb2823274869b432c0eda3d9fb36)

## Funciones a desarrollar

1. Enviar datos de producto
2. Recibir cambio de producto
3. Recibir cambio de stock

### Enviar datos de un producto a Pagopar

Descripción: Se crea o edita un producto en Pagopar.   URL para crear un producto: [https://api.pagopar.com/api/links-venta/1.1/agregar/](https://api.pagopar.com/api/links-venta/1.1/agregar/)   URL para editar un producto: [https://api.pagopar.com/api/links-venta/1.1/editar/](https://api.pagopar.com/api/links-venta/1.1/editar/)   Método: POST      Datos a enviar:
```
{
"id_producto":"44",
"envio_aex":{
"activo":true,
"direccion_coordenadas":"",
"peso":1,
"largo":1,
"ancho":1,
"alto":1,
"comentarioPickUp":"No funciona el timbre, favor llamar al llegar",
"direccion_retiro":null,
"direccion":"Rafael Barret 6581",
"direccion_ciudad":"1",
"hora_inicio":"09:00:00",
"hora_fin":"16:00:00",
"direccion_referencia":"Port\u00f3n verde, muralla blanca"
},
"envio_mobi": {
"horarios": [
{
"dias": [
"1",
"2",
"3",
"4",
"5"
],
"pickup_fin": "17:00",
"pickup_inicio": "09:00"
}
],
"titulo": "Horario ",
"activo": true,
"usuario_mobi": 302,
"direccion_retiro": null
},
"categoria":979,
"token_publico":"cc6f9a547fdc7930731dc475cc7513d9",
"token":"a24689e31175a5ce14c35438f71ae55b52cb3e69",
"link_publico":true,
"activo":true,
"link_venta":"",
"monto":"25000",
"titulo":"Lentes realidad virtual Google Cardboard 3D",
"descripcion":"Prueba aplicaciones para ver los v\u00eddeos del celular con efecto de pantalla gigante todo con privacidad total y comodidad Compatible con android e iOS. Recomendado smartphone de ultima generaci\u00f3n y p",
"cantidad":1,
"imagen":[
"http:\/\/128.199.11.19\/wp-content\/uploads\/2020\/09\/37a6259cc0c1dae299a7866489dff0bdwkpV9uqHWfRnIMG_20180809_111420-830_A-830_A-830_A-830_A-830_A-830_A.jpg",
"http:\/\/128.199.11.19\/wp-content\/uploads\/2020\/09\/37a6259cc0c1dae299a7866489dff0bdeBTIk71Fq8USIMG_20180809_111550-830_A-830_A-830_A-830_A-830_A-830_A.jpg",
"http:\/\/128.199.11.19\/wp-content\/uploads\/2020\/09\/37a6259cc0c1dae299a7866489dff0bdbk5GzmjYPl78IMG_20180809_111331-830_A-830_A-830_A-830_A-830_A-830_A.jpg",
"http:\/\/128.199.11.19\/wp-content\/uploads\/2020\/09\/37a6259cc0c1dae299a7866489dff0bdi0I8oka1yFgOIMG_20180809_111536-830_A-830_A-830_A-830_A-830_A-830_A.jpg",
"http:\/\/128.199.11.19\/wp-content\/uploads\/2020\/09\/publicacion-cc447af40420440962d42b827650568e8a33c63f8e8fb113f6b56874c979e0d2-757_A-830_A-830_A-830_A-830_A-830_A-830_A.jpg",
"http:\/\/128.199.11.19\/wp-content\/uploads\/2020\/09\/37a6259cc0c1dae299a7866489dff0bdQnL6KSvDOsEfgoogle-cardboard-3-830_A-830_A-830_A-830_A-830_A.jpg"
]
}
```

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token_publico | Clave pública obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | 224a987739b87f03b2d54d2c4bbc7334 |
| token | Se genera de la siguiente forma sha1(private_key + 'LINKS-VENTA') | ed2f6f55cdf0b03824b2de3ec81fdd97 |
| id_producto | Id del producto de nuestro sitio web | 5 |
| envio_aex.activo | Si se habilita AEX para el producto | true/false |
| envio_aex.direccion_coordenadas | Coordenadas de la dirección donde se encuentra el producto | -25.311976, -57.565545 |
| envio_aex.peso | Peso del producto (kg) | 1 |
| envio_aex.largo | Largo del producto (cm) | 1 |
| envio_aex.ancho | Ancho del producto (cm) | 1 |
| envio_aex.alto | Alto del producto (cm) | 1 |
| envio_aex.comentarioPickUp | Algún comentario adicional para el courier | Favor llamar al llegar, timbre no funciona |
| envio_aex.direccion_retiro | ID de la dirección de Pagopar | null por defecto |
| envio_aex.direccion | Calle de la dirección | Rafael Barret 6581 |
| envio_aex.direccion_ciudad | ID de la ciudad (Se obtiene el ID de la siguiente [documentación](https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery)) | 1 |
| envio_aex.hora_inicio | Hora en la cual está disponible para retirar el producto | 09:00:00 |
| envio_aex.hora_fin | Hora hasta la cual está disponible para retirar el producto | 16:00:00 |
| envio_aex.direccion_referencia | Referencia de la dirección para ayudar al courier identificar el lugar de retiro | Portón verde, muralla blanca |
| envio_mobi.horarios.[0].dias | Días de la semana disponible para entregar el courier el producto | Array("1", "2", "3", "4", "5") |
| envio_mobi.horarios.[0].pickup_fin | Hasta qué hora está disponible para entregar al courier el producto | 17:00 |
| envio_mobi.horarios.[0].pickup_inicio | Desde qué hora está disponible para entregar al courier el producto | 09:00 |
| envio_mobi.horarios.titulo | Título para identificar el horario | Horario |
| envio_mobi.horarios.activo | Si el courier Mobi está disponible | true/false |
| envio_mobi.horarios.usuario_mobi | Debe ser null al crear el producto, al editar el producto debe ser el valor enviado por Pagopar | null |
| envio_mobi.horarios.direccion_retiro | ID de dirección, puede estar seteado null si está seteado aex.direccion_retiro si se se está creando el producto, si se está editando, pasar el valor que Pagopar le enviará | null |
| categoria | ID de la categoría Pagopar (Se obtiene el ID de la siguiente [documentación](https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery)). Si va a especificar las medidas, se debe enviar 979. | 979 |
| link_publico | Si el producto está disponible para importar | true/false |
| activo | Si el producto esta habilitado o deshabilitado. Si no está habilitado no se visualizará ni se podrá comprar | true/false |
| link_venta | Link de pago generado, al crear el producto se envía vacío, al editar el link de venta que ha recibido, el cual es un dato numérico entero. |  |
| monto | Precio del producto, numérico. La divisa es Guaraníes | 25000 |
| titulo | Título del producto | Lentes realidad virtual Google Cardboard 3D |
| descripcion | Descripción del producto | Prueba aplicaciones para ver los vídeos del celular con efecto de pantalla gigante todo con privacidad total y comodidad Compatible con android e iOS. Recomendado smartphone de ultima generación |
| cantidad | Inventario/stock disponible para la venta | 1 |
| imagen | Imágenes del producto, este campo sólo se debe incluir en caso que haya un cambio de imagen (se agregan o editan), si no se modifican las imágenes del producto, este campo no debe ser incluido. | [https://mi-sitio-sincronizado.com.py/wp-content/uploads/2020/09/37a6259cc0c1dae299a7866489dff0bdwkpV9uqHWfRnIMG_20180809_111420-830_A-830_A-830_A-830_A-830_A-830_A.jpg](https://mi-sitio-sincronizado.com.py/wp-content/uploads/2020/09/37a6259cc0c1dae299a7866489dff0bdwkpV9uqHWfRnIMG_20180809_111420-830_A-830_A-830_A-830_A-830_A-830_A.jpg) |
Datos retornados por Pagopar
```
{
"respuesta":true,
"resultado":{
"url":"https:\/\/pago.pagopar.com\/bh1",
"id":"223",
"link_venta":"14869",
"resultado":"OK"
}
}
```

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| respuesta | Si se exportó correctamente el producto | true |
| resultado.url | URL de link de pago generado en Pagopar | [https://pago.pagopar.com/bh1](https://pago.pagopar.com/bh1) |
| resultado.id | ID del producto en el sitio del comercio | 223 |
| resultado.link_venta | ID del producto en Pagopar | 14869 |

> ![image](https://img.zohostatic.com/zde/static/images/file.png) En caso que no utilice algunos datos de envío como AEX; Mobi o Envio Propio, debe tener en cuenta que puede recibir estos datos de Pagopar, y por lo tanto, debe guardar y retornar lo recibido, sino al editar un producto y sincronizar se estaría reemplazando estos valores definidos por null y borrando dichos datos.

### Datos enviados por Pagopar para crear/editar un producto

Descripción: Pagopar realizará una petición a la siguiente URL para crear o editar producto en el sitio web del comercio.   URL para crear/editar un producto: Se define como la URL de respuesta (definido en Pagopar.com > Integrar con mi sitio web) concatenado por "?sincronización"   Ejemplo de URL: [https://www.sitio-web.com/confirm-url/?sincronizacion](https://www.sitio-web.com/confirm-url/?sincronizacion)   Método: POST      Datos a recibir
```
{
"token_publico":"7a97ba0babb6c621ddaf17a6a1c80ce3",
"token":"9096306e7d1168d323b9d688ec68604b68ecbda1",
"datos":[
{
"logs":"44830",
"datos":{
"alto":1,
"peso":1,
"ancho":1,
"largo":1,
"monto":100000,
"activo":true,
"imagen":[

],
"titulo":"Accesorios para linterna pechera Streamlight",
"usuario":{
"nombre":"Rudolph",
"apellido":"Goetz",
"email":"fernandogoetz@gmail.com",
"celular":"0972200046"
},
"cantidad":1,
"categoria":{
"categoria":979,
"descripcion":"Producto Gen\u00e9rico con AEX",
"medidas":false,
"producto_fisico":true,
"comercio":125073
},
"direccion":{
"direccion":"Rafael Barret 6581",
"observacion":"Port\u00f3n verde 4",
"latitud_longitud":"",
"ciudad":1,
"ciudad_descripcion":"Asuncion",
"direccion_retiro":48777,
"comentario_pickup":"No funciona el timbre, favor llamar al llegar",
"hora_inicio":"09:00:00",
"hora_fin":"16:00:00"
},
"envio_aex":true,
"vinculado":true,
"envio_mobi":{
"mobi_usuario":309,
"horarios":[
{
"dias":[
"1",
"2",
"3",
"4",
"5"
],
"pickup_fin":"16:00",
"pickup_inicio":"09:00"
}
],
"titulo":"Horario ",
"activo":true
},
"descripcion":"<p>Accesorios para Linterna \"pechera\" Streamlight Survivor.<\/p>",
"envio_propio":[
{
"descripcion":"Central",
"zona_envio":1258,
"ciudad":[
{
"descripcion":"Capiata",
"ciudad":9,
"costo":10000,
"horas_entrega":24
},
{
"descripcion":"Raul Pe\u00f1a",
"ciudad":87,
"costo":15000,
"horas_entrega":24
},
{
"descripcion":"Jose Fassardi",
"ciudad":140,
"costo":20000,
"horas_entrega":48
}
]
}
],
"retiro_local":true,
"observacion_retiro":"Sucursal Matriz"
},
"tipo_aviso":"3",
"fecha":"2020-10-27 21:05:49.93093",
"cantidad_venta":"0",
"token_publico":"7a97ba0babb6c621ddaf17a6a1c80ce3",
"link_venta":"14846"
}
]
}
```

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token_publico | Clave privada obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | 224a987739b87f03b2d54d2c4bbc7334 |
| token | Se genera de la siguiente forma sha1(private_key + 'LINKS-VENTA') | ed2f6f55cdf0b03824b2de3ec81fdd97 |
| datos |  |  |
| datos.[0].logs | ID de log en Pagopar, se recomienda guardar este valor para hacer seguimiento de los cambios que pueda recibir el sitio web generado por Pagopar | 44830 |
| datos[0].logs.datos.alto | Alto del producto (cm) | 1 |
| datos[0].logs.datos.peso | Peso del producto (kg) | 1 |
| datos[0].logs.datos.ancho | Ancho del producto (cm) | 1 |
| datos[0].logs.datos.largo | Largo del producto (cm) | 1 |
| datos[0].logs.datos.monto | Precio del producto, numérico. La divisa es Guaraníes | 25000 |
| datos[0].logs.datos.activo | Disponibilidad del producto, si está disponible para la venta. | true/false |
| datos[0].logs.datos.imagen | Array con la URL de las Imágenes del producto, este campo tendrá items sólo si hay que actualizar la lista de imágenes en el sitio web, sino se enviará vació. En caso que retorne el array de las URLs, el sitio debe copiar estas imágenes a su servidor. |  |
| datos[0].logs.datos.titulo | Título del producto | Lentes realidad virtual Google Cardboard 3D |
| datos[0].logs.datos.usuario | Datos del usuario dueño del comercio. Solo infomativo. |  |
| datos[0].logs.datos.cantidad | Inventario/stock disponible para la venta | 1 |
| datos[0].logs.datos.categoria.categoria | ID de la categoría Pagopar | 979 |
| datos[0].logs.datos.categoria.descripcion | Descripción de la categoría Pagopar | Producto Genérico con AEX |
| datos[0].logs.datos.categoria.medidas | Si la categoría necesita de todas formas medidas (alto, largo, ancho) y peso | true/false |
| datos[0].logs.datos.categoria.producto_fisico | Si la categoría corresponde a un producto físico (que soporta delivery) | true/false |
| datos[0].logs.datos.categoria.comercio | ID de Comercio Pagopar. Solo informativo. | 125073 |
| datos[0].logs.datos.direccion.direccion | Calle de la dirección | Rafael Barret 6581 |
| datos[0].logs.datos.direccion.observacion | Referencia de la dirección para ayudar al courier identificar el lugar de retiro o alguna observación | Portón verde 4 |
| datos[0].logs.datos.direccion.latitud_longitud | Coordenadas de la dirección donde se encuentra el producto | -25.311976, -57.565545 |
| datos[0].logs.datos.direccion.ciudad | ID de la ciudad (De Pagopar) | 1 |
| datos[0].logs.datos.direccion.ciudad_descripcion | Descripción de la ciudad | Asunción |
| datos[0].logs.datos.direccion.direccion_retiro | ID de la dirección de retiro (De Pagopar) | 48777 |
| datos[0].logs.datos.direccion.comentario_pickup | Algún comentario adicional para el courier | Favor llamar al llegar, timbre no funciona |
| datos[0].logs.datos.direccion.hora_inicio | Hora en la cual está disponible para retirar el producto | 09:00:00 |
| datos[0].logs.datos.direccion.hora_fin | Hora hasta la cual está disponible para retirar el producto | 16:00:00 |
| datos[0].logs.datos.envio_aex. | Si se habilita AEX para el producto | true/false |
| datos[0].logs.datos.vinculado | Si el comercio está vinculado. Uso solo informativo. | true/false |
| datos[0].logs.datos.envio_mobi.mobi_usuario | ID interno de Pagopar | 306 |
| datos[0].logs.datos.envio_mobi.horarios.[0].dias | Días de la semana disponible para entregar el courier el producto | Array("1", "2", "3", "4", "5") |
| datos[0].logs.datos.envio_mobi.[0].horarios.pickup_fin | Hasta qué hora está disponible para entregar al courier el producto | 17:00 |
| datos[0].logs.datos.envio_mobi.[0].horarios.pickup_inicio | Desde qué hora está disponible para entregar al courier el producto | 09:00 |
| datos[0].logs.datos.envio_mobi.titulo | Título para identificar el horario | Horario |
| datos[0].logs.datos.envio_mobi.activo | Si el courier Mobi está disponible | true/false |
| datos[0].logs.datos.descripcion | Descripción del producto | Prueba aplicaciones para ver los vídeos del celular con efecto de pantalla gigante todo con privacidad total y comodidad Compatible con android e iOS. Recomendado smartphone de ultima generación |
| datos[0].logs.datos.envio_propio.[0].descripcion | Nombre de la zona de cobertura de entrega de pedido a cargo del comercio. | Central |
| datos[0].logs.datos.envio_propio.[0].zona_envio | ID de la zona de envío en Pagopar | 1258 |
| datos[0].logs.datos.envio_propio.[0].ciudad.ciudad | Ciudad destino | 1 |
| datos[0].logs.datos.envio_propio.[0].ciudad.descripcion | Descripción de la ciudad destino | Asunción |
| datos[0].logs.datos.envio_propio.[0].ciudad.costo | Costo que se le cobrará al cliente por el delivery a la ciudad destino | 10000 |
| datos[0].logs.datos.envio_propio.[0].ciudad.horas_entrega | Tiempo (en horas) en el cual se compromete el comercio a entregar el producto en la ciudad especificada | 24 |
| datos[0].logs.datos.retiro_local | Si está habilitado retiro del local | true/false |
| datos[0].logs.datos.observacion_retiro | Alguna observación sobre la opción de "retiro del local", ejemplo, dirección y horario disponible para el retiro | Sucursal Matriz |
| datos[0].logs.tipo_aviso | Tipo de notificación que está enviado Pagopar. De acuerdo a este parámetro debe realizar la distinta tarea de actualización de datos. 1. Venta pedido Debe desencadenar descontar el stock 2. Pedido cancelado Debe desencadenaraumentar el stock 3. Modificación link de pago Debe desencadenar actualizar un producto 4. Nuevo link de pago. Debe desencadenar crear un nuevo producto | 2 |
| datos[0].logs.fecha. | Fecha generación de log de actualización | 2020-10-27 21:05:49.93093 |
| datos[0].logs.cantidad_venta | Cantidad de ventas totales (sincronizadas) | 0 |
| datos[0].logs.token_publico | Token público del comercio | 7a97ba0babb6c621ddaf17a6a1c80ce3 |
| datos[0].logs.link_venta | Link de pago generado, el cual es un dato numérico entero. Este ID es importante ya en otras palabras es el ID de producto en Pagopar, por tanto nos sirve para emparejar nuestro ID de producto con dicho ID. | 14846 |
Datos a responder
```
{
"resultado":[
{
"link_venta":"14846",
"logs":"44830",
"tipo_aviso":"3",
"id_producto":"29",
"respuesta":true
}
],
"respuesta":true
}
```

| Campos | Descripción | Ejemplo |
| --- | --- | --- |
| resultado.[0].link_venta | Se debe retornar el link de pago (link_venta) enviado por Pagopar |  |
| resultado.[0].logs | ID de log enviado por pagopar | 44830 |
| resultado.[0].tipo_aviso | Tipo de notificación, se debe retornar el mismo valor enviado por Pagopar | 3 |
| resultado.[0].id_producto | ID de producto del sitio web | 20 |
| resultado.[0].respuesta | Resultado de la actualización, si se realizó satisfactoriamente. | true/false |
| respuesta | Resultado en general de la petición en bloque, si se realizó satisfactoriamente. | true/false |

### Datos enviados por Pagopar cuando se debe actualizar el inventario

Descripción: Pagopar realizará una petición a la siguiente URL para actualizar el inventario del producto en el sitio del comercio, esta actualización se puede dar ya sea porque hubo un pedido confirmado o porque se liberó un pedido reservado.   URL para crear/editar un producto: Se define como la URL de respuesta (definido en Pagopar.com > Integrar con mi sitio web) concatenado por "?sincronización"   Ejemplo de URL: [https://www.sitio-web.com/confirm-url/?sincronizacion](https://www.sitio-web.com/confirm-url/?sincronizacion)   Método: POST
```
{
"token_publico":"7a97ba0babb6c621ddaf17a6a1c80ce3",
"token":"9096306e7d1168d323b9d688ec68604b68ecbda1",
"datos":[
{
"logs":"44840",
"datos":{
"cantidad":0
},
"tipo_aviso":"1",
"fecha":"2020-10-27 23:47:22.317092",
"cantidad_venta":"1",
"token_publico":"7a97ba0babb6c621ddaf17a6a1c80ce3",
"link_venta":"14846",
"imagenes":"[\"archivos\/imagenes\/5bb49b09bc36440043fb4688a5fe9fb9e7b971f7.jpg\",\"archivos\/imagenes\/f4655758adeeb961da336051853806d13b5e96a0.jpg\",\"archivos\/imagenes\/18bcb06cce8d5523d1dae299e25eada20449cad0.jpg\",\"archivos\/imagenes\/477a7c71490f2d8223af3141c6a174d14c9a5ec3.jpg\"]",
"comercio_padre_heredado":null,
"comercio":"125072"
}
]
}
```

| Campos | Descripción | Ejemplo |
| --- | --- | --- |
| token_publico | Clave privada obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | 7a97ba0babb6c621ddaf17a6a1c80ce3 |
| token | Se genera de la siguiente forma sha1(private_key) | 9096306e7d1168d323b9d688ec68604b68ecbda1 |
| datos[0].logs | ID de log en Pagopar, se recomienda guardar este valor para hacer seguimiento de los cambios que pueda recibir el sitio web generado por Pagopar | 44840 |
| datos[0].logs.datos.cantidad | Inventario actual | 0 |
| datos[0].logs.datos.tipo_aviso | Se especifica si el disparador es por una venta o una cancelación de pedido, de acuerdo a esto se puede sumar o restar el stock (cantidad_venta), o directamente actualizar el inventario al campo datos.cantidad. 1. Venta pedido Debe desencadenar descontar el stock 2. Pedido cancelado Debe desencadenaraumentar el stock | 1 |
| datos[0].logs.datos.fecha | Fecha generación de log de actualización | 2020-10-27 23:47:22.317092 |
| datos[0].logs.datos.cantidad_venta | Cantidad de la venta o cantidad de reposición segun el tipo_aviso | 1 |
| datos[0].logs.datos.token_publico | Clave privada obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | 7a97ba0babb6c621ddaf17a6a1c80ce3 |
| datos[0].logs.datos.link_venta | ID del producto en Pagopar | ``` 14846 ``` |
| datos[0].logs.datos.comercio_padre_heredado |  | null |
| datos[0].logs.datos.comercio | ID de Comercio Pagopar |  |
Datos a responder
```
{
"resultado":[
{
"link_venta":"14846",
"logs":"44840",
"tipo_aviso":"1",
"respuesta":true
}
],
"respuesta":true
}
```

| **Campos** | **Descripción** | **Ejemplo** |
| --- | --- | --- |
| resultado.[0].link_venta | Se debe retornar el link de pago (link_venta) enviado por Pagopar |  |
| resultado.[0].logs | ID de log enviado por pagopar | 44830 |
| resultado.[0].tipo_aviso | Tipo de notificación, se debe retornar el mismo valor enviado por Pagopar | 1 |
| resultado.[0].respuesta | Resultado de la actualización, si se realizó satisfactoriamente. | true/false |
| respuesta | Resultado en general de la petición en bloque, si se realizó satisfactoriamente. | true/false |

# Link de suscripción

- Source: https://soporte.pagopar.com/portal/es/kb/articles/link-suscripcion
- Article ID: 387583000028400003
- Created: 2024-03-20T12:42:10.000Z
- Updated: 2025-08-18T20:04:00.000Z
- Tags: suscripcion, link, link suscripcion

## Summary

El "Link de Suscripción" es una innovadora herramienta proporcionada por Pagopar, diseñada para simplificar el proceso de gestión de productos o servicios por parte de nuestros clientes, ya sean comercios o vendedores. Esta herramienta permite cargar ...

## Content

El "Link de Suscripción" es una innovadora herramienta proporcionada por Pagopar, diseñada para simplificar el proceso de gestión de productos o servicios por parte de nuestros clientes, ya sean comercios o vendedores. Esta herramienta permite cargar fácilmente los datos relevantes de los productos o servicios directamente desde la plataforma Pagopar, convirtiéndolos en enlaces de suscripción accesibles para los clientes finales.Con el "Link de Suscripción", los clientes de nuestros comercios o vendedores pueden suscribirse para realizar pagos de manera recurrente utilizando todos nuestros medios de pago disponibles. Estas suscripciones pueden configurarse con diferentes periodos de cobro, que pueden ser mensuales, quincenales o semanales, adaptándose así a las necesidades específicas de cada negocio.Además, se ofrece flexibilidad en cuanto a la duración de las suscripciones, que pueden tener una vigencia de 6 meses, 12 meses o incluso ser ilimitadas, brindando así una amplia gama de opciones para adaptarse a diversas estrategias comerciales.Configuración avanzadaPara recibir las notificaciones debes definir los siguientes datos en el apatado de 'Configuración avanzada'

![image](https://soporte.pagopar.com/galleryDocuments/edbsn926c105d13c9d39d085aae0a5d54eb98b06e4efd8beaa8b7e4db0066811f543a0b1247721a016ce4d762634e14899f82?inline=true)

Datos para configuración avanzada:
| **Campo** | Descripción |
| --- | --- |
| Url de callback | Dirección web a la que se notifica después de completar la acción específica(suscripción/pago/desuscripción) |
| Identificador en tu comercio | Identificador del link de suscripción que utiliza su comercio, se utiliza para identificar en tu sitio/aplicación el link de suscripción por el cual se está notificando |

> ![Warning](https://static.zohocdn.com/zoho-desk-editor/static/images/caution.png)Es de suma importancia que el sitio que usted especifique como 'Url de callback' retorne exactamente el mismo JSON que Pagopar le envía, de esta forma su comercio indica a Pagopar que recibió exitosamente la notificación, de lo contrario, si no notifica que la recibió exitosamente, Pagopar seguirá notificando hasta tener la respuesta esperada.

Datos de ejemplo que Pagopar enviará en caso de nueva suscripción:
```
{
"tipo_accion": "suscripcion",
"token": "e13bc8411fa2adc4d8cf6c14c2fdb66c718c6599",
"usuario": {
"token_identificador": "45e47cb0c497039fe80260eca471dc74b557e2d9",
"documento": "2209099",
"nombre": "Juan",
"apellido": "González",
"email": "mailcliente9@gmail.com",
"celular": "0985886259",
"razon_social": "Juan M. González",    "ruc": "2209099-9"
},
"suscripcion": {
"id": "5",
"identificador_comercio": "AAA001",
"fecha_suscripcion": "2023-09-19 16:40:42.142421",
"link_suscripcion": "2",
"titulo": "Servicio Suscripción Indefinida",
"monto": "55000",
"titulo_suscripcion": "Suscripción Indefinida",
"estado": "Pendiente de Pago",
"cantidad_debito": null,
"vigencia": "Ilimitado",
"periodicidad": "Mensual",
"identificador_forma_pago": "14",
"titulo_forma_pago": "Bancard - Catastrar Tarjeta",
"visitas": "10"
}
}
```
Especificación de datos:
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| tipo_accion | Indica la acción que se está notificando, puede ser pagado, suscripcion o desuscripcion | suscripcion |
| token | Se genera con el token privado del comercio concatenado al tipo de notificación de la siguiente forma: sha1(token_privado_comercio.suscripcion) | e13bc8411fa2adc4d8cf6c14c2fdb66c718c6599 |
| usuario.token_identificador | Token identificador del usuario | 45e47cb0c497039fe80260eca471dc74b557e2d9 |
| usuario.documento | Documento de identidad del usuario | 2209099 |
| usuario.nombre | Nombre del usuario | Juan |
| usuario.apellido | Apellido del usuario | González |
| usuario.email | Dirección de mail del usuario | [mailcliente9@gmail.com](mailto:neslip@gmail.com) |
| usuario.celular | Número de celular del usuario | 0985886259 |
| usuario.razon_social | Razón social del usuario | Juan M. González |
| usuario.ruc | RUC del usuario | 2209099-9 |
| suscripcion.id | Identificador del link de suscripción | 5 |
| suscripcion.identificador_comercio | Identificador del link de suscripción definida en el comercio | AAA001 |
| suscripcion.fecha_suscripcion | Fecha en la que el usuario se suscribió | 2023-09-19 16:40:42.142421 |
| suscripcion.link_suscripcion | Link de suscripción | 2 |
| suscripcion.titulo | Titulo vigente de la suscripción | Servicio Suscripción Indefinida |
| suscripcion.monto | Monto del link de suscripción | 55000 |
| suscripcion.titulo_suscripcion | Titulo histórico de la suscripción | Suscripción Indefinida |
| suscripcion.estado | Estado actual de la suscripción | Pendiente de Pago |
| suscripcion.cantidad_debito | Cantidad de débitos realizados de la sucripción realizadas al usuario | null |
| suscripcion.vigencia | Vigencia de la suscripción | Ilimitado |
| suscripcion.periodicidad | Periocidad de cobro de la suscripción | Mensual |
| suscripcion.identificador_forma_pago | Identificador de la forma de pago seleccionada por el usuario al momento de suscribirse | 14 |
| suscripcion.titulo_forma_pago | Descripción de la forma de pago seleccionada por el usuario al momento de suscribirse | Bancard - Catastrar Tarjeta |
| suscripcion.visitas | Cantidad de visitas de la suscripción | 10 |
Datos de ejemplo que Pagopar enviará en caso de nuevo pago:
```
{
"tipo_accion": "pagado",
"token": "192ce72393abc6e6a5eca96859bff3019a6e6009",
"usuario": {
"token_identificador": "45e47cb0c497039fe80260eca471dc74b557e2d9",    "documento": "2209099",
"nombre": "Juan",    "apellido": "González",    "email": "mailcliente9@gmail.com",    "celular": "0985886259",
"razon_social": "Juan M. González",    "ruc": "2209099-9"
},
"pago": {
"hash_pedido": "d585079c0cd77b885e115bf67d7d618fcdc66bab5fd815a0d03c063d784dacc9",
"comprobante_interno": "497294",
"fecha_pago": "2024-01-25 11:10:44.30565",
"identificador_forma_pago_transaccion": "14",
"titulo_forma_pago_transaccion": "Bancard - Catastrar Tarjeta"
},
"suscripcion": {
"id": "72",
"identificador_comercio": "OL1902",
"fecha_suscripcion": "2024-01-25 11:10:36.159187",
"link_suscripcion": "6",
"titulo": "Suscripcion Plan 2",
"monto": "1000",
"titulo_suscripcion": "Suscripcion Plan 2",
"estado": "Pagada",
"cantidad_debito": "6",
"vigencia": "6 Meses",
"periodicidad": "Mensual",
"identificador_forma_pago": "14",
"titulo_forma_pago": "Bancard - Catastrar Tarjeta",
"visitas": "6"
}
}
```
Especificación de datos:
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| tipo_accion | Indica la acción que se está notificando, puede ser pagado, suscripcion o desuscripcion | pagado |
| token | Se genera con el token privado del comercio concatenado al tipo de notificación de la siguiente forma: sha1(token_privado_comercio.tipo_accion) | 192ce72393abc6e6a5eca96859bff3019a6e6009 |
| usuario.token_identificador | Token identificador del usuario | 45e47cb0c497039fe80260eca471dc74b557e2d9 |
| usuario.documento | Documento de identidad del usuario | 2209099 |
| usuario.nombre | Nombre del usuario | Juan |
| usuario.apellido | Apellido del usuario | González |
| usuario.email | Dirección de mail del usuario | [mailcliente9@gmail.com](mailto:neslip@gmail.com) |
| usuario.celular | Número de celular del usuario | 0985886259 |
| usuario.razon_social | Razón social del usuario | Juan M. González |
| usuario.ruc | RUC del usuario | 2209099-9 |
| pago.hash_pedido | Hash identificador del pedido. Sólo aplica para la notificacion de pago(pagado) | d585079c0cd77b885e115bf67d7d618fcdc66bab5fd815a0d03c063d784dacc9 |
| pago.comprobante_interno | Número de comprobante del pago. Sólo aplica para la notificacion de pago(pagado) | 497294 |
| pago.fecha_pago | Fecha en la que se realizó el pago al link de suscripción. Sólo aplica para la notificacion de pago(pagado) | 2024-01-25 11:10:44.30565 |
| pago.identificador_forma_pago_transaccion | Identificador de la forma de pago utilizada para pagar el link de suscripción. Sólo aplica para la notificacion de pago(pagado) | 14 |
| pago.titulo_forma_pago_transaccion | Descripción de la forma de pago utilizada para pagar el link de suscripcón. Sólo aplica para la notificacion de pago(pagado) | Bancard - Catastrar Tarjeta |
| suscripcion.id | Identificador del link de suscripción | 72 |
| suscripcion.identificador_comercio | Identificador del link de suscripción definida en el comercio | OL1902 |
| suscripcion.fecha_suscripcion | Fecha en la que el usuario se suscribió | 2024-01-25 11:10:36.159187 |
| suscripcion.fecha_desuscripcion | Fecha en la que el usuario se desuscribió Sólo aplica para la notificacion de desuscripción(desuscripcion) | 2024-03-05 11:49:52.242181 |
| suscripcion.link_suscripcion | Link de suscripción | 6 |
| suscripcion.titulo | Titulo vigente de la suscripción | Suscripcion Plan 2 |
| suscripcion.monto | Monto del link de suscripción | 1000 |
| suscripcion.titulo_suscripcion | Titulo histórico de la suscripción | Suscripcion Plan 2 |
| suscripcion.estado | Estado actual de la suscripción | Pagada |
| suscripcion.cantidad_debito | Cantidad de débitos realizados de la sucripción realizadas al usuario | 6 |
| suscripcion.vigencia | Vigencia de la suscripción | 6 Meses |
| suscripcion.periodicidad | Periocidad de cobro de la suscripción | Mensual |
| suscripcion.identificador_forma_pago | Identificador de la forma de pago seleccionada por el usuario al momento de suscribirse | 14 |
| suscripcion.titulo_forma_pago | Descripción de la forma de pago seleccionada por el usuario al momento de suscribirse | Bancard - Catastrar Tarjeta |
| suscripcion.visitas | Cantidad de visitas de la suscripción | 6 |
Datos de ejemplo que Pagopar enviará en caso de nueva desuscripción:
```
{
"tipo_accion": "desuscripcion",
"token": "4aba0b7bb3da17797b15faea586c17e98c1a12a9",
"usuario": {
"token_identificador": "45e47cb0c497039fe80260eca471dc74b557e2d9",    "documento": "2209099",
"nombre": "Juan",    "apellido": "González",    "email": "mailcliente9@gmail.com",    "celular": "0985886259",
"razon_social": "Juan M. González",    "ruc": "2209099-9"
},
"suscripcion": {
"id": "56",
"identificador_comercio": "17",
"fecha_suscripcion": "2023-12-07 09:47:11.612073",
"fecha_desuscripcion": "2024-03-05 11:49:52.242181",
"link_suscripcion": "5",
"titulo": "Suscripcion Plan 1",
"monto": "1000",
"titulo_suscripcion": "Suscripcion Plan 1",
"estado": "Cancelada",
"cantidad_debito": "12",
"vigencia": "12 Meses",
"periodicidad": "Mensual",
"identificador_forma_pago": "14",
"titulo_forma_pago": "Bancard - Catastrar Tarjeta",
"visitas": "115"
}
}
```
Especificación de datos:
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| tipo_accion | Indica la acción que se está notificando, puede ser pagado, suscripcion o desuscripcion | desuscripcion |
| token | Se genera con el token privado del comercio concatenado al tipo de notificación de la siguiente forma: sha1(token_privado_comercio.suscripcion) | e13bc8411fa2adc4d8cf6c14c2fdb66c718c6599 |
| usuario.token_identificador | Token identificador del usuario | 45e47cb0c497039fe80260eca471dc74b557e2d9 |
| usuario.documento | Documento de identidad del usuario | 2209099 |
| usuario.nombre | Nombre del usuario | Juan |
| usuario.apellido | Apellido del usuario | González |
| usuario.email | Dirección de mail del usuario | [mailcliente9@gmail.com](mailto:neslip@gmail.com) |
| usuario.celular | Número de celular del usuario | 0985886259 |
| usuario.razon_social | Razón social del usuario | Juan M. González |
| usuario.ruc | RUC del usuario | 2209099-9 |
| suscripcion.id | Identificador del link de suscripción | 56 |
| suscripcion.identificador_comercio | Identificador del link de suscripción definida en el comercio | 17 |
| suscripcion.fecha_suscripcion | Fecha en la que el usuario se suscribió | 2023-12-07 09:47:11.612073 |
| suscripcion.fecha_desuscripcion | Fecha en la que el usuario se suscribió | 2024-03-05 11:49:52.242181 |
| suscripcion.link_suscripcion | Link de suscripción | 5 |
| suscripcion.titulo | Titulo vigente de la suscripción | Suscripcion Plan 1 |
| suscripcion.monto | Monto del link de suscripción | 1000 |
| suscripcion.titulo_suscripcion | Titulo histórico de la suscripción | Suscripcion Plan 1 |
| suscripcion.estado | Estado actual de la suscripción | Cancelada |
| suscripcion.cantidad_debito | Cantidad de débitos realizados de la sucripción realizadas al usuario | 12 |
| suscripcion.vigencia | Vigencia de la suscripción | 12 Meses |
| suscripcion.periodicidad | Periocidad de cobro de la suscripción | Mensual |
| suscripcion.identificador_forma_pago | Identificador de la forma de pago seleccionada por el usuario al momento de suscribirse | 14 |
| suscripcion.titulo_forma_pago | Descripción de la forma de pago seleccionada por el usuario al momento de suscribirse | Bancard - Catastrar Tarjeta |
| suscripcion.visitas | Cantidad de visitas de la suscripción | 115 |

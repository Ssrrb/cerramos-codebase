---
title: "Reversar un pedido pagado"
---

# Reversar un pedido pagado

- Source: https://soporte.pagopar.com/portal/es/kb/articles/reversar-un-pedido-pagado
- Article ID: 387583000000632015
- Created: 2020-07-05T16:41:44.000Z
- Updated: 2023-06-19T18:35:10.000Z

## Summary

La acción de reversar está disponible cuando el cliente pagó utilizando tarjeta a través de la procesadora Bancard, también en los medios de pago Zimple, Tigo Money, Giros Claro, Wally y Billetera Personal. Esta petición debe hacerse el mismo día del ...

## Content

La acción de reversar está disponible cuando el cliente pagó utilizando tarjeta a través de la procesadora Bancard, también en los medios de pago Zimple, Tigo Money, Giros Claro, Wally y Billetera Personal. Esta petición debe hacerse el mismo día del pago para que sea hecha la reversión. En caso que se realice el pedido de reversión al día siguiente o los siguientes días, el pedido de reversión se agendará. Es importante acotar que incluso si solicita la reversión en las últimas horas del día, este podría agendarse en lugar de aplicarse inmediatamente la reversión.

> ![image](https://img.zohostatic.com/zde/static/images/file.png) Si desea reversar un pedido pagado con algún medio de pago distinto a los mencionados anteriormente, puede enviar un e-mail a [reversiones@pagopar.com](mailto:reversiones@pagopar.com) solicitando la reversión del pedido específico.

URL: [https://api.pagopar.com/api/pedidos/1.1/reversar](https://api.pagopar.com/api/pedidos/1.1/reversar)   Método: POST        Generación de token
```
token: sha1(token_privado + 'PEDIDO-REVERSAR')
```
Datos a enviar

```
{
"hash_pedido": "7c07355e5a54d181cde995a8790ee9c7",
"token": "df1da6932deb72eca5828ac5641d3bf6",
"token_publico": "35a10eafefc6e8a22099450918383cd0"
}
```
Explicación de los campos
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| hash_pedido | Hash identificador del pedido | 7c07355e5a54d181cde995a8790ee9c7 |
| token | Se genera: sha1(token_privado + 'PEDIDO-REVERSAR') | df1da6932deb72eca5828ac5641d3bf6 |
| token_publico | Clave publica del comercio | 35a10eafefc6e8a22099450918383cd0 |
Datos de respuesta en caso de realizarse satisfactoriamente la reversión en tiempo real
```
{
"respuesta": true,
"resultado": [
{
"pedido": "2792947",
"hash": "63b42f5f77dba52d9ad9981a489643ecc46ae29676692277f4c28397c2616197",
"forma_pago": "14",
"transaccion": "2434418",
"estado_transaccion": "2",
"tiempo_reversion": "Inmediata",
"otros_datos": {
"json_respuesta": {
"status": "success",
"confirmation": {
"token": "d2126a0f6abb1a66d0a8f2546d19822d",
"shop_process_id": 2434418,
"response": "S",
"response_details": "Procesado Satisfactoriamente",
"amount": "38000.00",
"currency": "PYG",
"authorization_number": "791317",
"ticket_number": "2939784103",
"response_code": "00",
"response_description": "Transaccion aprobada",
"extended_response_description": null,
"security_information": {
"card_source": "L",
"customer_ip": "159.203.178.112",
"card_country": "PARAGUAY",
"version": "0.3",
"risk_index": 0
}
}
},
"fecha_respuesta": "2022-04-14T12:35:00",
"json_reversion": {
"status": "success",
"messages": [
{
"key": "RollbackSuccessful",
"dsc": "Transacción Aprobada",
"level": "info"
}
]
},
"fecha_reversion": "2022-04-14T12:55:00",
"estado_transaccion": 3,
"forma_pago": 14
},
"pagado": false
}
]
}
```

> ℹ️ Si respuesta es true y resultado.[0].tiempo_reversion = "Inmediata", significa que la reversión ha sido aplicada satisfactoriamente.

| **Campos** | **Descripción** | **Ejemplo** |
| --- | --- | --- |
| respuesta | Si es true, es porque se ejecutó el endpoint satisfactoriamente | true |
| resultado.pedido | Identificador de pedido generado por Pagopar y asociado al hash de pedido | 2792947 |
| resultado.hash | Hash identificador del pedido, generado por Pagopar | 63b42f5f77dba52d9ad9981a489643ecc46ae29676692277f4c28397c2616197 |
| resultado.forma_pago | 3 | 14 |
| resultado.transaccion | Identificador de transacción, de uso mayormente interno | 2434418 |
| resultado.estado_transaccion | Identificador del estado de pago, de uso interno | 2 |
| resultado.tiempo_reversion | "Inmediata" si se aplica la reversión inmediata. "Agendada" si se programa | Inmediata |
| resultado.otros_datos | Datos adicionales asociados al pedido, de uso mayormente interno | (Array variable) |
Datos de respuesta en caso de realizarse satisfactoriamente la reversión en tiempo real

```
{
"respuesta": true,
"resultado": [
{
"pedido": "2810362",
"hash": "d3f692c39c80dec9f416ebf2ea4dfc4a84a4cbca9d2e105f9d885397886bf5e5",
"forma_pago": "10",
"transaccion": "2451796",
"estado_transaccion": "2",
"tiempo_reversion": "Agendada"
}
]
```

> ℹ️ Si respuesta es true y resultado.[0].tiempo_reversion = "Agendada", significa que la reversión ha sido programada para aplicarse de forma manual.

Como en este caso la reversión es programada, probablemente necesitemos saber cuándo se aplica efectivamente. Para saber si la reversión fue aplicada, puede hacer la siguiente petición:      URL: [https://api.pagopar.com/api/pedidos/1.1/traer](https://api.pagopar.com/api/pedidos/1.1/traer)   Método: POST
```
{
"hash_pedido": "7c07355e5a54d181cde995a8790ee9c7",
"token": "e7007e9913d378805a6637ac91b4e394afb4fc06",
"token_publico": "35a10eafefc6e8a22099450918383cd0",
"datos_adicionales": true
}
```
Explicación de los campos
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| hash_pedido | Hash identificador del pedido | 7c07355e5a54d181cde995a8790ee9c7 |
| token | Se genera: sha1(token_privado + 'CONSULTA') | df1da6932deb72eca5828ac5641d3bf6 |
| token_publico | Clave publica del comercio | 35a10eafefc6e8a22099450918383cd0 |
| datos_adicionales | Si se quieren obtener datos secundarios/adicionales sobre el pedido, para este caso, se debe enviar true | true |
Datos de respuesta de Pagopar:
```
{
"respuesta": true,
"resultado": [
{
"pagado": false,
"forma_pago": "Bancard - Catastrar Tarjeta",
"fecha_pago": null,
"monto": "38000.00",
"fecha_maxima_pago": "2022-04-16 12:39:58",
"hash_pedido": "63b42f5f77dba52d9ad9981a489643ecc46ae29676692277f4c28397c2616197",
"numero_pedido": "2792947",
"cancelado": true,
"forma_pago_identificador": "14",
"token": "9f7022a58d99a6703ca2ef5e18543e054293c65b",
"datos_adicionales": [
{
"json_respuesta": {
"status": "success",
"confirmation": {
"token": "d2126a0f6abb1a66d0a8f2546d19822d",
"shop_process_id": 2434418,
"response": "S",
"response_details": "Procesado Satisfactoriamente",
"amount": "38000.00",
"currency": "PYG",
"authorization_number": "791317",
"ticket_number": "2939784103",
"response_code": "00",
"response_description": "Transaccion aprobada",
"extended_response_description": null,
"security_information": {
"card_source": "L",
"customer_ip": "159.203.178.112",
"card_country": "PARAGUAY",
"version": "0.3",
"risk_index": 0
}
}
},
"fecha_respuesta": "2022-04-14T12:35:00",
"json_reversion": {
"status": "success",
"messages": [
{
"key": "RollbackSuccessful",
"dsc": "Transacción Aprobada",
"level": "info"
}
]
},
"fecha_reversion": "2022-04-14T12:55:00",
"estado_transaccion": 3,
"forma_pago": 14
}
]
}
]
}
```
Explicación de los campos
| Campos | Descripción | Ejemplo |
| --- | --- | --- |
| respuesta | Si es true, es porque se ejecutó el endpoint satisfactoriamente | true |
| resultado.pagado | Si es false, es porque no está pagado, si es true, es porque está pagado | false |
| resultado.forma_pago | Descripción del medio de pago con el cual fue pagado o elegido para pagar | Bancard - Catastrar Tarjeta |
| resultado.fecha_pago | Fecha del pago. Si es null es porque no está pagado o porque se reversó la transacción | null |
| resultado.monto | Monto del pedido | 38000 |
| resultado.fecha_maxima_pago | Fecha máxima que se tiene para pagar el pedido | 2022-04-16 12:39:58 |
| resultado.hash_pedido | Hash identificador del pedido, generado por Pagopar | 63b42f5f77dba52d9ad9981a489643ecc46ae29676692277f4c28397c2616197 |
| resultado.numero_pedido | Numero de pedido identificador generado por Pagopar | 2792947 |
| resultado.cancelado | Si es true, es porque el pedido fue cancelado, sucede cuando se cumple la fecha máxima de pago (fecha_maxima_pago) | false |
| resultado.forma_pago_identificador | Identificador interno de Pagopar para la forma de pago | 14 |
| resultado.token | 0 | 0 |
| resultado.datos_adicionales | Datos adicionales mayormente de uso interno relacionado al pedido | 0 |
| resultado.datos_adicionales.fecha_reversion | Fecha de reversión, si ya se realizó | 2022-04-14T12:55:00 |

> ℹ️ Para determinar si una reversión ya se realizó, en caso de que haya sido agendada anteriormente, se debe verificar el valor de resultado.datos_adicionales.fecha_reversión, si esta es de valor null, es porque aún no se ha aplicado dicha reversión, si contiene una fecha, es porque ya se realizó la reversión.

Datos de respuesta en caso de no haberse realizado la reversión ni inmediata ni de pudo agendarse

```
{
"respuesta": false,
"resultado": "Expiró el tiempo máximo para realizar la reversión de este pedido."}
```

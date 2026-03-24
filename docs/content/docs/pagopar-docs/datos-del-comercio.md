# Obtener datos del comercio

- Source: https://soporte.pagopar.com/portal/es/kb/articles/datos-del-comercio
- Article ID: 387583000000699001
- Created: 2020-07-17T16:37:45.000Z
- Updated: 2020-10-28T12:32:31.000Z

## Summary

Este endpoint retorna los datos de un comercio, puede ser útil para saber la comisión que posee el comercio, las deudas pendientes con Pagopar y los permisos habilitados, entre otros datos que se retornan. ...

## Content

Este endpoint retorna los datos de un comercio, puede ser útil para saber la comisión que posee el comercio, las deudas pendientes con Pagopar y los permisos habilitados, entre otros datos que se retornan.URL: [https://api.pagopar.com/api/comercios/2.0/datos-comercio/](https://api.pagopar.com/api/comercios/2.0/datos-comercio/)Método: POSTGeneración del token

```
sha1(token_privado + 'DATOS-COMERCIO'),
```
Datos a enviar
```
{
"token":"5f37540d5e9ac4c2797ec67ba9395872fde9becc",
"public_key":"3ceefa55009e99ea761493d8a4104740"
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
"descripcion": "Ushop",
"porcentaje_comision": 9.35,
"razon_social": "Ushop de Rudolph Goetz",
"ruc": "4247903-7",
"modo_pago_denominacion": "Pagopar-Card",
"servicios": true,
"retiro_local": true,
"envio_propio": true,
"comercio": 12,
"ranking": 5,
"modo_pago": 1,
"permisos_link_venta": false,
"forma_pago": [
{
"monto_minimo": 1000,
"forma_pago": "Pago Express",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - Tarjetas de crédito",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Tigo Money",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 50000,
"forma_pago": "Practipago",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Billetera Personal",
"tipo": "Diferenciado",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Pago Móvil",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Infonet Cobranzas",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Procard - Tarjetas de crédito",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - Catastrar Tarjeta",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Aqui Pago",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Contra Entrega",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Zimple",
"tipo": "Defecto",
"porcentaje_comision": 9.35
},
{
"monto_minimo": 1000,
"forma_pago": "Bancard - V2.0",
"tipo": "Defecto",
"porcentaje_comision": 9.35
}
],
"plan": {
"plan": 3,
"descripcion": "Avanzado",
"costo": 199000,
"fecha_siguiente_factura": "2020-07-24T06:05:27.31065"
},
"entorno": "Staging",
"tipo_venta": "Venta Comercio",
"usuario": {
"email": "fernandogoetz@gmail.com",
"nombre": "Rudolph",
"apellido": "Goetz",
"celular": "0972200046",
"saldo": 65661,
"documento": "4247903",
"fecha_saldo_actualizacion": "2020-07-17T09:33:56.79868",
"monto_pendiente_cobro": -33002,
"hash": null,
"estado_pago": "B",
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
```

```
{
"respuesta": true,
"resultado": {
"descripcion": "Ushop",
"porcentaje_comision": 6.05,
"razon_social": "Ushop de Rudolph Goetz",
"ruc": "4247903-7",
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
"email": "fernandogoetz@gmail.com",
"nombre": "Rudolph",
"apellido": "Goetz",
"celular": "0972200046",
"saldo": 26661,
"documento": "4247903",
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

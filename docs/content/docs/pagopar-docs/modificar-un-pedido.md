---
title: "Modificar un pedido"
---

# Modificar un pedido

- Source: https://soporte.pagopar.com/portal/es/kb/articles/modificar-un-pedido
- Article ID: 387583000000687016
- Created: 2020-07-16T16:13:17.000Z
- Updated: 2020-09-21T04:31:06.000Z

## Summary

Si por motivos propio de su negocio necesite modificar un pedido previamente creado, el siguiente endpoint le permitirá hacerlo: Método: POST URL: https://api.pagopar.com/api/pedidos/1.1/cambiar-datos/ Generación de token: sha1(token_privado + ...

## Content

Si por motivos propio de su negocio necesite modificar un pedido previamente creado, el siguiente endpoint le permitirá hacerlo:Método: POSTURL: [https://api.pagopar.com/api/pedidos/1.1/cambiar-datos/](https://api.pagopar.com/api/pedidos/1.1/cambiar-datos/)Generación de token:
```
sha1(token_privado + 'CAMBIAR-PEDIDO'),
```
Datos a enviar
```
{
"token_publico":"",
"token": "",
"fecha_maxima_pago":"2020-01-01",
"monto":1000,
"cotizacion":1,
"descripcion":"Nueva descripcion",
"hash_pedido":""
}
```
Observación: todos los cambios que se envién serán reemplazados por el valor enviadoRespuesta en caso de modificación exitosa:

```
{
"respuesta": true,
"resultado": [{"data": "de5ae0dcc9ff2bf933f5d45858edc10f88a36c73ec56b22ff72eaf1792a3d28c"}]
}
```
Respuesta en caso de error:

```
{
"respuesta": false,
"resultado": "Error en la cotizacion\n"
}
```

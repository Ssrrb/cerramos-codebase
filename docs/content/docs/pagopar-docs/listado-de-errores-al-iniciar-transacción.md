# Listado de errores al iniciar transacción

- Source: https://soporte.pagopar.com/portal/es/kb/articles/listado-de-errores-al-iniciar-transacci%C3%B3n
- Article ID: 387583000008255040
- Created: 2021-10-06T15:50:49.000Z
- Updated: 2021-10-06T16:33:55.000Z

## Summary

Este es un listado de algunos de los errores que se pudieran presentar al realizar la petición iniciar-transacción Descripción del error Explicación Token no coincide El token debe ser generado según en el endpoint, en el caso del endpoint ...

## Content

Este es un listado de algunos de los errores que se pudieran presentar al realizar la petición iniciar-transacción
| Descripción del error | Explicación |
| --- | --- |
| Token no coincide | El token debe ser generado según en el endpoint, en el caso del endpoint "iniciar-transacción" se genera de la siguiente forma: sha1($datos['comercio_token_privado'] . $idPedido . strval(floatval($j['monto_total'])));Tenga en cuenta que como $idPedido es alfanumerico, no es lo mismo "01" que 1, por lo cual, el valor de $idPedido a utilizarse en la generación de token debe ser exactamente igual al campo de id_pedido_comercio |
| El comercio no tiene permiso para crear pedidos | Por motivos de seguridad y prevención, el comercio pudiera no tener permisos para crear pedidos de forma temporal. Si le aparece este error, debe comunicarse con el área administrativa vía el e-mail [administracion@pagopar.com](mailto:administracion@pagopar.com) |
| Comercio no habilitado para generar pedidos | Debe ponerse en comunicación con el equipo de Desarrollo vía ticket en caso de visualizar este error, se debe a que se está utilizando un comercio de un entorno no existente. |
| Comercio no existe | Debe ponerse en comunicación con el equipo de Desarrollo vía ticket en caso de visualizar este error, se debe a que se está utilizando un comercio no existente. |
| Forma de pago seleccionado no corresponde | Si su comercio tiene alguna restricción de algún medio de pago, ya sea por el rubro de su comercio o por pedido suyo, no pueden crearse un pedido con la forma de pago que no está asociada al cliente. En caso que crea que deba crearse puede solicitar al equipo de Desarrollo vía ticket. |
| El id pedido del comercio debe de estar presente | El campo id_pedido_comercio tiene que estar presente en el JSON enviado |
| El pedido ya existe para ese comercio | El campo id_pedido_comercio debe ser único tanto en entorno de desarrollo como en entorno de producción combinados. Ejemplo, el id_pedido_comercio = 1 solo debe existir una sola vez. |
| La descripcion debe de estar presente | El campo descripcion debe enviarse, aunque sea con el valor vacío (""). |
| El documento debe de estar presente | El campo documento debe estar presente y cumplir con el formato: no se aceptan valores alfabéticos, ni caracteres especiales (exceptuando puntos que serán eliminados), debe ser de un rango entre 5 y 24. |
| El tipo documento debe de estar presente | El campo tipo_documento debe estar presente. El valor por el momento siempre debe ser CI. |
| Fecha inválida. | La el campo fecha_maxima_pago debe estar presente y no puede ser una fecha (en día) anterior a la actual. |
| Datos de productos invalidos | Se debe enviar el campo compras_items. |
| venta invalido | El campo debe estar definido, los valores posibles son VENTA-COMERCIO y COMERCIO-HEREDADO. |
| El email del comprador debe existir | El campo comprador debe existir. |
| Monto debe ser mínimo Gs. 1.000 o máximo de Gs. 50.000.00 | El monto total a pagarse puede ser entre Gs. 1.000 y Gs. 50.000.000 |
| La moneda no existe | Debe existir el campo y por el momento el valor debe ser siempre PYG. |
| El precio mínimo de cada item debe ser de Gs. 1.000 | Cada item dentro de compras_items debe ser de al menos Gs. 1.000. |

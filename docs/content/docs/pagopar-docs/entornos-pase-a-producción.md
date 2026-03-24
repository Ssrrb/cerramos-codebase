# Entornos y pase a Producción

- Source: https://soporte.pagopar.com/portal/es/kb/articles/entornos-pase-a-producci%C3%B3n
- Article ID: 387583000007729001
- Created: 2021-09-10T16:55:48.000Z
- Updated: 2021-09-15T14:47:37.000Z

## Summary

Entornos de desarrollo y producción En Pagopar existen dos entornos, por defecto, cuando uno empieza la integración se están utilizando las claves públicas y privadas de desarrollo/staging, una vez terminado la integración, debe pasar a producción y ...

## Content

## Entornos de desarrollo y producción

En Pagopar existen dos entornos, por defecto, cuando uno empieza la integración se están utilizando las claves públicas y privadas de desarrollo/staging, una vez terminado la integración, debe pasar a producción y usar las nuevas claves. ¿Cuáles son las diferencias entre estos entornos? Si bien en ambas se pueden hacer pagos reales, la integración no estará completa hasta que se haga el pase a producción, es muy importante este último paso ya que utilizar las claves de producción habilita a todas las funciones de Pagopar y por ende, el correcto funcionamiento. Algunas de esas funciones son: control de IP para mayor seguridad en la integración, notificaciones de pagos recurrentes en caso de que el servidor del comercio esté inaccesible o la comunicación falle, entre otras funciones como sincronización.       El pase a producción lo puede hacer usted mismo y el proceso es bastante rápido si ya tiene realizada la integración, y dicho proceso se resume en comprobar que cada función/endpoint fue implementada correctamente. Todas las pruebas se hacen sobre un pedido creado satisfactoriamente. Los pasos son los siguientes.        Desde tu cuenta de Pagopar en tu apartado de "Integrar con mi sitio web" contás con tres pasos que consisten básicamente en realizar el proceso de generación de pedidos y simular el pago del mismo por sistema.       Paso 1:  Generar el pedido en Pagopar. (Endpoint: iniciar-transaccion)
El comercio debe demostrar que puede crear un pedido satisfactoriamente en Pagopar siguiendo las directrices de la documentación técnica. [Más información sobre este paso](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos#Paso_1_El_comercio_crea_un_pedido_en_Pagopar).       Paso 2:  Simular el pago del pedido generado. (Pagopar notifica a comercio sobre el pago)
Pagopar hará una petición a la URL de respuesta definida por el comercio, el comercio debe responder correctamente el JSON según la documentación técnica. [Más información sobre este paso](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos#Paso_3_Pagopar_notifica_al_comercio_sobre_el_pago).

> ![image](https://img.zohostatic.com/zde/static/images/info.png) Tener en cuenta que el paso 2 en el simulador Pagopar envía el paramtro pagado:false, si se tratase de un pago real, este valor sería pagado:true. Si se quiere probar cómo sería el JSON cuando se paga, se puede copiar el JSON que Pagopar envía, y cambiar el valor de pagado: false a pagado: true, y enviar este JSON modificado con alguna herramienta como POSTMAN. Si se quiere probar todo el flujo de pago completo, puede pagar un pedido y luego hacer la reversión, recomendamos hacer las pruebas con monto de 1.000 Gs y la reversión en el día.

Paso 3:  Obtiene el estado actual de un pedido. (Comercio consulta el estado actual de un pedido específico)
Se debe haber implementado correctamente el endpoint [https://api.pagopar.com/api/pedidos/1.1/traer,](https://api.pagopar.com/api/pedidos/1.1/traer,) si bien gracias al paso 2 uno ya puede saber si se realizó el pago o no, es obligatorio haberlo implementado, ya que puede ser útil para saber el estado real (pagado/no pagado) de un pedido por si el aviso del paso 2 falla. [Más información sobre este paso](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos#Paso_4_Pagopar_redirecciona_a_la_pgina_del_resultado_de_pago_del_Comercio).            Una vez que se encuentren chequeados los tres pasos, deberás colocar la IP saliente de tu sitio en el campo de "IPs habilitadas" y pasar el entorno a producción.       Una vez que cambia el entorno al recargar la página los token también son actualizados por lo que deberás copiarlos nuevamente dentro de los ajustes del plugin de Pagopar dentro de tu sitio web.

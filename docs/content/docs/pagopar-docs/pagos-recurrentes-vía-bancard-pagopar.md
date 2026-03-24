---
title: "Pagos Recurrentes vía Bancard/Pagopar"
---

# Pagos Recurrentes vía Bancard/Pagopar

- Source: https://soporte.pagopar.com/portal/es/kb/articles/pagos-recurrentes-v%C3%ADa-bancard-pagopar
- Article ID: 387583000000629067
- Created: 2020-06-25T01:20:22.000Z
- Updated: 2025-08-18T19:57:24.000Z
- Tags: pagos recurrentes, tarjetas de débito, bancard, api

## Summary

Importante: A modo de ofrecerle mejoras y actualizaciones, le recomendamos utilizar la documentación actualizada Catastro de tarjetas - Pagos recurrentes - Preautorización, que asegurará una mejor experiencia y compatibilidad con futuros desarrollos. ...

## Content

> ![Alert](https://static.zohocdn.com/zoho-desk-editor/static/images/exclamation.png)Importante: A modo de ofrecerle mejoras y actualizaciones, le recomendamos utilizar la documentación actualizada [Catastro de tarjetas - Pagos recurrentes - Preautorización](https://soporte.pagopar.com/portal/es/kb/articles/catastro-tarjetas-pagos-recurrentes-preautorizacion), que asegurará una mejor experiencia y compatibilidad con futuros desarrollos.

# **Pagos recurrentes con Tarjeta de credito/débito vía Bancard en Pagopar**

## **Primeros pasos**

### **Descripción**

La funcionalidad de pagos recurrentes vía Bancard a traves de Pagopar permite realizar un pago en cualquier momento, de una tarjeta de crédito/débito previamente catastrada/guardada por el usuario.

El usuario guarda/catrastra la tarjeta, se le hará preguntas de seguridad, en caso que conteste todas las preguntas correctamente, se permitirá agregar la tarjeta asociandola al usuario, caso contrario, bloqueará la tarjeta y deberá comunicarse vía telefónica con Bancard para desbloquearla.

Para poder pagar o eliminar una tarjeta, por seguridad Bancard utiliza tokens temporales, por tanto, primero se debe listar las tarjeta de un usuario, seleccionar utilizando ese token temporal y luego decidir si se va a abonar utlizando dicha tarjeta, u otra acción, como eliminar la tarjeta, siempre utilizando ese token temporal.

## **Requisitos**

1. Poseer un contrato firmado con Pagopar, para dicha gestión debe de contactar al Departamento de Administración de Pagopar ([administracion@pagopar.com](mailto:administracion@pagopar.com)) y solicitar dicha funcionalidad
2. Haber implementado todos los pasos del circuito de [Pagopar en su sitio](https://docs.google.com/document/d/1mJ1Srp0MVMDY4JovE-qCahCumoJhAZw_0xPjFEK4wK8/edit).
3. Bajar el script que genera el código embedbido en el sitio web: [Bancard Checkout JS](https://github.com/Bancard/bancard-checkout-js/archive/master.zip)

## **Agregar Cliente**

### **Endpoint “Agregar Cliente”**

### **Descripción**

El comercio envia a Pagopar los datos del cliente, creando un cliente con un identificador, al cual serán asignadas tarjetas posteriormente.

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

Token para este endpoint se genera:

- sha1(Private_key + “PAGO-RECURRENTE”)

En PHP: sha1($datos['comercio_token_privado'] . “PAGO-RECURRENTE”)

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/1.1/agregar-cliente/](https://api.pagopar.com/api/pago-recurrente/1.1/agregar-cliente/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "a3955831ca0315797a4fd2c01d4338a76672acdd",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf",
"identificador": 1,
"nombre_apellido": "Enrique González",
"email": "mailcliente@gmail.com",
"celular": "0981111222"
}
```

**Observación**: El campo “identificador” corresponde al ID del usuario del sistema del comercio, no debe repetirse

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
"respuesta": true,
"resultado": {
"id_comprador_comercio": "1",
"nombres_apellidos": "Enrique González",
"email": "mailcliente@gmail.com",
"celular": "0981111222"
}
}
```

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "Token no corresponde."
}
```

## **Agregar Tarjeta**

### **Endpoint “Agregar Tarjeta”**

### **Descripción**

El comercio solicita a Pagopar la creación de una nueva tarjeta asociada a un Usuario.

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

Token para este endpoint se genera:

- sha1(Private_key + “PAGO-RECURRENTE”)

En PHP: sha1($datos['comercio_token_privado'] . “PAGO-RECURRENTE”)

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/1.1/agregar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/1.1/agregar-tarjeta/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "a3955831ca0315797a4fd2c01d4338a76672acdd",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf",
"url": "https://www.misitioejemplo.com.py/checkout",
"identificador": 1
}
```

**Observación**:

- El campo “identificador” corresponde al ID del usuario del sistema al cual va a asociarse la tarjeta
- El campo “url” es a donde se va a redireccionar luego del que el cliente agregue su tarjeta a través del iframe de Bancard

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

| { "respuesta": true, "resultado": "JIugXOLYIvpjMpN2n9GN" } |
| --- |

**Datos de ejemplo que Pagopar retornaría en caso de error:**

| { "respuesta": false, "resultado": "Error al cargar" } |
| --- |

## **Agregar Tarjeta**

### **HTML Agregar Tarjeta**

### **Descripción**

El comercio muestra el HTML utilizando la librería de Bancard, con el dato obtenido en el paso anterior “Endpoints - Agregar Tarjeta”

**Contenido del HTML**:

```
<html>
<head>
<script src="bancard-checkout-2.1.0.js"></script>
</head>
<script type="text/javascript">   window.onload = function () {
var styles = {
'input-background-color' : '#ffffff',
'input-text-color': '#333333',
'input-border-color' : '#ffffff',
'input-placeholder-color' : '#333333',
'button-background-color' : '#5CB85C',
'button-text-color' : '#ffffff',
'button-border-color' : '#4CAE4C',
'form-background-color' : '#ffffff',
'form-border-color' : '#dddddd',
'header-background-color' : '#dddddd',
'header-text-color' : '#333333',
'hr-border-color' : '#dddddd'
};
```

```
options = {
styles: styles
}

Bancard.Cards.createForm('iframe-container', 'json.resultado', options);

};
</script>
<body>

<h1>iFrame vPos</h1>
<div style="height: 130px; width: 100%; margin: auto" id="iframe-container"/>
```

```
</body>

</html>
```
Vista Previa:

![image](https://soporte.pagopar.com/DocsDisplay?zgId=687739706&mode=inline&blockId=7ww3629ddbe93d51746c59181f6ba968c287d)

**Observación**: Se le pedirá ingresar su CI más algunas preguntas de seguridad

**Al completar los datos en caso que se complete todo de forma correcta:**

Se direccionará a:

| https://[www.misitio-ejemplo.com/?status=add_new_card_success](http://www.misitio-ejemplo.com/?status=add_new_card_success) |
| --- |

**Al completar los datos en caso que se complete de forma incorrecta:**

Se direccionará a:

| https://[www.misitio-ejemplo.com/?status=add_new_card_fail&description=Favor%20reintente%20nuevamente.%20Aseg%FArese%20de%20contar%20con%20los%20datos%20de%20sus%20tarjetas%20para%20responder%20las%20preguntas%20de%20seguridad.%20%20Favor%20comun%EDquese%20al%20CAC%20de%20Bancard%20al%20*288%20o%20al%20021-2493000.%20Presione%20opci%F3n%201,%20luego%20la%20opci%F3n%204](http://www.misitio-ejemplo.com/?status=add_new_card_fail&description=Favor%20reintente%20nuevamente.%20Aseg%FArese%20de%20contar%20con%20los%20datos%20de%20sus%20tarjetas%20para%20responder%20las%20preguntas%20de%20seguridad.%20%20Favor%20comun%EDquese%20al%20CAC%20de%20Bancard%20al%20*288%20o%20al%20021-2493000.%20Presione%20opci%F3n%201,%20luego%20la%20opci%F3n%204) |
| --- |

**Importante**

Al retornar a la Url especificada, ya sea que se haya realizado el catastro de forma correcta o no, se debe llamar al endpoint “Confirmar tarjeta”. Es de caracter obligatorio y necesario para el funcionamiento de todo el circuito.

## **Confirmar Tarjeta**

### **Endpoint Confirmar Tarjeta**

### **Descripción**

El comercio solicita a Pagopar la confirmación de la tarjeta (o las tarjetas) previamente catastradas/agregadas. Este paso es obligatorio tanto se haya agregado satifactoriamente la tarjeta o no.

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

Token para este endpoint se genera:

- sha1(Private_key + “PAGO-RECURRENTE”)

En PHP: sha1($datos['comercio_token_privado'] . “PAGO-RECURRENTE”)

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/1.1/confirmar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/1.1/confirmar-tarjeta/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "a3955831ca0315797a4fd2c01d4338a76672acdd",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf",
"url": "https://www.misitioejemplo.com.py/checkout",
"identificador": 1
}
```

**Observación**:

- El campo “identificador” corresponde al ID del usuario del sistema al cual va a asociarse la tarjeta

**Pagopar retornará:**

```
null
```

## **Listar Tarjetas**

### **Endpoint Listar tarjetas**

### **Descripción**

El comercio solicita a Pagopar las tarjetas previamente catastradas de un específico. Eso puede ser simplemente para mostrarle al cliente sus tarjetas catastradas, o si se quiere pagar/eliminar con una tarjeta específica, se debe necesariamente ejecutar este endpoint, puesto que en el se retorna el token temporal de cada tarjeta para realizar dicha acción.

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

Token para este endpoint se genera:

- sha1(Private_key + “PAGO-RECURRENTE”)

En PHP: sha1($datos['comercio_token_privado'] . “PAGO-RECURRENTE”)

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/2.0/listar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/2.0/listar-tarjeta/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "a3955831ca0315797a4fd2c01d4338a76672acdd",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf",
"identificador": 1
}
```

**Observación**: El campo “identificador” corresponde al ID del usuario retornado por Pagopar en el endpoint “Agregar cliente”.

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
"respuesta": true,
"resultado": [
{
"tarjeta": "3",
"url_logo": "https://cdn.pagopar.com/assets/images/card-payment/mastercard.png?0.20180928224330",
"tarjeta_numero": "541863******1234",
"alias_token": "faf3e3b0def97b0bace298faef9c0b330e060230e2651eab6d2250cc8220d685"
}
]
}
```
Observación: El campo “alias_token” corresponde a un hash temporal de la tarjeta, este será utilizado para eliminar una tarjeta o para pagar con dicha tarjeta, tener en cuenta siempre que es un hash temporal..

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "No existe comprador"
}
```

## **Eliminar Tarjeta**

### **Endpoint Eliminar tarjeta**

### **Descripción**

Para eliminar una tarjeta previamente agregada/catastrada, el comercio debe primero listar las tarjetas del comercio (Endpoint - Listar Tarjetas), luego, con el campo alias_token, hacer referencia a dicha tarjeta para eliminarla. Tener en cuenta que el alias_token es un hash temporal, por lo tanto cada vez que se desee borrar una tarjeta, debe ejecutarse el endpoint Listar Tarjetas para obtener el alias_token identificador.

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

Token para este endpoint se genera:

- sha1(Private_key + “PAGO-RECURRENTE”)

En PHP: sha1($datos['comercio_token_privado'] . “PAGO-RECURRENTE”)

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/2.0/eliminar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/2.0/elliminar-tarjeta/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "4172b540dd2084363aec9673a7754987b17769ac",
"token_publico": "0eef1badfcea4f88f9ea346bd263497d",
"tarjeta": "fac17d188d61d1171d28083aabd577fdd40f7f0e19a653f116668b6ebdbce0ef",
"identificador": 24
}
```

**Observación**:

- El campo “identificador” corresponde al ID del usuario retornado por Pagopar en el endpoint “Listar tarjeta”.
- El campo “tarjeta” corresponde al hash temporal de la tarjeta retornado por Pagopar en el endpoint “Listar tarjeta”.

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
"respuesta": true,
"resultado": "Borrado"
}
```

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "Selecciona una tarjeta valida."
}
```

## **Pagar**

### **Endpoint pagar**

**Descripción** Para pagar con una tarjeta previamente agregada/catastrada, el comercio debe primero listar las tarjetas del comercio (Endpoint - Listar Tarjetas), luego, con el campo alias_token, hacer referencia a dicha tarjeta para pagar con dicha tarjeta, además, el [hash de pedido](https://docs.google.com/document/d/1mJ1Srp0MVMDY4JovE-qCahCumoJhAZw_0xPjFEK4wK8/edit) debe estar ya generado para saber cuál pedido es el que va a ser pagado. Tener en cuenta que el alias_token es un hash temporal, por lo tanto cada vez que se desee pagar con una tarjeta específica, debe ejecutarse el endpoint Listar Tarjetas para obtener el alias_token identificador.

**Observación** El valor de public key y private key se obtiene desde la opción “Integrar con mi sitio web” de Pagopar.com

Token para este endpoint se genera:

- sha1(Private_key + “PAGO-RECURRENTE”)

En PHP: sha1($datos['comercio_token_privado'] . “PAGO-RECURRENTE”)

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/2.0/pagar/](https://api.pagopar.com/api/pago-recurrente/2.0/pagar/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "a3955831ca0315797a4fd2c01d4338a76672acdd",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf",
"hash_pedido": "438af751ff62c43d62773aa0a3d1eb8fdc7b57b46488a978cbdaf8091c03c994",
"tarjeta": "ed7c095d38df1bb7a588344a32216e9724ff0dc0c0c70e1a8093fff4e1bdb996",
"identificador": 1
}
```

**Observación**:

- El campo “identificador” corresponde al ID del usuario retornado por Pagopar en el endpoint “Listar tarjeta”.
- El campo “tarjeta” corresponde al hash temporal de la tarjeta retornado por Pagopar en el endpoint “Listar tarjeta”.

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
"respuesta": true,
"resultado": ""
}
```

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "No existe comprador"
}
```

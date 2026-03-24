# Catastro de tarjetas - Pagos recurrentes - Preautorización

- Source: https://soporte.pagopar.com/portal/es/kb/articles/catastro-tarjetas-pagos-recurrentes-preautorizacion
- Article ID: 387583000030999075
- Created: 2024-07-05T00:01:03.000Z
- Updated: 2024-08-02T01:52:20.000Z
- Tags: pagos recurrentes, tarjetas de débito, upay, bancard, api

## Summary

Catastro de tarjetas para pagos recurrentes o sin acción del usuario Primeros pasos Descripción La funcionalidad de pagos recurrentes a través de Pagopar permite realizar un pago en cualquier momento, de una tarjeta de crédito/débito previamente ...

## Content

# **Catastro de tarjetas para pagos recurrentes o sin acción del usuario**

## **Primeros pasos**

### **Descripción**

La funcionalidad de pagos recurrentes a través de Pagopar permite realizar un pago en cualquier momento, de una tarjeta de crédito/débito previamente catastrada/guardada por el usuario.

Para poder pagar o eliminar una tarjeta, por seguridad se utiliza tokens temporales, por tanto, primero se debe listar las tarjeta de un usuario, seleccionar utilizando ese token temporal y luego decidir si se va a abonar utlizando dicha tarjeta, u otra acción, como eliminar la tarjeta, siempre utilizando ese token temporal.

Esta funcionalidad permite el catastro y posterior pago de una transacción con una tarjeta previamente catastrada utilizando dos proveedores: Bancard y uPay.

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png)Para facilidad de integración, contamos con un [proyecto en POSTMAN](https://www.postman.com/pagopar/workspace/pagopar/overview) con los endpoints utilizados en esta documentación.

## **Requisitos**

1. Poseer un contrato firmado con Pagopar, para dicha gestión debe de contactar al Departamento de Administración de Pagopar ([administracion@pagopar.com](mailto:administracion@pagopar.com)) y solicitar dicha funcionalidad
2. Haber implementado todos los pasos del circuito de [Pagopar en su sitio](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos).

## **Agregar Cliente**

### **Endpoint “Agregar Cliente”**

### **Descripción**

El comercio envia a Pagopar los datos del cliente, creando un cliente con un identificador, al cual serán asignadas tarjetas posteriormente. Esto se debe hacer antes de agregar una tarjeta solo la primera vez para registrar al cliente en Pagopar, no obstante, si se ejecuta cada vez antes de agregar una tarjeta tampoco dará algún error, simplemente no es necesario.

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/agregar-cliente/](https://api.pagopar.com/api/pago-recurrente/3.0/agregar-cliente/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"identificador": 1,
"nombre_apellido": "Mikhail Szwako",
"email": "mihares@gmail.com",
"celular": "0981252238"
}
```
Explicación de datos a enviar

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 |
| token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb |
| identificador | Corresponde al ID del usuario del sistema del comercio, no debe repetirse. | 1 |
| nombre_apellido | El nombre y apellido del usuario que va a catastrar su tarjeta | Mikhail Szwako |
| email | Correo electrónico del usuario que va a catastrar su tarjeta | 1 |
| celular | Número de celular del usuario que va a catastrar su tarjeta | 0981252238 |

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
"respuesta": true,
"resultado": {
"id_comprador_comercio": "1",
"nombres_apellidos": "Mikhail Szwako",
"email": "mihares@gmail.com",
"celular": "0981252238"
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

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/agregar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/3.0/agregar-tarjeta/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"url": "https://www.misitioejemplo.com.py/checkout",
"proveedor": "Bancard",
"identificador": 1
}
```
Explicación de datos a enviar

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 |
| token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb |
| url | Es la URL a donde se va a redireccionar luego del que el cliente agregue su tarjeta a través del iframe de Pagopar | [https://www.misitioejemplo.com.py/checkout](https://www.misitioejemplo.com.py/checkout) |
| proveedor | El proveedor que se desea utilizar para catastrar la tarjeta. Puede ser "uPay" o "Bancard". La opción "uPay" estará disponible próximamente.Tarjetas que pueden ser catastradas con uPay:1. VISA 2. MastercardTarjetas que pueden ser catastradas con Bancard: 1. VISA 2. Mastercard 3. American Express 4. Otras tarjetas | Bancard |
| identificador | Corresponde al ID del usuario del sistema del comercio al cual va a asociarse la tarjeta. Por ejemplo, si en el sistema del comercio el ID de la tabla usuarios es 1, entonces el identificador es 1. | 1 |

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png)Recomendamos la utilización del proveedor uPay para las tarjetas VISA y Mastercard

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
"respuesta": true,
"resultado": "JIugXOLYIvpjMpN2n9GN"
}
```

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "Error al cargar"
}
```

## **Agregar Tarjeta**

### **HTML Agregar Tarjeta**

### **Descripción**

El comercio muestra el HTML que contiene la funcionalidad que crea el formulario para que el usuario agregue el número de tarjeta y otros datos para catrastrar la tarjeta. Dependiendo de si el proveedor es uPay o Bancard la forma de mostrar el HTML para agregar la tarjeta es distinta. En ambos casos se utiliza el campo *resultado*obtenido en el paso anterior “Endpoints - Agregar Tarjeta” y en ambos casos el flujo de la respuesta es el mismo.

### **Mostrar HTML en caso de que el proveedor sea Bancard**

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

<div style="height: 130px; width: 100%; margin: auto" id="iframe-container"/>
```

```
</body>
</html>
```
Vista Previa:

![image](https://soporte.pagopar.com/DocsDisplay?zgId=687739706&mode=inline&blockId=7ww3629ddbe93d51746c59181f6ba968c287d)

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png)**Observación**: El archivo bancard-checkout-2.1.0.js lo encuentran descomprimiendo la [librería oficial de Bancard](https://github.com/Bancard/bancard-checkout-js/archive/master.zip).

### **Mostrar HTML en caso de que el proveedor sea uPay**

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mi Checkout</title>
</head>
<body>
<h1>Bienvenido a la Página Principal</h1>
<iframe src="https://www.pagopar.com/upay-iframe/?id-form={json.resuldado}" width="100%" height="300px" frameborder="0"></iframe>
```

```
</body>
</html>
```
Vista previa:

![image](https://soporte.pagopar.com/galleryDocuments/edbsnde17d103d0d568824730020ac5780cd6430912ff7c99931c239cd6d0b504132db4d34fb8a8443c5f98139a1852c071b8?inline=true)

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png)Observación: En el caso de uPay, el iframe se puede incrustar en el dominio que corresponda al campo url enviado en 'agregar-tarjeta', según nuestro ejemplo, el valor de url es [https://www.misitioejemplo.com.py/checkout,](https://www.misitioejemplo.com.py/checkout,) por ende, el iframe se podrá incluir en [https://www.misitioejemplo.com.py](https://www.misitioejemplo.com.py). El protocolo utilizado debe ser *https*.

Al completar los datos en caso que se complete todo de forma correcta:

Se direccionará a:

```
https://www.misitio-ejemplo.com/?status=add_new_card_success
```

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png)Como se puede observar, en caso de éxito al catastrar la tarjeta se redireccionará a la URL enviada en el endpoint "agregar-tarjeta" y se agregará el parámetro GET "status" con el estado "add_new_card_success"

Al completar los datos en caso que se complete de forma incorrecta:

Se direccionará a:

```
https://www.misitio-ejemplo.com/?status=add_new_card_fail&description=Favor%20reintente%20nuevamente.%20Aseg%FArese%20de%20contar%20con%20los%20datos%20de%20sus%20tarjetas%20para%20responder%20las%20preguntas%20de%20seguridad.%20%20Favor%20comun%EDquese%20al%20CAC%20de%20Bancard%20al%20*288%20o%20al%20021-2493000.%20Presione%20opci%F3n%201,%20luego%20la%20opci%F3n%204
```

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png)Como se puede observar, en caso de error al catastrar la tarjeta se redireccionará a la URL enviada en el endpoint "agregar-tarjeta" y se agregará el parámetro GET "status" con el estado "add_new_card_fail"

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/file.png)**Importante.** Al retornar a la URL especificada, ya sea que se haya realizado el catastro de forma correcta o no, se debe llamar al endpoint “Confirmar tarjeta”. Es de carácter obligatorio y necesario para el funcionamiento de todo el circuito.

## **Agregar Tarjeta**

### **HTML Agregar Tarjeta con el proveedor uPay**

### **Descripción**

El comercio muestra el HTML utilizando agregando un iframe, con el dato obtenido en el paso anterior “Endpoints - Agregar Tarjeta”

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mi Checkout</title>
</head>
<body>
<h1>Bienvenido a la Página Principal</h1>
<iframe src="http://pagopar.local/pagopar-iframe/?id-form={json.resuldado}" width="100%" height="300px" frameborder="0"></iframe>
```

```
</body>
</html>
```

## **Confirmar Tarjeta**

### **Endpoint Confirmar Tarjeta**

### **Descripción**

El comercio solicita a Pagopar la confirmación de la tarjeta (o las tarjetas) previamente catastradas/agregadas. Este paso es obligatorio tanto se haya agregado satisfactoriamente la tarjeta o no.

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/confirmar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/3.0/confirmar-tarjeta/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"url": "https://www.misitioejemplo.com.py/checkout",
"identificador": 1
}
```
Explicación de datos a enviar
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 |
| token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb |
| url | URL a la que se va a redireccionar luego de que se catastre la tarjeta | https://www.misitioejemplo.com.py/checkout |
| identificador | Corresponde al ID del usuario del sistema al cual va a asociarse la tarjeta | 1 |

**Pagopar retornará:**

```
{
"respuesta": true,
"resultado": "Ok"
}
```

## **Listar Tarjetas**

### **Endpoint Listar tarjetas**

### **Descripción**

El comercio solicita a Pagopar las tarjetas previamente catastradas de un específico. Eso puede ser simplemente para mostrarle al cliente sus tarjetas catastradas, o si se quiere pagar/eliminar con una tarjeta específica, se debe necesariamente ejecutar este endpoint, puesto que en el se retorna el token temporal de cada tarjeta para realizar dicha acción.

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/listar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/3.0/listar-tarjeta/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"identificador": 1
}
```
Explicación de datos a enviar
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 |
| token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb |
| identificador | Corresponde al ID del usuario retornado por Pagopar en el endpoint “Agregar cliente” | 1 |
Datos de ejemplo que Pagopar retornaría en caso de éxito:
```
{
"respuesta": true,
"resultado": [
{
"tarjeta": "3",
"url_logo": "https://cdn.pagopar.com/assets/images/card-payment/mastercard.png?0.20180928224330",
"tarjeta_numero": "541863******4424",
"marca": "Mastercard",
"emisor": "UENO HOLDING S.A.E.C.A.",
"alias_token": "faf3e3b0def97b0bace298faef9c0b330e060230e2651eab6d2250cc8220d685",
"proveedor": "uPay",
"tipo_tarjeta": "Débito"
}
]
}
```

> ![image](https://static.zohocdn.com/zoho-desk-editor/static/images/info.png)Observación: El campo “alias_token” corresponde a un hash temporal de la tarjeta, este será utilizado para eliminar una tarjeta o para pagar con dicha tarjeta, tener en cuenta siempre que es un hash temporal de duración de 15 minutos, no obstante, recomendamos la llamada a este endpoint (listar) inmediatamente antes de la llamada a la acción de pagar/eliminar/preautorizar.

Explicación de datos recibidos en caso de éxito
| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| respuesta | Se determina si se ejecutó correctamente el endpoint, si es true, entonces lo hizo satisfactoriamente, si es false, no. | true |
| resultado.tarjeta | Identificador numérico de la tarjeta | 3 |
| resultado.url_logo | URL del logo de la marca de la tarjeta | https://cdn.pagopar.com/assets/images/card-payment/mastercard.png?0.20180928224330 |
| resultado.tarjeta_numero | Número de tarjeta enmascarada para que el usuario pueda identificar su tarjeta | 541863******4424 |
| resultado.marca | La marca de la tarjeta. Ejemplos: Visa, Mastercard | Mastercard |
| resultado.emisor | El emisor de la tarjeta. | UENO HOLDING S.A.E.C.A. |
| resultado.alias_token | Hash temporal con duración de 15 minutos de validez para identificar las tarjetas catastradas | faf3e3b0def97b0bace298faef9c0b330e060230e2651eab6d2250cc8220d685 |
| resultado.proveedor | Proveedor en donde se catastró la tarjeta. Puede ser uPay o Bancard. | Bancard |
| resultado.tipo_tarjeta | Tipo de tarjeta catastrada. Pueden ser las opciones:1. "Crédito": Tarjetas de crédito 2. "Débito": Tarjetas de débito 3. "Prepaga": Tarjetas prepagas | Débito |

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

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/eliminar-tarjeta/](https://api.pagopar.com/api/pago-recurrente/3.0/elliminar-tarjeta/)

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
Explicación de datos a enviar

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 4172b540dd2084363aec9673a7754987b17769ac |
| token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | 0eef1badfcea4f88f9ea346bd263497d |
| tarjeta | Corresponde al hash temporal de la tarjeta retornado por Pagopar en el endpoint “Listar tarjeta”. | fac17d188d61d1171d28083aabd577fdd40f7f0e19a653f116668b6ebdbce0ef |
| identificador | Corresponde al ID del usuario retornado por Pagopar en el endpoint “Listar tarjeta”. | 24 |

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

## Debitar

La acción de debitar se pueden dar de dos formas, una es con pre autorización y la otra es sin pre autorización, la diferencia es que la pre autorización si bien descuenta el saldo de la tarjeta de crédito, se debe confirmar posteriormente o sino la transacción se cancela automáticamente a los 30 días.

## **Pagar - Débito sin Pre autorización**

### **Endpoint pagar**

**Descripción** Para pagar con una tarjeta previamente agregada/catastrada, el comercio debe primero listar las tarjetas del comercio (Endpoint - Listar Tarjetas), luego, con el campo alias_token, hacer referencia a dicha tarjeta para pagar con dicha tarjeta, además, el [hash de pedido](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos) debe estar ya generado para saber cuál pedido es el que va a ser pagado. Tener en cuenta que el alias_token es un hash temporal, por lo tanto cada vez que se desee pagar con una tarjeta específica, debe ejecutarse el endpoint Listar Tarjetas para obtener el alias_token identificador.

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/pagar/](https://api.pagopar.com/api/pago-recurrente/3.0/pagar/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"hash_pedido": "438af751ff62c43d62773aa0a3d1eb8fdc7b57b46488a978cbdaf8091c03c994",
"tarjeta": "ed7c095d38df1bb7a588344a32216e9724ff0dc0c0c70e1a8093fff4e1bdb996",
"identificador": 1
}
```
Explicación de datos a enviar

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 |
| token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb |
| hash_pedido | Es la URL a donde se va a redireccionar luego del que el cliente agregue su tarjeta a través del iframe de Pagopar | [https://www.misitioejemplo.com.py/checkout](https://www.misitioejemplo.com.py/checkout) |
| tarjeta | Corresponde al hash temporal de la tarjeta retornado por Pagopar en el endpoint “Listar tarjeta” | ed7c095d38df1bb7a588344a32216e9724ff0dc0c0c70e1a8093fff4e1bdb996 |
| identificador | Corresponde al ID del usuario retornado por Pagopar en el endpoint “Listar tarjeta”. | 1 |

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

## **Pre autorizar - Débito con Pre autorización**

### **Endpoint preautorizar**

### **Descripción** En caso que queramos pre autorizar una transacción, es decir, congelar el saldo de la tarjeta para luego poder confirmarlo o cancelarlo, podemos utilizar el endpoint de pre autorizar. Es importante tener en cuenta que en caso que no se confirme la preautorización en 30 días se cancelará automáticamente..

**URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/preautorizar/](https://api.pagopar.com/api/pago-recurrente/3.0/preautorizar/)

**Método**: POST

**Datos de ejemplo que el Comercio enviaría a Pagopar:**

**Contenido**:

```
{
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"tarjeta": 24,
"monto": 1000,
"descripcion": "Monto ejemplo",
"id_transaccion": 1,
"identificador": 1
}
```
Explicación de datos a enviar

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 |
| token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb |
| tarjeta | Corresponde al ID numérico que identifica la tarjeta catastrada retornado por Pagopar en el endpoint "Listar tarjetas" | 24 |
| monto | Monto que será congelado para luego confirmar o cancelar la pre autorización | 1000 |
| id_transaccion | Identificador de la transacción que está asociada a la pre autorización en el sistema del Comercio. Por ejemplo: Si el ID de la tabla transacciones del sistema del comercio es 1, entonces el id_transaccion es 1 | 1 |
| identificador | Corresponde al ID de usuario, al campo "identificador" enviado en el endpoint "Listar tarjetas" | 1 |

**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
```

```
"respuesta": true,
"resultado": {
"transaccion": "8302771",
"comprobante_interno": "3926505331"
}
}
```
Explicación de datos recibidos

| Campo | Descripción | Ejemplo |
| --- | --- | --- |
| respuesta | Si se ejecutó correctamente la acción de pre autorizar o no | true |
| resultado.transaccion | ID de transacción interno en Pagopar que hace referencia a la preautorizar. Se utilizará para confirmar o para cancelar la pre autorización por lo tanto debe ser guardado por el co. | 8302771 |
| resultado.comprobante_interno | Código alfanumérico que comprueba la pre autorización en el proveedor | 3926505331 |

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "id_transaccion debe estar presente"
}
```

## **Confirmar Pre autorización**

### **Endpoint preautorizar**

### **Descripción** En caso que queramos pre autorizar una transacción, es decir, congelar el saldo de la tarjeta para luego poder confirmarlo o cancelarlo, podemos utilizar el endpoint de pre autorizar. Es importante tener en cuenta que en caso que no se confirme la preautorización en 30 días se cancelará automáticamente..

### **URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/confirmar-preautorizacion/](https://api.pagopar.com/api/pago-recurrente/3.0/confirmar-preautorizacion/)**Método**: POST**Datos de ejemplo que el Comercio enviaría a Pagopar:** **Contenido**:

```
{
```

```
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"hash_pedido": "3de3621705020abc7a91e5cd0f5fba90ad73ee7a24612c74abb3a744e4b4ab59",
"transaccion": 8299761,
"id_transaccion": 1,
"identificador": 1
}
```

### Explicación de datos a enviar| Campo | Descripción | Ejemplo | | --- | --- | --- | | token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 | | token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb | | hash_pedido | Corresponde al hash de un pedido creado en Pagopar en el endpoint ["iniciar-transaccion"](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos) | ed7c095d38df1bb7a588344a32216e9724ff0dc0c0c70e1a8093fff4e1bdb996 | | transaccion | Identificador de transacción retornado por pagopar en el endpoint "preautorizar" | 1 | | id_transaccion | Identificador de la transacción que está asociada a la pre autorización en el sistema del Comercio. Es el valor del campo id_transaccion enviado en el endpoint "preautorizar" | 1 | | identificador | Corresponde al ID de usuario, al campo "identificador" enviado en el endpoint "Listar tarjetas" | 1 |**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
"respuesta": true
}
```

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "id_transaccion debe estar presente"
}
```

## **Cancelar Pre autorización**

### **Endpoint**cancelar-preautorizacion

### **Descripción**

### En caso que queramos cancelar una pre autorización podemos hacerlo en cualquier momento, esto devolverá el saldo congelado al usuario. Una vez cancelada la pre autorización, ya no se puede confirmar.

### **URL de ejemplo:** [https://api.pagopar.com/api/pago-recurrente/3.0/cancelar-preautorizacion/](https://api.pagopar.com/api/pago-recurrente/3.0/cancelar-preautorizacion/)**Método**: POST**Datos de ejemplo que el Comercio enviaría a Pagopar:** **Contenido**:

```
{
```

```
"token": "2e2dc08bf16e4cc8334bfb9815043a7dace65a05",
"token_publico": "ebcad4d95e229113a4e871cb491fbcfb",
"transaccion": 8299761,
"id_transaccion": 1,
"identificador": 1
}
```

### Explicación de datos a enviar| Campo | Descripción | Ejemplo | | --- | --- | --- | | token | Se genera de la siguiente forma: sha1(Private_key + "PAGO-RECURRENTE")La clave privada se obtiene desde Pagopar.com en el apartado "Integrar con mi sitio web" | 2e2dc08bf16e4cc8334bfb9815043a7dace65a05 | | token_publico | Clave publica obtenida desde Pagopar.com en el apartado "Integrar con mi sitio web" | ebcad4d95e229113a4e871cb491fbcfb | | hash_pedido | Corresponde al hash de un pedido creado en Pagopar en el endpoint ["iniciar-transaccion"](https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos). El monto del pedido que se debe crear puede ser igual o menor al monto pre autorizado en el endpoint "preautorizar", pero no mayor. | ed7c095d38df1bb7a588344a32216e9724ff0dc0c0c70e1a8093fff4e1bdb996 | | transaccion | Identificador de transacción retornado por pagopar en el endpoint "preautorizar" | 1 | | id_transaccion | Identificador de la transacción que está asociada a la pre autorización en el sistema del Comercio. Es el valor del campo id_transaccion enviado en el endpoint "preautorizar" | 1 | | identificador | Corresponde al ID de usuario, al campo "identificador" enviado en el endpoint "Listar tarjetas" | 1 |**Datos de ejemplo que Pagopar retornaría en caso de éxito:**

```
{
```

```
"respuesta": true,
"resultado": "OK"
}
```

**Datos de ejemplo que Pagopar retornaría en caso de error:**

```
{
"respuesta": false,
"resultado": "id_transaccion debe estar presente"
}
```

---
title: "(Versión Inglés) API - Steps to integrate Pagopar to my website"
---

# (Versión Inglés) API - Steps to integrate Pagopar to my website

- Source: https://soporte.pagopar.com/portal/es/kb/articles/version-ingles-api-integraci%C3%B3n-de-medios-de-pagos
- Article ID: 387583000027071003
- Created: 2024-01-30T12:51:58.000Z
- Updated: 2025-08-18T20:10:26.000Z
- Tags: integracion, api, inglés

## Summary

Normal flow of purchase Step # 1: The shop creates an order in Pagopar. Step # 2: The shop redirects to the Pagopar checkout page. Step # 3: Pagopar notifies the shop of the payment. Step # 4: Pagopar redirects to the shop´s payment result page. Step ...

## Content

## Normal flow of purchase

1. Step # 1: The shop creates an order in Pagopar.
2. Step # 2: The shop redirects to the Pagopar checkout page.
3. Step # 3: Pagopar notifies the shop of the payment.
4. Step # 4: Pagopar redirects to the shop´s payment result page.

## Step # 1: The shop creates an order in Pagopar.

DescriptionThe shop generates an order in Pagopar, Pagopar returns a hash that will be used to build a URL. Obs.The value of public key and private key is obtained from the option “integrate with my website” from Pagopar.com Token from this endpoint is generated: In PHP:

```
<?php sha1($datos['comercio_token_privado'] . $idPedido . strval(floatval($j['monto_total']))); ?>
```

### Are you going to use third-party shipping methods offered by Pagopar?

To do so, you must follow these additional steps explained in the documentation. URL: [https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion](https://api.pagopar.com/api/comercios/1.1/iniciar-transaccion) Method: POSTSample data that the commerce would send to Pagopar: Content:
```
{  "token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d",
"comprador": {
"ruc": "1234567-8",
"email": "mailcomprador@gmail.com",
"ciudad": null,
"nombre": "Enrique González",
"telefono": "0971111234",
"direccion": "",
"documento": "1234567",    "coordenadas": "",
"razon_social": "Enrique González",    "tipo_documento": "CI",
"direccion_referencia": null
},
"public_key": "63820974a40fe7c5c5c53c429af8b25bed599dbf",
"monto_total": 100000,
"tipo_pedido": "VENTA-COMERCIO",
"compras_items": [
{
"ciudad": "1",
"nombre": "Ticket virtual a evento Ejemplo 2017",
"cantidad": 1,
"categoria": "909",
"public_key": "63820974a40fe7c5c5c53c429af8b25bed599dbf",      "url_imagen": "http://www.example.com/d7/wordpress/wp-content/uploads/2017/10/ticket.png",
"descripcion": "Ticket virtual a evento Ejemplo 2017",
"id_producto": 895,
"precio_total": 100000,
"vendedor_telefono": "",
"vendedor_direccion": "",
"vendedor_direccion_referencia": "",
"vendedor_direccion_coordenadas": ""
}
],
"fecha_maxima_pago": "2018-01-04 14:14:48",
"id_pedido_comercio": "1134",
"descripcion_resumen": "",
"forma_pago": 9
}
```
Explanation of data to be sent
| **Field** | **Description** | **Example** |
| --- | --- | --- |
| token | It is generated as follows: sha1($datos['comercio_token_privado'] . $idPedido . strval(floatval($j['monto_total']))); | ef4f7ebd763e205a45a9fae5e5d8d7508235778d |
| comprador.ruc | Buyer's Tax ID. The field must be present; if there is no Tax ID, it should be provided with an empty value ('') | 1234567-8 |
| comprador.email | Buyer's Email. Mandatory field | [mailcomprador@gmail.com](mailto:fernandogoetz@gmail.com) |
| comprador.ciudad | If you are not using the courier services offered by Pagopar (Only for physical products), you must still send the field with the value 1. Otherwise, refer to the [courier integration documentation](https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery) to obtain the city ID. | 1 |
| comprador.nombre | Buyer's Name. Mandatory field. | Enrique González |
| comprador.telefono | Phone number in international format. | +595971111234 |
| comprador.direccion | Buyer's Address. The field must be present; if there is no address, send the empty value (''). |  |
| comprador.documento | ID Number. Mandatory field. | 1234567 |
| comprador.coordenadas | Coordinates of the buyer's address, if not available, send with the empty value. |  |
| comprador.razon_social | Buyer's business name, if not available, send the field with the empty value. |  |
| comprador.tipo_documento | Buyer's document type, for now, must always be sent with the value 'CI'. | CI |
| comprador.direccion_referencia | Buyer's address reference. The field must be present; if there is no reference, send it empty. |  |
| public_key | Public key obtained from Pagopar.com in the 'Integrar con mi sitio web' section. | 63820974a40fe7c5c5c53c429af8b25bed599dbf |
| monto_total | Total amount to be transacted, in the currency 'Guaraníes (PYG)'. | 100000 |
| tipo_pedido | If it's a simple transaction, the value 'VENTA-COMERCIO' must be sent. If it's split billing, 'COMERCIO-HEREDADO'. | VENTA-COMERCIO |
| compras_items.[0].ciudad | The buyer's city, if not available, send the value 1. | 1 |
| compras_items.[0].nombre | Name of the product or service being purchased. Mandatory. | Ticket virtual a evento Ejemplo 2017 |
| compras_items.[0].cantidad | Quantity of the product being purchased, for informational purposes only. | 1 |
| compras_items.[0].categoria | If you are not using courier services offered by Pagopar (Only for physical products), you must still send the field with the value 909. Otherwise, refer to the [courier integration documentation](https://soporte.pagopar.com/portal/es/kb/articles/ws-pagopar-api-adicional-servicio-de-pickup-delivery) to obtain the category ID. | 909 |
| compras_items.[0].public_key | Seller's public key, if it is not a split billing transaction, it will be the same value as the 'public_key' field. | 63820974a40fe7c5c5c53c429af8b25bed599dbf |
| compras_items.[0].url_imagen | Product image URL. If there is no image, send the field with the empty value. | [http://www.example.com/d7/wordpress/wp-content/uploads/2017/10/ticket.png](http://www.example.com/d7/wordpress/wp-content/uploads/2017/10/ticket.png) |
| compras_items.[0].descripcion | Description of the product being purchased. | Ticket virtual a evento Ejemplo 2017 |
| compras_items.[0].id_producto | Identifier of the product/service being purchased. | 895 |
| compras_items.[0].precio_total | Total price of the product/service being purchased (It is not the unit price, but the total price grouped by product). | 100000 |
| compras_items.[0].vendedor_telefono | Buyer's phone number. If not available, it must be sent with the empty value. |  |
| compras_items.[0].vendedor_direccion | Seller's address. If not available, it must be sent with the empty value. |  |
| compras_items.[0].vendedor_direccion_referencia | Reference of the seller's address. If not available, it must be sent with the empty value. |  |
| compras_items.[0].vendedor_direccion_coordenadas | Coordinates of the seller's address. If not available, it must be sent with the empty value. |  |
| fecha_maxima_pago | It is the maximum date that the buyer has to pay the order. Once it reaches the specified date, the order is automatically canceled and can no longer be paid. | 2018-01-04 14:14:48 |
| id_pedido_comercio | Alfanumérico.Commerce order/transaction ID. It must be unique in both Development and Production environments. Alphanumeric. | 1134 |
| descripcion_resumen | Brief description of the order, it can match the value of purchases_items.[0].name or be sent with the empty value. | Ticket virtual a evento Ejemplo 2017 |
| forma_pago | Payment method in which the created order will be paid | 9 |
Sample data that Pagopar would return on success (returns the order hash):
```
{
"respuesta": true,
"resultado": [
{
"data": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
```

```
"pedido": "1750"
}
]
}
```

> ![Warning](https://img.zohostatic.com/zde/static/images/caution.png)The 'data' field is the one you will use in your database to associate the data of each order; this field is mandatory to store. On the other hand, the 'pedido' field is used purely for informational purposes

> ![Info](https://img.zohostatic.com/zde/static/images/info.png)Keep in mind, the value of result.data is the order identifier.

Sample data that Pagopar would return in case of error:
```
{
"respuesta": false,   "resultado": "Token no coincide."}
```
You can see the details of the [different types of errors](https://soporte.pagopar.com/portal/es/kb/articles/listado-de-errores-al-iniciar-transacci%C3%B3n) that the execution of the 'iniciar-transacción' endpoint might return.

## Step # 2: The commerce redirects to the Pagopar checkout page.

Description The commerce redirects to the page Checkout of Pagopar, with the data obtained in the first step. Before redirecting, the commerce identifier must be associated with the Order hash. Example in PHP:
```
<?php header('Location: https://www.pagopar.com/pagos/ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn'); exit(); ?>
```
Pagopar Checkout page:

![image](https://lh3.googleusercontent.com/CJuEC2Efs4jcErYNQIaLG75NuY9ynW1i511Mtjszkv31VTtqZGlMiZfg9JoYT86KWFYOghdaIt4iHjavX931o_7iRb-RVVymhosjJ9imKZZtEpv4c9QmL7PV8tqPOujlmlSBMKqZ)

Do you have automatic redirection permission? This feature is only available to some shops upon request and approval. This serves to “skip” Pagopar screen by implementing payment methods in the shop website, in such a way that final customer selects the payment method on the shop website, clicks “Finalize purchase” and won´t see Pagopar screen. You will only see the vPOS page to pay with a credit card (in case you have selected that payment method), and in case you have selected a collection point you will see the redirection screen of the shop site, not the Pagopar screen. To indicate which payment method have been selected, simply add the parameter when redirecting to the Pagopar platform.
```
https://www.pagopar.com/pagos/$hash?forma_pago=' + idPaymentMethod;
```
List of payment methods
| **Id** | **Payment Method** | **Image URL** |
| --- | --- | --- |
| 9 | Bancard - Credit/Debit Cards (Accepts Visa, Mastercard, American Express, Discover, Diners Club, and Credifielco. | [https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png](https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png) |
| 1 | Procard - Credit/Debit Cards (Accepts Visa, Mastercard, Credicard, and Unica). | [https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png](https://cdn.pagopar.com/assets/images/plugins/woocommerce/tarjetas-credito.png) |
| 2 | Aqui Pago | [https://cdn.pagopar.com/assets/images/pago-aquipago.png](https://cdn.pagopar.com/assets/images/pago-aquipago.png) |
| 3 | Pago Express | [https://cdn.pagopar.com/assets/images/pago-pagoexpress.png](https://cdn.pagopar.com/assets/images/pago-pagoexpress.png) |
| 4 | Practipago | [https://cdn.pagopar.com/assets/images/pago-practipago.png](https://cdn.pagopar.com/assets/images/pago-practipago.png) |
| 10 | Tigo Money | [https://cdn.pagopar.com/assets/images/pago-tigo-money.png](https://cdn.pagopar.com/assets/images/pago-tigo-money.png) |
| 11 | Transferencia Bancaria | [https://pago.pagopar.com/assets/images/metodos-pago/pago-manual.png](https://pago.pagopar.com/assets/images/metodos-pago/pago-manual.png) |
| 12 | Billetera Personal | [https://cdn.pagopar.com/assets/images/pago-billetera-personal.png](https://cdn.pagopar.com/assets/images/pago-billetera-personal.png) |
| 13 | Pago Móvil | [https://cdn.pagopar.com/assets/images/pago-infonet-pago-movil.png](https://cdn.pagopar.com/assets/images/pago-infonet-pago-movil.png) |
| 15 | Infonet Cobranzas | [https://cdn.pagopar.com/assets/images/pago-infonet.png](https://cdn.pagopar.com/assets/images/pago-infonet.png) |
| 18 | Zimple | [https://cdn.pagopar.com/assets/images/pago-zimple.png](https://cdn.pagopar.com/assets/images/pago-zimple.png) |
| 20 | Wally | [https://cdn.pagopar.com/assets/images/wally.png](https://cdn.pagopar.com/assets/images/wally.png) |
| 22 | Wepa | [https://cdn.pagopar.com/assets/images/wepa.png](https://cdn.pagopar.com/assets/images/wepa.png) |
| 23 | Giros Claro | [https://cdn.pagopar.com/assets/images/logos_Giros_Claro.png](https://cdn.pagopar.com/assets/images/logos_Giros_Claro.png) |
| 24 | QR payments | [https://cdn.pagopar.com/assets/images/pago-qr-app.png](https://cdn.pagopar.com/assets/images/pago-qr-app.png) |
List of payment methods via WSToken for this endpoint is generated:
```
sha1(Private_key + “FORMA-PAGO”)
```
In PHP: sha1($datos['comercio_token_privado'] . “FORMA-PAGO”) URL: [https://api.pagopar.com/api/forma-pago/1.1/traer/](https://api.pagopar.com/api/forma-pago/1.1/traer/)Method: POSTSample data that the shop will send to Pagopar:Content:
```
{
"token": "56c042541873efa67da5fa085cab8c6b4b41ca66",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf"
}
```
Sample data that Pagopar will return for the previous request:Content:
```
{
"respuesta": true,
"resultado": [
{
"forma_pago": "25",
"titulo": "PIX",
"descripcion": "PIX vía QR",
"monto_minimo": "1000",
"porcentaje_comision": "3.00"
},
{
"forma_pago": "24",
"titulo": "Pago QR",
"descripcion": "Pagá con la app de tu banco, financiera o cooperativa a través de un QR",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "18",
"titulo": "Zimple",
"descripcion": "Utilice sus fondos de Zimple",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "9",
"titulo": "Tarjetas de crédito",
"descripcion": "Acepta Visa, Mastercard, American Express, Cabal, Panal, Discover, Diners Club.",
"monto_minimo": "1000",
"porcentaje_comision": "6.82",
"pagos_internacionales": false
},
{
"forma_pago": "10",
"titulo": "Tigo Money",
"descripcion": "Utilice sus fondos de Tigo Money",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "11",
"titulo": "Transferencia Bancaria",
"descripcion": "Pago con transferencias bancarias. Los pagos se procesan de 08:30 a 17:30 hs.",
"monto_minimo": "1000",
"porcentaje_comision": "3.30"
},
{
"forma_pago": "12",
"titulo": "Billetera Personal",
"descripcion": "Utilice sus fondos de Billetera Personal",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "13",
"titulo": "Pago Móvil",
"descripcion": "Usando la App Pago Móvil / www.infonet.com.py",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "20",
"titulo": "Wally",
"descripcion": "Utilice sus fondos de Wally",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "23",
"titulo": "Giros Claro",
"descripcion": "Utilice sus fondos de Billetera Claro",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "22",
"titulo": "Wepa",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "2",
"titulo": "Aqui Pago",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "3",
"titulo": "Pago Express",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
},
{
"forma_pago": "15",
"titulo": "Infonet Cobranzas",
"descripcion": "Acercándose a las bocas de pagos habilitadas luego de confirmar el pedido",
"monto_minimo": "1000",
"porcentaje_comision": "6.82"
}
]
}
```

## Step # 3: Pagopar notifies the shop of the payment.

DescriptionPagopar makes a request to the response URL specifies in the option “Integrate with my website” of Pagopar.com. In this endpoint, the shop must put “paid” as the specified order in thier system, therefore this point is critical, because if someone knew the response URL, knowing the API and how it works, they could put as “Paid” some orders in the shop system. In order to avoid that, it is strictly necessary to validate the token before updating the order status to Paid. This avoids the aforementioned, since the private key is used to generate the token, which should never be shared or exposed. The shop must return Code 200, in case shop does not return that status Code, either due to a connectivity problem, a fallen server or similar, Pagopar will notify about the payment every 10 minutes until you get the correct answer.ObsThe value of public key and private key is obtained from the option “Integrate with my website” from Pagopar.com At this point Token is generated as follows: sha1(private_key + hash_pedido) URL: [https://api.misitio.com/pagopar/respuesta/](https://api.misitio.com/pagopar/respuesta/) Method: POST Sample data that Pagopar would send to the Merchant in case of a paid order:Content:

```
{
"resultado": [
{
"pagado": true,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": "2023-06-07 09:11:49.52895",
"monto": "100000.00",
"fecha_maxima_pago": "2023-06-14 09:11:32",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "9c2ed973536395bf3f91c43ffa925bacadcf58e5"
}
],
"respuesta": true
}
```
Sample data that the Merchant must respond to Pagopar in case of a paid order:Content:
```
[
{
"pagado": true,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": "2023-06-07 09:11:49.52895",
"monto": "100000.00",
"fecha_maxima_pago": "2023-06-14 09:11:32",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "9c2ed973536395bf3f91c43ffa925bacadcf58e5"
}
]
```
Sample data that Pagopar would send to the Merchant in case of a reversal:Content:
```
{
"resultado": [
{
"pagado": false,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-04 23:40:36",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
],
"respuesta": true
}
```
Sample data that the Merchant must respond to Pagopar in case of a reversed order:Content:

```
[
{
"pagado": false,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Tarjetas de crédito/débito",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-04 23:40:36",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "1",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
]
```
Sample data that Pagopar would send to the Merchant in case of a confirmed (pending payment) order for reversal:Content:
```
{
"resultado": [
{
"pagado": false,
"numero_comprobante_interno": "8230473",
"ultimo_mensaje_error": null,
"forma_pago": "Pagoexpress",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-04 23:40:36",
"hash_pedido": "ad57c9c94f745fdd9bc9093bb409297607264af1a904e6300e71c24f15d6ggnn",
"numero_pedido": "1746",
"cancelado": false,
"forma_pago_identificador": "3",
"token": "ef4f7ebd763e205a45a9fae5e5d8d7508235778d"
}
],
"respuesta": true
}
```

> ![Idea](https://static.zohocdn.com/zoho-desk-editor/static/images/lights.png)In terms of code: We recommend that the merchant directly returns the content of the JSON result sent by Pagopar, thus avoiding manually constructing the JSON, optimizing code and functionality (additional adjustments to JSON construction will be avoided in case there are updates in the structure of the JSON sent by Pagopar).

> ![Notes](https://img.zohostatic.com/zde/static/images/file.png)Obs: These payment notifications are made only when the payment for the order is completed and are done according to the transaction status (paid/reversed).

Example of Token validation in Woocommerce/PHP.:Content:

```
<?php $rawInput = file_get_contents('php://input');
```

```
$json_pagopar = json_decode($rawInput, true);
```

```
global $wpdb;
```

```
#We obtain the Order ID
```

```
$order_db = $wpdb->get_results($wpdb->prepare( "SELECT id FROM wp_transactions_pagopar WHERE hash = %s ORDER BY id DESC LIMIT 1", $json_pagopar['result'][0]['hash_pedido']));
```

```
#We obtain the Private Key
```

```
$db = new DBPagopar(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, "wp_transactions_pagopar");
```

```
$pedidoPagopar = new Pagopar(null, $db, $origin_pagopar);
```

```
$payments = WC()->payment_gateways->payment_gateways();
```

```
#If the tokens match, this validation is strictly mandatory to prevent malicious use of this endpoint
```

```
if (sha1($payments['pagopar']->settings['private_key'] . $json_pagopar['result'][0]['hash_pedido']) === $json_pagopar['resultado'][0]['token']) {
```

```
#We mark it as paid if it has already been paid
```

```
if (isset($order_db[0]->id)) {
```

```
if ($json_pagopar['result'][0]['pagado'] === true) {
```

```
$order_id = $order_db[0]->id;
```

```
global $woocommerce;
```

```
$customer_order = new WC_Order((int) $order_id);
```

```
//We mark the order as Paid
```

```
$customer_order->payment_complete();
```

```
$customer_order->update_status('completed', 'Order Completed/Paid.');
```

```
} elseif ($json_pagopar['result'][0]['pagado'] === false) {
```

```
//We mark the order as Pending
```

```
}
```

```
}
```

```
} else {
```

```
echo 'Token does not match';
```

```
return '';
```

```
}
```

```
echo json_encode($json_pagopar['result']);
```

```
?>
```

> ![Warning](https://img.zohostatic.com/zde/static/images/caution.png)It is extremely important to verify that the token sent by Pagopar is the same as the token generated by the merchant, to prevent individuals who may know your response URL from making requests and affecting the status of your orders, for example, marking them as Paid.

## Step # 4: Pagopar redirects to the shop´s payment result page.

Description Pagopar redirects to the result page specified in the option “Integrate with my website” from Pagopar.com, with the order hash. In that moment the shop makes a request to Pagopar to know the status of that order in real time, and accordingly it shows the message of Paid / Error when paying /Pending Payment. ObsThe value of public key and private key is obtained from the option “Integrate with my website” from Pagopar.com At this point the Token is generated as follows: Sha1(Private_key + "CONSULTA") Example URL to which Pagopar will redirect: https://[www.mywebsite.com/pagopar/result/](http://www.misitio.com/pagopar/resultado/)Method: GETThe URL to which the Merchant will make the request: [https://api.pagopar.com/api/pedidos/1.1/traer](https://api.pagopar.com/api/pedidos/1.1/traer)Method: POST Example data that the merchant will send to Pagopar:Content
```
{
"hash_pedido": "b1d98a906be9d0dc6956ead8642e0d6393abe9a6fd2743663109aa90e4d73e59",
"token": "56c042541873efa67da5fa085cab8c6b4b41ca66",
"token_publico": "63820974a40fe7c5c5c53c429af8b25bed599dbf"
}
```
Example data that Pagopar will return for the previous request:Content:
```
{
"respuesta": true,
"resultado": [
{
"pagado": false,
"forma_pago": "Pago Express",
"fecha_pago": null,
"monto": "100000.00",
"fecha_maxima_pago": "2018-01-05 02:09:37",
"hash_pedido": "b1d98a906be9d0dc6956ead8642e0d6393abe9a6fd2743663109aa90e4d73e59",
"numero_pedido": "1750",
"cancelado": true,
"forma_pago_identificador": "3",
"token": "fa443e1b63c7a51bd14732ed22098c62b7ebb4dd",
"mensaje_resultado_pago": {
"titulo": "Pedido pendiente de pago",
"descripcion": "<ul><li>  Eligió pagar con Pago Express, recuerde que tiene hasta las
```

```
02:09:37 del 05/01/2018 para pagar.</li><li>  Debe ir a boca de cobranza de Pago Express,
```

```
decir que quiere pagar el comercio <strong>Pagopar</strong>, mencionando su cédula <strong>
```

```
0</strong> o número de pedido <strong>1.750</strong>.</li></ul>"
}
}
]
}
```

![Pagina de redireccionamiento](https://lh4.googleusercontent.com/sSlofPyZi9B16cucD6PMSpGG0ZZ18BXWHs4IFa32_Tl6idxDvMu7QHZOUBabhFbc8_IUUZ69GBBDk5e-6B9kOU2Ld9YFZM0b3cLTpP76e0SAb98M_ca_Jiebt_U_fi-k1sSoQYDY)

Pagina de redireccionamiento

> ![Info](https://img.zohostatic.com/zde/static/images/info.png)Following the completion of the steps in this documentation, the only remaining task is to [transition to production](https://soporte.pagopar.com/portal/es/kb/articles/entornos-pase-a-producci%C3%B3n).

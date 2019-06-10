import http from "k6/http";
import { parseHTML } from "k6/html";
import { check } from "k6";

import * as config from "./config.js";


export default function() {
    let res = http.get(config.BASE_URL + config.PRODUCT_URL, {
        tags: {
            my_tag: "PRODUCT-VIEW"
        }
    });

    check(res, {
        "status is 200": (r) => r.status === 200
    });

    res = http.post(config.BASE_URL + config.PRODUCT_URL, {
            "quantity": 1,
            "add-to-cart": config.PRODUCT_ID,
        },
        {
            tags: {
                my_tag: "ADD-TO-CART"
            }
        }
    );

    check(res, {
        "add to cart - 200": (r) => r.status === 200,
        "has cookie 'woocommerce_cart_hash'": (r) => r.cookies.woocommerce_cart_hash.length > 0,
        "has cookie 'woocommerce_recently_viewed'": (r) => r.cookies.woocommerce_recently_viewed.length > 0,
    });

    let cookies = {}
    for (const cookie in res.cookies) {
        const lastCookie = res.cookies[cookie][0].value
        cookies[cookie] = lastCookie
    }

    res = http.get(config.BASE_URL + config.CHECKOUT_URL, {
        cookies,
        tags: {
            my_tag: "VIEW-CHECKOUT"
        }
    });
    check(res, {
        "checkout - 200": (r) => r.status === 200,
    });
    const doc = parseHTML(res.body);
    const nonce = doc.find("#woocommerce-process-checkout-nonce").val();

    res = http.get("http://requestbin.fullcontact.com/108tzy31", {cookies, tag: {mytag: "yey"}})

    const payload = {
        "billing_first_name": "Vlad",
        "billing_last_name": "Temian",
        "billing_company": "",
        "billing_country": "RO",
        "billing_address_1": "str. Electronicii, nr.10",
        "billing_address_2": "",
        "billing_city": "Timisoara",
        "billing_state": "TM",
        "billing_postcode": "300694",
        "billing_phone": "0740000000",
        "billing_email": "vladtemian@gmail.com",
        "shipping_first_name": "",
        "shipping_last_name": "",
        "shipping_company": "",
        "shipping_country": "RO",
        "shipping_address_1": "",
        "shipping_address_2": "",
        "shipping_city": "",
        "shipping_state": "",
        "shipping_postcode": "",
        "order_comments": "",
        "shipping_method[0]": "flat_rate:1",
        "payment_method": "bacs",
        "woocommerce-process-checkout-nonce": nonce,
        "_wp_http_referer": "/checkout/"
    }

    res = http.post(config.BASE_URL + "/?wc-ajax=checkout", payload,
        {
            cookies,
            tags: {
                my_tag: "BUY"
            }
        }
    );

    check(res, {
        "buy - 200": (r) => r.status === 200,
    });
}

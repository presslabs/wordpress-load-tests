import { check, sleep } from 'k6'
import http, { Response } from 'k6/http'
import { parseHTML } from 'k6/html'

import papaparse, { ParseResult } from 'papaparse'
import slug from 'slugify'

import {
    map, flatMap, filter, get, uniq, parseInt,
    replace, split, trim, toString, toLower,
    has, isEmpty, isString
} from 'lodash'


const SHOP_URL = __ENV.SHOP_URL || 'http://localhost:8080/'

//
//  SAMPLE DATA

export type Product = {
    id: number
    sku: string
    name: string
    categories: string[]
}

function isValidProduct(productData: object) {
    return (
        !isEmpty(get(productData, '\ufeffID'))
        && get(productData, 'Type') === 'simple'
        && get(productData, 'Published') === '1'
        && get(productData, 'In stock?') === '1'
    )
}

function toProduct(productData: object): Product {
    return {
        id: parseInt(get(productData, '\ufeffID')),
        sku: get(productData, 'SKU'),
        name: get(productData, 'Name'),
        categories: map(split(get(productData, 'Categories'), ' > '), toLower)
    }
}

export function loadSeedData() {
    const parsedData: ParseResult<object> = papaparse.parse(open('../sample_products.csv'), { header: true })
    const filteredData = filter(parsedData.data, isValidProduct)
    const products = map(filteredData, toProduct)
    const categories = uniq(flatMap(products, 'categories'))

    return {
        products,
        categories
    }
}


//
//  RESPONSE CHECKS

export function isOK(response: Response): boolean {
    return response.status === 200
}

export function hasCookie(name: string): (response: Response) => boolean {
    return (response: Response) => {
        return has(response.cookies, name)
    }
}

export function hasElementWithText(selector: string, text: string): (response: Response) => boolean {
    return (response: Response) => {
        if (!isString(response.body)) {
            return false
        }

        const doc = parseHTML(response.body)
        const element = doc.find(selector)
        return element && trim(element.text()) === text
    }
}


//
//  URL BUILDERS

export function shopURL(path: string) {
    const pathname = path[0] === '/' ? path : `/${path}`
    const baseURL = replace(SHOP_URL, /\/$/, '')
    return `${baseURL}${pathname}`
}

export function productURL(product: Product) {
    return shopURL(`/product/${slug(product.name)}`)
}

export function categoryURL(category: string) {
    return shopURL(`/product-category/${category}`)
}

export function cartURL() {
    return shopURL('/cart')
}

export function checkoutURL() {
    return shopURL('/checkout')
}

export function ajaxURL(method: string) {
    return shopURL(`/?wc-ajax=${method}`)
}




//
//  NAVIGATION

export function openProductPage(product: Product): Response {
    const response = http.get(productURL(product))
    check(response, { isOK })
    sleep(1)
    return response
}

export function openCategoryPage(category: string): Response {
    const response = http.get(categoryURL(category))
    check(response, { isOK })
    sleep(1)
    return response
}

export function openCart(): Response {
    const response = http.get(cartURL())
    check(response, { isOK })
    sleep(1)
    return response
}

export function openCheckout(): Response {
    const response = http.get(checkoutURL())
    check(response, { isOK })
    sleep(1)
    return response
}

export function addToCart(product: Product): Response {
    const response = http.post(productURL(product), {
        quantity: toString(1),
        'add-to-cart': toString(product.id)
    })

    const isAddedToCart = hasElementWithText('div.woocommerce-message', `View cart “${product.name}” has been added to your cart.`)
    const hasCartCookie = hasCookie('woocommerce_cart_hash')

    check(response, { isOK, isAddedToCart, hasCartCookie })

    sleep(1)
    return response
}

export function placeOrder(): Response {
    const checkout = openCheckout()
    const response = checkout.submitForm({
        formSelector: 'form.checkout',
        fields: {
            'billing_first_name': 'John',
            'billing_last_name': 'Doe',
            'billing_address_1': 'str. Street, nr.10',
            'billing_city': 'City',
            'billing_postcode': '300000',
            'billing_phone': '0740000000',
            'billing_email': 'jd@not-a-valid-mail.com'
        }
    })

    const isOrderSuccessfull = hasElementWithText('h1.entry-title', 'Order received')

    check(response, { isOK, isOrderSuccessfull })
    sleep(3)
    return response
}

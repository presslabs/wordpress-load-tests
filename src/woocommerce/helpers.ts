import { check, fail, sleep } from 'k6'
import http, { Response } from 'k6/http'
import { parseHTML } from 'k6/html'
import { b64encode } from 'k6/encoding'

import {
    flatMap, filter, join, uniq,
    parseInt, replace, trim, toString,
    has, isEmpty, isString
} from 'lodash'

const SITE_URL = __ENV.SITE_URL || 'http://localhost:8080/'
const STEP_SLEEP = __ENV.STEP_SLEEP_DURATION ? parseInt(__ENV.STEP_SLEEP_DURATION) : 1

//
//  SAMPLE DATA

export type Product = {
    id: number
    sku: string
    name: string
    permalink: string
    type: 'simple' | 'grouped' | 'external' | 'variable'
    status: 'draft' | 'pending' | 'private' | 'publish'
    catalog_visibility: 'visible' | 'search' | 'hidden'
    stock_status: 'instock' | 'outofstock' | 'onbackorder'
    purchasable: boolean
    downloadable: boolean
    manage_stock: boolean
    stock_quantity: number
    categories: Category[]
}

export type Category = {
    id: number
    name: string
    slug: string
}

export type SeedData = {
    products: Product[],
    categories: Category[]
}

function isValidProduct(product: Product) {
    const isValid = (
        !isEmpty(product.permalink)
        && product.type === 'simple'
        && product.catalog_visibility === 'visible'
        && (product.manage_stock === false || (product.stock_status === 'instock' && product.stock_quantity > 0))
        && product.purchasable === true
        && product.downloadable === false
    )
    return isValid
}

export function loadSeedData(): SeedData {
    const response = wooAPIFetch('products')
    if (!check(response, { isOK })) {
        return {
            products: [],
            categories: []
        }
    }

    const parsedData = JSON.parse(toString(response.body))
    const products = filter(parsedData, isValidProduct)
    const categories = uniq(flatMap(products, 'categories'))

    return {
        products,
        categories
    }
}

function wait() {
    sleep(STEP_SLEEP)
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

export function siteURL(path: string) {
    const pathname = path[0] === '/' ? path : `/${path}`
    const baseURL = replace(SITE_URL, /\/$/, '')
    return `${baseURL}${pathname}`
}

export function productURL(product: Product) {
    return product.permalink
}

export function categoryURL(category: Category) {
    return siteURL(`/product-category/${category.slug}`)
}

export function cartURL() {
    return siteURL('/cart')
}

export function checkoutURL() {
    return siteURL('/checkout')
}

export function ajaxURL(method: string) {
    return siteURL(`/?wc-ajax=${method}`)
}

export function APIURL(endpoint: string, version: number = 3) {
    return siteURL(`/wp-json/wc/v${version}/${endpoint}`)
}




//
//  NAVIGATION

export function wooAPIFetch(endpoint: string): Response {
    if (isEmpty(__ENV.API_KEY) || isEmpty(__ENV.API_SECRET)) {
        fail('Missing API_KEY and/or API_SECRET')
    }

    const credentials = join([__ENV.API_KEY, __ENV.API_SECRET], ':')
    const response = http.get(APIURL(endpoint), {
        headers: {
            Authorization: `Basic ${b64encode(credentials)}`
        }
    })
    check(response, { isOK })
    return response
}

export function openProductPage(product: Product): Response {
    const response = http.get(productURL(product))
    check(response, { isOK })
    wait()
    return response
}

export function openCategoryPage(category: Category): Response {
    const response = http.get(categoryURL(category))
    check(response, { isOK })
    wait()
    return response
}

export function openCart(): Response {
    const response = http.get(cartURL())
    check(response, { isOK })
    wait()
    return response
}

export function openCheckout(): Response {
    const response = http.get(checkoutURL())
    check(response, { isOK })
    wait()
    return response
}

export function addToCart(product: Product): Response {
    const response = http.post(productURL(product), {
        quantity: toString(1),
        'add-to-cart': toString(product.id)
    })

    const isAddedToCart = hasElementWithText('div.woocommerce-message', `View cart “${product.name}” has been added to your cart.`)
    const hasCartCookie = hasCookie('woocommerce_cart_hash')

    const added = check(response, { isOK, isAddedToCart, hasCartCookie })

    if (!added) {
        fail(`Failed to add "${product.name}" to cart!`)
    }

    wait()
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
            'billing_email': `jd_vu${__VU}_iter${__ITER}@not-a-valid-mail.com`
        }
    })

    const isOrderSuccessfull = hasElementWithText('h1.entry-title', 'Order received')

    check(response, { isOK, isOrderSuccessfull })
    wait()
    return response
}

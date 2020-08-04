import { fail, sleep } from 'k6'
import { Options } from 'k6/options'

import { sample, isEmpty } from 'lodash'

import {
    Product,
    Category,
    SeedData,
    loadSeedData,
    openCategoryPage,
    openProductPage,
    addToCart,
    openCart,
    placeOrder
} from '../woocommerce/helpers'

export const options: Options = {
    vus      : __ENV.K6_VUS ? parseInt(__ENV.K6_VUS) : 5,
    duration : __ENV.K6_DURATION || '60s'
}

export function setup() {
    return loadSeedData()
}

export default (data: SeedData) => {
    const { products, categories } = data

    if (isEmpty(products) || isEmpty(categories)) {
        fail('Cannot read products from shop.')
        return
    }

    openCategoryPage(sample(categories) as Category)
    sleep(1)
    openCategoryPage(sample(categories) as Category)
    sleep(1)
    openCategoryPage(sample(categories) as Category)
    sleep(1)

    const product1 = sample(products) as Product
    openProductPage(product1)
    sleep(1)
    addToCart(product1)
    sleep(1)

    const product2 = sample(products) as Product
    openProductPage(product2)
    sleep(1)
    addToCart(product2)
    sleep(1)

    openCart()
    sleep(1)
    placeOrder()
    sleep(1)
}

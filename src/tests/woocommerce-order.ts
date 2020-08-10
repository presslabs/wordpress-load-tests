import { fail } from 'k6'
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


export const options: Options = __ENV.K6_STAGES ? {} : {
    vus      : __ENV.K6_VUS ? parseInt(__ENV.K6_VUS) : 5,
    duration : __ENV.K6_DURATION || '60s'
}


export function setup() {
    const data = loadSeedData()
    const { products, categories } = data

    if (isEmpty(products) || isEmpty(categories)) {
        fail('Cannot read products from shop.')
        return null
    }

    return data
}

export default (data: SeedData) => {
    const { products, categories } = data

    openCategoryPage(sample(categories) as Category)
    openProductPage(sample(products) as Product)
    openProductPage(sample(products) as Product)
    openCategoryPage(sample(categories) as Category)
    openCategoryPage(sample(categories) as Category)
    openProductPage(sample(products) as Product)
    openCategoryPage(sample(categories) as Category)
    openProductPage(sample(products) as Product)
    const product1 = sample(products) as Product
    openProductPage(product1)
    addToCart(product1)

    const product2 = sample(products) as Product
    openProductPage(product2)
    addToCart(product2)

    openCart()
    placeOrder()
}

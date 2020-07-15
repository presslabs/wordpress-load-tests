import { fail } from 'k6'
import { Options } from 'k6/options'

import { sample, isEmpty } from 'lodash'

import {
    Product,
    loadSeedData,
    openCategoryPage,
    openProductPage,
    addToCart,
    openCart,
    placeOrder
} from '../woocommerce/helpers'

export const options: Options = {
    vus        : __ENV.VUS ? parseInt(__ENV.VUS) : 10,
    duration   : __ENV.DURATION || '20s',
    iterations : __ENV.ITERATIONS ? parseInt(__ENV.ITERATIONS) : undefined
}

const { products, categories } = loadSeedData()

export default () => {
    if (isEmpty(products) || isEmpty(categories)) {
        fail('The shop appears to not have any sample data.')
    }

    openCategoryPage(sample(categories) as string)
    openCategoryPage(sample(categories) as string)
    openCategoryPage(sample(categories) as string)

    const product1 = sample(products) as Product
    openProductPage(product1)
    addToCart(product1)

    const product2 = sample(products) as Product
    openProductPage(product2)
    addToCart(product2)

    openCart()
    placeOrder()
}

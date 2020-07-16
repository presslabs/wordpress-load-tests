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
    vus      : __ENV.K6_VUS ? parseInt(__ENV.K6_VUS) : 5,
    duration : __ENV.K6_DURATION || '60s'
}

const { products, categories } = loadSeedData('../sample_products.csv')

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

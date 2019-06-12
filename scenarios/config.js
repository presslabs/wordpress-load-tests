export const BASE_URL = `${__ENV.SCENARIO_URL}`;

export const VUs = `${__ENV.SCENARIO_VUS || 100}`;
export const DURATION = `${__ENV.SCENARIO_DURATION || "30s"}`;
export const TAG = `${__ENV.SCENARIO_TAG || Date.now().toString()}`;

export const CACHE_BYPASS_PARAM = `${__ENV.SCENARIO_CACHE_BYPASS_PARAM || "?nocache"}`;

export const PRODUCT_URL = `${__ENV.SCENARIO_PRODUCT_URL || "/product/fiery-valiant-moth-of-painting/"}`;
export const PRODUCT_ID = `${__ENV.SCENARIO_PRODUCT_ID || "5177"}`;
export const CHECKOUT_URL = `${__ENV.SCENARIO_CHECKOUT_URL ||"/checkout/"}`;

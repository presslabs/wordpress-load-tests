export const BASE_URL = `${__ENV.SCENARIO_URL}`;

export const VUs = `${__ENV.SCENARIO_VUS || 100}`;
export const DURATION = `${__ENV.SCENARIO_DURATION || "30s"}`;

export const CACHE_BYPASS_PARAM = `${__ENV.SCENARIO_CACHE_BYPASS_PARAM || "?nocache"}`;

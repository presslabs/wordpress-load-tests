import http from "k6/http";
import { sleep } from "k6";

import * as config from "./config.js";
import base from "./base.js";


export let options = {
  vus: config.VUs,
  duration: config.DURATION,
};

export default function() {
    base();
};

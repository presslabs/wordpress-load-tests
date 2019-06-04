import http from "k6/http";
import * as config from "./config.js";


export default function() {
    http.get(config.BASE_URL);
};

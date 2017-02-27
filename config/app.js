"use strict";

const config = {
    host: process.env.HOST,
    name: process.env.APP_NAME,
    stage: process.env.STAGE || "",
    port: process.env.PORT
};

export default config;
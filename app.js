"use strict";

import Koa from "koa";
import serve from "koa-static";
import compress from "koa-compress";
import koaLogger from "koa-logger";
import convert from "koa-convert";
import json from "koa-json";
import bodyParser from "koa-bodyparser";
import logger from "./config/logger";
import config from "./config/app";
import router from "./config/routes";
import catchError from "./api/middlewares/catchError";
import bootstrap from "./config/bootstrap";

process.on("uncaughtException", async(err) => {
    process.exit(1);
});

process.on("unhandledRejection", async(err) => {
    process.exit(1);
});

process.on("SIGINT", function() {
    logger.info("Got SIGINT - stop application");
    process.exit(0);
});

const app = new Koa();

app.on("error", async(err) => {
    process.exit(1);
});

bootstrap()
    .then(() => {
        app.use(catchError);
        app.use(convert(bodyParser()));
        app.use(convert(json()));
        app.use(convert(koaLogger()));
        app.use(convert(router.routes()));
        app.use(convert(router.allowedMethods()));
        app.use(convert(compress()));
        app.use(convert(serve(__dirname + "/public")));

        app.listen(config.port, () => logger.info(`Server started at ${config.port}`));
    })
    .catch(async(err) => {
        logger.error("Application bootstrapping error: ", err);
        process.exit(1);
    });

export default app;
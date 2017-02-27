"use strict";

import Router from "koa-router";
import IndexController from "../api/controllers/IndexController";

const router = Router({
    prefix: "/api/v1"
});

router.get("/health", IndexController.health);

export default router;
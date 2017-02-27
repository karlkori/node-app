"use strict";

import winston from "winston";

const logger = new winston.Logger({
	level: process.env.LOF_LEVEL || "info",
	transports: [
		new (winston.transports.Console)()
	]
});

export default logger;
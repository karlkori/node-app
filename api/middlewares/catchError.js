"use strict";

import AppError from "../services/AppError";
import logger from "../../config/logger";
import _ from "lodash";

const catchError = async (ctx, next) => {
	try {
		await next();
	} catch (err) {

		/** Handle MongoDB errors */
		if (err.name === "MongoError" && err.code === 11000) {
			// Duplicate unique field (email)
			ctx.status = 400;
			ctx.body = {
				error: {
					message: "Email already exists."
				}
			};
			return;
		}

		/** Handle Mongoose validation  errors */
		if (err.name && err.name === "ValidationError" && err.errors) {

			let errorMessage = "";
			_.each(err.errors, (e) => {
				errorMessage += e.message;
			});

			ctx.status = 400;
			ctx.body = {
				error: {
					message: errorMessage
				}
			};
			return;
		}

		/** Handle custom App errors */
		if (err instanceof AppError) {
			logger.info("AppError", err.httpStatus, err.message);

			ctx.status = err.httpStatus;
			ctx.body = {
				error: {
					message: err.message
				}
			};
			return;
		}

		/** Unhandled errors and exceptions */
		logger.error("Error", err);
		ctx.status = 500;
		ctx.body = {
			error: {
				message: "Server error",
				developerMessage: err.message
			}
		};

	}
};

export default catchError;
import {
	deleteExpenses,
	getExpenses,
	postExpenses,
	putExpenses,
} from "../controllers/users.controller.js";
import { Router } from "express";
import {
	checkRequestToken,
	validateToken,
} from "../middlewares/token.middleware.js";
import {
	findExpenses,
	checkReqExpenses,
	checkItemReq,
	checkPutPayload,
} from "../middlewares/user.middleware.js";

const route = Router();

route.get(
	"/expenses",
	checkRequestToken,
	validateToken,
	findExpenses,
	getExpenses
);

route.post(
	"/expenses",
	checkRequestToken,
	validateToken,
	checkReqExpenses,
	postExpenses
);

route.delete(
	"/expenses",
	checkRequestToken,
	validateToken,
	checkItemReq,
	deleteExpenses
);

route.put(
	"/expenses",
	checkRequestToken,
	validateToken,
	checkPutPayload,
	putExpenses
);

export default route;

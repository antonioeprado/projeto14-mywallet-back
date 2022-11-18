export async function findExpenses(req, res, next) {
	const { userId } = req.user.userId;
	const userExpenses = await userExpensesCollection.findOne({
		userId,
	});
	if (!userExpenses || userExpenses.expenses.length === 0) {
		return res.sendStatus(200);
	}
	req.expenses = userExpenses;
	next();
}

export async function checkReqExpenses(req, res, next) {
	const expenses = req.body;
	if (!expenses) return res.sendStatus(400);
	req.expenses = expenses;
	next();
}

export async function checkItemReq(req, res, next) {
	const { item } = req.body;
	if (!item) return res.sendStatus(400);
	req.item = item;
	next();
}

export async function checkPutPayload(req, res, next) {
	if (!req.body) return res.sendStatus(400);
	next();
}

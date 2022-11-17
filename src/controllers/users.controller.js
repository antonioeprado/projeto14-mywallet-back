import dayjs from "dayjs";
import { validateToken } from "./auth.controller.js";
import { userExpensesCollection } from "../db/mongodb.js";

export const getExpenses = async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	if (!user) {
		return res.status(404).send("Invalid token!");
	}
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	const aggPipeline = [
		{
			$match: { userId: user.userId },
		},
		{
			$unwind: "$expenses",
		},
		{
			$group: {
				_id: null,
				total: { $sum: "$expenses.value" },
			},
		},
	];
	const sum = await userExpensesCollection.aggregate(aggPipeline).toArray();
	userExpenses.total = sum.pop().total.toLocaleString("pt-BR");
	userExpenses.expenses.forEach((expense) => {
		expense.value = expense.value.toLocaleString("pt-BR");
	});
	res.status(200).send(userExpenses);
};

export const postExpenses = async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	const expenses = req.body;
	if (!user) res.status(404).send("Invalid token!");
	if (!expenses) res.sendStatus(400);
	const { value, description, type } = expenses;
	if (value.includes(",")) value.replace(",", ".");
	const date = dayjs().format("DD/MM");
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	if (!userExpenses) {
		await userExpensesCollection.insertOne({
			userId: user.userId,
			expenses: [{ item: 1, value: Number(value), description, type, date }],
		});
		return res.sendStatus(201);
	}
	const index = userExpenses.expenses.length + 1;
	const expense = { index, value: Number(value), description, type, date };
	await userExpensesCollection.updateOne(userExpenses, {
		$push: { expenses: expense },
	});
	res.sendStatus(201);
};

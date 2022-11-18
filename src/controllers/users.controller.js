import dayjs from "dayjs";
import { validateToken } from "./auth.controller.js";
import { userExpensesCollection } from "../database/mongodb.js";

export const getExpenses = async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	if (!user) {
		return res.status(404).send("Invalid token!");
	}
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	if (!userExpenses || userExpenses.expenses.length === 0) {
		return res.sendStatus(200);
	}

	const aggPipeline = [
		{
			$match: { userId: user.userId },
		},
		{
			$unwind: "$expenses",
		},
		{
			$project: {
				value: {
					$cond: {
						if: { $eq: ["$expenses.type", "in"] },
						then: "$expenses.value",
						else: { $multiply: ["$expenses.value", -1] },
					},
				},
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: "$value" },
			},
		},
	];
	const aggResult = await userExpensesCollection
		.aggregate(aggPipeline)
		.toArray();
	const total = aggResult.pop().total;
	userExpenses.total = total;
	res.status(200).send(userExpenses);
};

export const postExpenses = async (req, res) => {
	const user = await validateToken(req.headers.authorization);
	const expenses = req.body;
	if (!user) res.status(404).send("Invalid token!");
	if (!expenses) res.sendStatus(400);
	const { value, description, type } = expenses;
	const date = dayjs().format("DD/MM");
	const userExpenses = await userExpensesCollection.findOne({
		userId: user.userId,
	});
	if (!userExpenses) {
		await userExpensesCollection.insertOne({
			userId: user.userId,
			expenses: [
				{
					item: 1,
					value: parseFloat(value),
					description,
					type,
					date,
				},
			],
		});
		return res.sendStatus(201);
	}
	const item = userExpenses.expenses.length + 1;
	const expense = {
		item,
		value: parseFloat(value),
		description,
		type,
		date,
	};
	await userExpensesCollection.updateOne(userExpenses, {
		$push: { expenses: expense },
	});
	res.sendStatus(201);
};

export const deleteExpenses = async (req, res) => {
	const { item } = req.body;
	const { userId } = await validateToken(req.headers.authorization);
	if (!userId) return res.status(404).send("Invalid token!");
	try {
		await userExpensesCollection.updateOne(
			{ userId },
			{ $pull: { expenses: { item } } }
		);
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
	}
};

export const putExpenses = async (req, res) => {
	const { userId } = await validateToken(req.headers.authorization);
	const { value, description, type, item } = req.body;
	if (!userId) return res.status(404).send("Invalid token!");
	try {
		await userExpensesCollection.updateOne(
			{ userId, "$expenses.item": item },
			{
				$set: {
					item,
					value,
					description,
					type,
				},
			}
		);
	} catch (error) {
		console.log(error);
	}
};

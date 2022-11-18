import dayjs from "dayjs";
import { userExpensesCollection } from "../database/mongodb.js";

export const getExpenses = async (req, res) => {
	const { userId } = req.user.userId;
	const aggPipeline = [
		{
			$match: { userId },
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
	const { value, description, type } = req.expenses;
	const date = dayjs().format("DD/MM");
	const userExpenses = await userExpensesCollection.findOne({
		userId: req.user.userId,
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
	const { item } = req.item;
	const { userId } = req.user.userId;
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
	const { userId } = req.user.userId;
	const { value, description, type, item } = req.body;
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
		res.sendStatus(200);
	} catch (error) {
		console.log(error);
	}
};

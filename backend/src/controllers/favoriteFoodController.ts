import { Request, Response } from "express";
import FavoriteFood from "../models/FavoriteFood";

export const addFavoriteFood = async (req: Request, res: Response) => {
  const { name, calories, protein, carbs, fat } = req.body;
  const user = req.user;
  if (!name) return res.status(400).json({ message: "Name required" });
  const fav = await FavoriteFood.create({
    user: user._id,
    name,
    calories,
    protein,
    carbs,
    fat,
  });
  res.status(201).json(fav);
};

export const getFavoriteFoods = async (req: Request, res: Response) => {
  const favs = await FavoriteFood.find({ user: req.user._id });
  res.json(favs);
};

export const deleteFavoriteFood = async (req: Request, res: Response) => {
  const { id } = req.params;
  await FavoriteFood.findOneAndDelete({ _id: id, user: req.user._id });
  res.json({ message: "Deleted" });
};

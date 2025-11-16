import mongoose from "mongoose";

const FavoriteFoodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

export default mongoose.model("FavoriteFood", FavoriteFoodSchema);

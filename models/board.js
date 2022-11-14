const mongoose = require("mongoose");
//const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const boardSchema = new Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  tasks: [{ type: mongoose.Types.ObjectId, required: true, ref: "Task" }],
});

module.exports = mongoose.model("Board", boardSchema);

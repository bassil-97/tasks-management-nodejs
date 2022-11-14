const mongoose = require("mongoose");
//const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  priority: { type: String, required: true },
  boardId: { type: mongoose.Types.ObjectId, required: true, ref: "Board" },
});

module.exports = mongoose.model("Task", taskSchema);

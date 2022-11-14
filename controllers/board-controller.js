const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const Board = require("../models/board");
const User = require("../models/user");
const Task = require("../models/task");

//get all boards

const getBoards = async (req, res, next) => {
  let boards;
  try {
    boards = await Board.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching boards failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    boards: boards.map((board) => board.toObject({ getters: true })),
  });
};

// get board by id

const getBoardById = async (req, res, next) => {
  const boardId = req.params.boardId;

  let board;
  let tasks;
  try {
    board = await Board.findById(boardId);
    tasks = await Task.find({ boardId: boardId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find board.",
      500
    );
    return next(error);
  }

  if (!board) {
    const error = new HttpError(
      "Could not find board for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ board: board.toObject({ getters: true }), tasks: tasks });
};

// create new board
const createBoard = async (req, res, next) => {
  /*const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  } */

  const { title, creator } = req.body;

  const createdBoard = new Board({
    title,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating board failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBoard.save({ session: sess });
    user.boards.push(createdBoard);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating board failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ board: createdBoard });
};

// get task by id

const getTaskById = async (req, res, next) => {
  const taskId = req.params.taskId;

  let task;
  try {
    task = await Task.findById(taskId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find task.",
      500
    );
    return next(error);
  }

  if (!task) {
    const error = new HttpError(
      "Could not find task for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ task: task.toObject({ getters: true }) });
};

// add new task

const addNewTask = async (req, res, next) => {
  const boardId = req.params.boardId;
  const { title, description, status, priority } = req.body;

  const createdTask = new Task({
    title,
    description,
    status,
    priority,
    boardId,
  });

  let board;
  try {
    board = await Board.findById(boardId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find board.",
      500
    );
    return next(error);
  }

  if (!board) {
    const error = new HttpError(
      "Could not find board for the provided id.",
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdTask.save({ session: sess });
    board.tasks.push(createdTask);
    await board.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating task failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ task: createdTask });
};

const updateTask = async (req, res, next) => {
  /* const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  */

  const { title, description, status, priority } = req.body;
  const taskId = req.params.taskId;

  let task;
  try {
    task = await Task.findById(taskId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update task.",
      500
    );
    return next(error);
  }

  task.title = title;
  task.description = description;
  task.status = status;
  task.priority = priority;

  try {
    await task.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update task.",
      500
    );
    return next(error);
  }

  res.status(200).json({ task: task.toObject({ getters: true }) });
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.taskId;

  let task;
  try {
    task = await Task.findById(taskId).populate("boardId");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete task.",
      500
    );
    return next(error);
  }

  if (!task) {
    const error = new HttpError("Could not find task for this id.", 404);
    return next(error);
  }

  {
    /* if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      401
    );
    return next(error);
  }*/
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await task.remove({ session: sess });
    task.boardId.tasks.pull(task);
    await task.boardId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete task.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Task place." });
};

exports.getBoards = getBoards;
exports.getBoardById = getBoardById;
exports.createBoard = createBoard;
exports.getTaskById = getTaskById;
exports.addNewTask = addNewTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;

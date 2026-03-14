import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createOrGetRoom,
  getRooms,
  getMessagesByRoom,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/rooms", userAuth, getRooms);
messageRouter.post("/rooms", userAuth, createOrGetRoom);
messageRouter.get("/:roomId", userAuth, getMessagesByRoom);
messageRouter.post("/:roomId", userAuth, sendMessage);

export default messageRouter;

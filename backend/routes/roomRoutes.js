import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  toggleCloseRoom,
  getRoomsByStaff,
} from "../controllers/roomController.js";

const roomRoutes = express.Router();

roomRoutes.route("/").post(userAuth, createRoom).get(getRooms);
roomRoutes.route("/get-rooms-staff").get(userAuth, getRoomsByStaff);
roomRoutes
  .route("/:id")
  .get(getRoomById)
  .put(userAuth, updateRoom)
  .delete(userAuth, deleteRoom);
roomRoutes.route("/:id/toggle-close").put(userAuth, toggleCloseRoom);

export default roomRoutes;

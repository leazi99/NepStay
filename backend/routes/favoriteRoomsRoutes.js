import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  saveRoom,
  unsaveRoom,
  getFavoriteRooms,
} from "../controllers/favoriteRoomsController.js";

const favoriteRoomsRoutes = express.Router();

favoriteRoomsRoutes.post("/save/:roomId", userAuth, saveRoom);
favoriteRoomsRoutes.post("/save/:jobId", userAuth, saveRoom);
favoriteRoomsRoutes.delete("/unsave/:roomId", userAuth, unsaveRoom);
favoriteRoomsRoutes.delete("/unsave/:jobId", userAuth, unsaveRoom);
favoriteRoomsRoutes.get("/", userAuth, getFavoriteRooms);

export default favoriteRoomsRoutes;

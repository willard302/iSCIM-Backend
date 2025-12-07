import {Router} from "express";
import {updateUser, deleteUser} from "../controllers/usersController.js";

const router = Router();

router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
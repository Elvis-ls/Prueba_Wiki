/*import { Request, Response } from "express";
import { validateCheckUserExistsData } from "../validators/checkUserExists.validator";
import { findUserByCompleteData } from "../services/user.service";

export const checkIfUserExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, lastName, cedula, accountNumber } = validateCheckUserExistsData(req.body);

    const existingUser = await findUserByCompleteData(name, lastName, cedula, accountNumber);

    res.status(200).json({
      exists: !!existingUser,
      user: existingUser || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error del servidor",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};*/
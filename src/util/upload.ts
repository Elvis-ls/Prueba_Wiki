import multer from "multer";

const storage = multer.memoryStorage(); // Guarda en memoria como Buffer
export const upload = multer({ storage });
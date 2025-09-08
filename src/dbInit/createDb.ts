import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const dbName = process.env.DB_NAME || "banco_db";

  //Conectarse a la DB default 'postgres'
  const client = new Client({
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: "postgres",
  });

  await client.connect();

  // Verificar si existe la DB
  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
  );

  // Crear DB si no existe
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`Base de datos '${dbName}' creada`);
  } else {
    console.log(`Base de datos '${dbName}' ya existe`);
  }

  await client.end();
}

main().catch((err) => {
  console.error("Error creando la base de datos:", err);
  process.exit(1);
});
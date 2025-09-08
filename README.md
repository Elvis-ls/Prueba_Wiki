# Next.js Project

Este es un proyecto desarrollado en Next.js que utiliza PostgreSQL como base de datos y NextAuth para la autenticación. A continuación, se describen los pasos necesarios para instalar y ejecutar este proyecto en tu máquina local.

## Requisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu máquina:

- Node.js (v16 o superior)
- PostgreSQL (v13 o superior)

## Instalación
1. Tienes que clonar este repositorio
2. Instalar dependencias
Navega a la carpeta del proyecto e instala las dependencias
3. Instalar y configurar PostgreSQL
Asegúrate de tener PostgreSQL instalado en tu máquina. Puedes descargarlo desde la página oficial de PostgreSQL.

Una vez que PostgreSQL esté instalado:

Inicia el servidor de PostgreSQL.
Crea una nueva base de datos. Por ejemplo, podrías nombrarla cooperativaDB:
DATABASE_URL=postgresql://usuario:password@localhost:5432/mydatabase
PUBLIC_URL=http://localhost:3000

4. Configurar las variables de entorno
Crea un archivo .env en la raíz del proyecto con las siguientes variables de entorno:
DATABASE_URL=postgresql://usuario:password@localhost:5432/mydatabase
PUBLIC_URL=http://localhost:3000
Reemplaza usuario y password con tus credenciales de PostgreSQL, y asegúrate de que el nombre de la base de datos coincida con el que creaste.

5. Generar clave secreta para NextAuth
NextAuth requiere una clave secreta para manejar la autenticación de manera segura. Genera una clave secreta utilizando el siguiente comando: npx auth secret
6. Ejecutar la aplicación
Ahora puedes iniciar la aplicación en modo de desarrollo:
npm run dev

Herramientas que se están usando en el proyecto

Framework:
	- NextJS app router(se requiere un nivel avanzado o medio)


Frontend:
        - React(nivel avanzado)
        - Tailwind CSS
	- NextAuth
        - typescript
	- NextUI
	- ShadCn
	- FramerMotion

Backend:
        - Node.js
        - Postgres SQL
	- Prisma
	- firebase
	- typescript
	
Validaciones:
	- zod

Editor de Código:
	- Visual Studio Code
        
##NOTA

para poder subir un cambio, es necesario eliminar todos los errores de sintaxis, revisar el funcionamiento y hacer un build local con "npm run build" para descartar cualquier problema a la hora de unir los cambios


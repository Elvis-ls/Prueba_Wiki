// Agregar esta nueva función al final del archivo shareholdersController.ts

// Verificar si un accionista tiene 6 meses de antigüedad
export const checkSixMonthsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shareholderId = parseInt(id);

    if (isNaN(shareholderId) || shareholderId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de accionista inválido'
      });
      return;
    }

    const result = await checkSixMonthsAntiquity(shareholderId);

    res.json({
      success: true,
      data: result,
      message: result.tiene6meses 
        ? 'El accionista tiene 6 meses o más de antigüedad' 
        : 'El accionista tiene menos de 6 meses de antigüedad'
    });

  } catch (error: any) {
    console.error('Error al verificar antigüedad:', error);
    
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: 'Error al verificar la antigüedad del accionista',
      error: error.message
    });
  }
};
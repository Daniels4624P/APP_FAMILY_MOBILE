export const formatNumber = (value: string | number): string => {
  if (!value) return '';

  // Permitir solo números y el signo negativo
  const cleanValue = String(value).replace(/[^\d-]/g, '');

  // Si no hay números, devolver vacío
  if (cleanValue === '' || cleanValue === '-') return '';

  // Convertir a número
  const number = Number(cleanValue);

  // Formatear con puntos para separar miles
  return number.toLocaleString('es-CO');
};

// Agregar COP solo cuando se muestra en la lista de cuentas
export const formatNumberWithCurrency = (value: string | number): string => {
  if (!value) return '';
  return `${formatNumber(value)} COP`;
};

export const unformatNumber = (value: string): string => {
  if (!value) return '';
  // Eliminar el símbolo de peso, los puntos y cualquier espacio
  return value
    .replace(/\s?COP/g, '')
    .replace(/\./g, '')
    .trim();
};
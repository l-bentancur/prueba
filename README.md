# Liceo — sistema de reservas (beta de prueba)

Aplicación web sencilla para probar la gestión de materiales y reservas de un liceo. Incluye ejemplos de TV, computadoras, laboratorio de biología y física, materiales tecnológicos, calculadoras y recursos de dibujo.

## Probar en tu computadora

1. Descargá o cloná este repositorio y abrí una terminal en la carpeta del proyecto.
2. Iniciá un servidor local:

   ```bash
   python -m http.server 8000
   ```

   En algunos equipos el comando es `python3 -m http.server 8000`.
3. Abrí <http://localhost:8000> en el navegador.
4. Ingresá cualquier nombre y el código de prueba **liceo2026**.

También podés abrir `index.html` directamente, aunque es preferible usar un servidor local.

## Qué se puede probar

- Inicio de sesión demostrativo y cierre de sesión.
- Alta, edición y eliminación de materiales.
- Registro, confirmación, devolución y cancelación de reservas.
- Historial de reservas y eliminación permanente de registros.
- Disponibilidad por rango de fechas, con validación para evitar reservas superpuestas que excedan el inventario.
- Filtro por categoría y resumen del inventario.
- Guardado de cambios en `localStorage` del navegador.

## Importante: es una beta local

El login es únicamente una pantalla de demostración: el código está visible en el JavaScript y **no es una medida de seguridad**. Los datos se guardan solo en el navegador y no se sincronizan entre personas, equipos ni navegadores. No uses información personal real ni dependas de esta beta para administrar reservas oficiales. Para uso compartido del liceo hace falta un servidor, autenticación segura y una base de datos.

El botón **Restablecer demo** reemplaza los datos locales por el inventario de ejemplo.

# Liceo - Sistema de gestión de reservas

Esta aplicación web permite registrar y controlar los materiales que se prestan en un liceo, como:

- TV y equipos audiovisuales
- Computadoras y accesorios informáticos
- Laboratorios de biología y física
- Material tecnológico
- Caja de calculadoras
- Reglas y materiales de dibujo

## Características

- Alta de materiales con categoría, cantidad total y ubicación
- Registro de reservas por persona, tipo, material y fechas
- Estado de cada reserva: pendiente, confirmada, devuelta o cancelada
- Dashboard con conteo general de materiales y disponibilidad
- Filtro por categorías
- Persistencia local con `localStorage`

## Cómo abrirla

1. Clona este repositorio.
2. Abre `index.html` directamente en un navegador, o ejecuta un servidor local:

```bash
python -m http.server 8000
```

3. Luego visita:

```text
http://localhost:8000
```

## Archivos principales

- `index.html`: estructura principal de la interfaz
- `styles.css`: estilos visuales del sistema
- `script.js`: lógica de reservas y manejo de datos

## Nota

Es una versión funcional de frontend para gestión de inventario y reservas, lista para extenderse con backend, autenticación o base de datos real.


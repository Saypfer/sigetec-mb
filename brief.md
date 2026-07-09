# Sistema de Gestión de Repuestos y Reparaciones - Taller de Electrónicos MB

## Objetivo del sistema
Desarrollar un sistema web administrativo para gestionar el inventario de repuestos, órdenes de reparación y trazabilidad del mantenimiento técnico de equipos electrónicos en el Taller de Electrónicos MB.

## Tipo de sistema
Sistema web administrativo interno. No es una página informativa ni una tienda en línea.

## Usuarios del sistema
1. Administrador:
   - Gestiona usuarios.
   - Registra clientes.
   - Gestiona inventario.
   - Consulta reportes.
   - Supervisa órdenes de reparación.

2. Técnico:
   - Consulta órdenes asignadas.
   - Registra diagnósticos.
   - Actualiza estados de reparación.
   - Registra repuestos utilizados.
   - Agrega observaciones técnicas.

## Módulos principales
- Inicio de sesión
- Dashboard
- Inventario de repuestos
- Clientes
- Equipos electrónicos
- Órdenes de reparación
- Diagnósticos técnicos
- Historial y trazabilidad
- Reportes
- Usuarios y roles

## Diseño visual deseado
El sistema debe tener apariencia profesional, limpia y moderna.
Debe usar un layout administrativo con menú lateral, barra superior, tarjetas de resumen, tablas y formularios.
Debe funcionar correctamente en computadora y celular.

## Menú lateral
- Dashboard
- Inventario
- Órdenes
- Clientes
- Equipos
- Técnicos
- Reportes
- Usuarios
- Configuración

## Dashboard
Debe mostrar:
- Total de órdenes registradas
- Órdenes pendientes
- Órdenes en reparación
- Órdenes finalizadas
- Repuestos con stock bajo
- Últimas órdenes registradas
- Alertas de inventario

## Inventario
Campos:
- Código
- Nombre del repuesto
- Categoría
- Cantidad disponible
- Stock mínimo
- Precio
- Ubicación
- Estado

## Órdenes de reparación
Campos:
- Código de orden
- Cliente
- Equipo
- Falla reportada
- Diagnóstico
- Técnico asignado
- Repuestos utilizados
- Estado
- Fecha de ingreso
- Fecha de entrega
- Costo total
- Observaciones

## Estados de reparación
- Pendiente
- En diagnóstico
- En reparación
- Esperando repuesto
- Finalizado
- Entregado
- Cancelado

## Reportes
- Reparaciones por mes
- Repuestos más utilizados
- Órdenes por estado
- Reparaciones por técnico
- Repuestos con bajo stock
- Ingresos estimados por reparación

## Tecnologías sugeridas
Frontend:
- React
- Vite
- Tailwind CSS

Backend:
- Node.js
- Express

Base de datos:
- PostgreSQL

## Prioridad inicial
Primero crear el frontend con datos de prueba.
Después conectar backend y base de datos.
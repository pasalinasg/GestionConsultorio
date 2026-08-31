# Plan de implementación: seguridad de datos y acceso

**Funcionalidad:** `001-seguridad-acceso`  
**Fecha:** 2026-08-30  
**Especificación:** [spec.md](spec.md)

## Resumen

Establecer una base multiempresa segura con acceso visible por nombre de usuario y contraseña, cuentas creadas por propietarios, permisos por recurso y acción, y aislamiento de datos mediante validación de servidor más RLS explícito. La primera implementación no usará funciones, triggers, RPCs ni cambios remotos automáticos.

## Contexto técnico

| Aspecto                     | Decisión                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| Aplicación                  | Web; se preparará para Next.js y TypeScript, siguiendo la plataforma anterior.                  |
| Autenticación               | Supabase Auth con contraseña; identidad técnica interna derivada del nombre de usuario visible. |
| Datos                       | PostgreSQL administrado por Supabase, con RLS y permisos explícitos.                            |
| Operaciones administrativas | Servicios de servidor; `service_role` solo en variables privadas del servidor.                  |
| Pruebas                     | Unitarias para autorización y servicios; integración para sesiones y RLS.                       |
| Alcance                     | Una empresa por usuario, una sede por empresa y módulos futuros protegidos por el mismo modelo. |
| Restricciones               | Sin funciones, triggers, RPCs, jobs ni aplicación remota de migraciones sin aprobación expresa. |

## Diseño de creación de empresa

1. Una persona abre el flujo público **Crear empresa**.
2. Ingresa nombre de empresa, nombre de usuario globalmente único y contraseña.
3. El servidor valida formato, disponibilidad del nombre de usuario y contraseña.
4. El servidor comprueba que no exista otra empresa activa mientras esté vigente la restricción inicial de empresa única.
5. El servidor crea la identidad de autenticación con contraseña administrada por Supabase, sin enviar ni requerir correo de confirmación.
6. El servidor registra la empresa, el usuario interno activo y su propiedad; concede todos los permisos iniciales.
7. Si falla cualquier paso posterior a crear la identidad, el servidor ejecuta una compensación y elimina esa identidad recién creada. No se usarán triggers para sincronizar datos.
8. El propietario inicia sesión con el nombre de usuario y contraseña visibles.

## Reglas de autorización

- Todo dato privado llevará empresa propietaria y toda operación comprobará empresa, usuario activo y permiso.
- El propietario administra solo usuarios, permisos y datos de su propia empresa.
- Un permiso `agenda.visualizar` permite ver toda la agenda de la empresa.
- El acceso de pacientes al flujo público se diseñará en el módulo de agendamiento con una superficie de datos mínima e independiente de permisos internos.
- Desactivar una cuenta conserva sus registros pero bloquea operaciones futuras en servidor y RLS; la configuración de sesión tendrá JWT de corta duración.
- Restablecer o cambiar una contraseña es una acción exclusiva del propietario; los usuarios internos no disponen de cambio de contraseña y nunca se revela la contraseña anterior.
- La recuperación de la contraseña del propietario será un procedimiento manual externo con verificación de identidad y auditoría; no se creará una cuenta maestra ni recuperación automática dentro de la aplicación.

## Revisión constitucional

| Principio                      | Estado | Evidencia                                                                |
| ------------------------------ | ------ | ------------------------------------------------------------------------ |
| Privacidad y control de acceso | Cumple | Aislamiento por empresa, permiso por acción, servidor y RLS.             |
| Evolución explícita de datos   | Cumple | Solo modelo conceptual; las migraciones requerirán aprobación posterior. |
| Trazabilidad                   | Cumple | Auditoría de acciones administrativas y desactivación reversible.        |
| Límites modulares              | Cumple | Autenticación, autorización y dominio separados.                         |
| Evolución segura y probada     | Cumple | Pruebas de permisos, RLS, sesiones y compensación requeridas.            |
| Lenguaje de dominio            | Cumple | Identificadores y contratos de dominio previstos en español.             |

## Estructura proyectada

```text
src/
├── app/
│   ├── acceso/
│   └── empresa/
├── features/
│   ├── autenticacion/
│   ├── empresas/
│   ├── usuarios/
│   └── permisos/
└── lib/
    └── supabase/

supabase/
├── migrations/
└── tests/

tests/
├── unit/
└── integration/
```

## Artefactos de diseño

- [Investigación](research.md)
- [Modelo de datos conceptual](data-model.md)
- [Contrato de autorización](contracts/autorizacion.md)
- [Guía de validación](quickstart.md)

## Puerta antes de implementación

Antes de generar tareas o escribir código, el propietario del proyecto debe revisar y aprobar:

1. Las entidades conceptuales y relaciones del modelo de datos.
2. La estrategia de identidad técnica interna para soportar acceso por nombre de usuario.
3. La primera migración SQL concreta, incluyendo tablas, índices, restricciones, grants y políticas RLS.
4. La configuración de Supabase Auth: creación solo administrativa, confirmación de correo no requerida y duración de sesión.

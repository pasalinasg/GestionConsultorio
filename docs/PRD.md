# PRD inicial — Gestión de consultorio

**Estado:** Borrador inicial  
**Versión:** 0.1  
**Fecha:** 2026-08-30

## 1. Resumen del producto

Gestión de consultorio será una plataforma web modular para administrar consultorios y clínicas. La primera versión se enfoca en nutrición y en la gestión de agendamiento; la arquitectura deberá permitir incorporar módulos futuros sin rehacer el núcleo de empresas, usuarios y permisos.

Cada empresa administrará su propia información de forma aislada. Su propietario tendrá control total y podrá crear usuarios internos y asignarles permisos por recurso y acción.

## 2. Problema

Los consultorios necesitan ordenar la agenda por profesional y servicio, evitar superposiciones, disminuir ausencias y controlar las señas previas. Al mismo tiempo, requieren que el personal acceda solo a las funciones necesarias y que los pacientes puedan reservar sin una carga de datos excesiva.

## 3. Objetivos iniciales

- Permitir a una empresa administrar su agenda de una única sede.
- Organizar la disponibilidad y las citas por profesional y servicio.
- Permitir reservas internas y reservas online de pacientes.
- Reducir reservas no confirmadas mediante una seña del 50% y un vencimiento de 30 minutos.
- Mantener el aislamiento de datos por empresa y permisos explícitos por usuario.
- Crear una base modular para futuros módulos clínicos y administrativos.

## 4. Usuarios

### Propietario de empresa

Crea y administra la empresa. Tiene acceso total, crea cuentas internas y define permisos.

### Usuario interno

Pertenece inicialmente a una sola empresa. Accede a recursos según las acciones que le asigne el propietario.

### Profesional

Es el prestador de servicios dentro de la empresa. Define o recibe disponibilidad y puede bloquear horarios y días cuando sea necesario.

### Paciente o prospecto

Reserva online usando una experiencia breve. Si todavía no existe, ingresa inicialmente como prospecto.

## 5. Alcance funcional inicial

### 5.1 Empresas, usuarios y permisos

- Cada empresa es un espacio de datos aislado.
- Durante la etapa inicial, la plataforma permitirá registrar una sola empresa activa en total. El modelo conservará la separación por empresa para habilitar una futura expansión multiempresa sin rediseñar los datos.
- Cada usuario pertenece a una única empresa en esta primera versión.
- El propietario crea directamente las cuentas de los usuarios internos; no habrá invitaciones por correo inicialmente.
- El propietario tiene acceso total.
- Los permisos se asignan por recurso y acción: visualizar, crear, editar y eliminar, además de acciones especiales cuando aplique.
- La validación de comprobantes será una acción especial del recurso de agendamiento.
- No todos los recursos ni todos los usuarios tendrán permiso de eliminación. Para las citas, no existirá eliminación: se usarán edición y cambios de estado para preservar historial.

### 5.2 Profesionales y servicios

- Cada empresa tendrá inicialmente una sola sede.
- Un profesional puede ofrecer únicamente los servicios que la empresa le asigne.
- Cada servicio tendrá una duración estimada única.
- El precio se define en la asignación entre profesional y servicio; un mismo servicio puede tener precio distinto según el profesional.
- Cada servicio podrá definir las franjas horarias en las que puede agendarse.

### 5.3 Disponibilidad

- Cada profesional tendrá disponibilidad semanal por días y franjas horarias.
- La agenda respetará simultáneamente la disponibilidad del profesional, la duración del servicio y las franjas horarias permitidas para ese servicio.
- Se podrán registrar feriados, vacaciones y bloqueos puntuales de días u horarios.
- El profesional podrá bloquear sus propios días u horarios cuando lo necesite, según sus permisos.

### 5.4 Pacientes y prospectos

- Para reservar online se solicitarán solo cédula de identidad, nombre, apellido y número de WhatsApp.
- Si la cédula ya existe en la empresa, la cita se vinculará a esa persona.
- Si no existe, se creará un prospecto y se asociará a la cita.
- El prospecto se convierte automáticamente en paciente cuando su cita queda confirmada.
- Si la cita se rechaza o vence, conservará el estado de prospecto.
- Inicialmente, la cédula será suficiente para localizar y gestionar una cita online. Esta decisión reduce fricción, pero se reconoce como una limitación temporal de seguridad y privacidad.

### 5.5 Agendamiento

- Las citas podrán ser creadas por usuarios internos autorizados o por el paciente desde una página online.
- El agendamiento se realizará por profesional y servicio.
- El sistema solo mostrará horarios realmente disponibles y compatibles con la duración del servicio.
- Al intentar una nueva reserva online, el paciente ingresará su cédula. Si tiene una cita activa, el sistema le permitirá gestionarla antes de crear otra reserva.
- Usuarios internos y pacientes podrán reprogramar o cancelar citas dentro de las reglas que se definan para cada estado.

### 5.6 Señas y comprobantes

- La política inicial exige una seña equivalente al 50% del precio del servicio asignado al profesional.
- El producto no será todavía un gestor contable, de caja ni de facturación.
- Cada empresa podrá facilitar sus datos de transferencia, QR e instrucciones de pago.
- Una reserva nueva inicia como pendiente de pago y mantiene el horario reservado durante 30 minutos.
- El paciente podrá enviar un comprobante de pago por el flujo de reserva.
- Un usuario con el permiso especial correspondiente revisará el comprobante y podrá confirmar o rechazar la cita.
- Una integración futura con enlaces de pago podrá automatizar la confirmación, pero no forma parte del alcance inicial.

### 5.7 Estados de cita

- Pendiente de pago: reserva el horario durante 30 minutos.
- Comprobante enviado: mantiene el horario reservado sin vencimiento automático, hasta revisión manual.
- Confirmada: mantiene la cita y convierte al prospecto en paciente si corresponde.
- Rechazada: requiere una acción manual autorizada y libera el horario.
- Vencida: se produce al superar los 30 minutos en estado pendiente de pago y libera el horario.
- Cancelada: conserva el historial y libera el horario.
- Atendida: registra que la atención fue realizada.
- No asistió: registra la inasistencia sin borrar la cita.

### 5.8 Panel de seguimiento de agenda

- El producto incluirá una visualización operativa tipo CRM para comprender el estado de la agenda por día, semana y mes.
- Podrán acceder los usuarios que tengan permiso de visualización del recurso de agenda; la información siempre estará limitada a su empresa y a las reglas de acceso aplicables.
- El panel mostrará citas totales y su distribución por estado: pendientes, comprobante enviado, confirmadas, canceladas, vencidas, atendidas y no asistió.
- Mostrará indicadores de confirmación, cancelación, vencimiento e inasistencia, con comparación frente al período anterior cuando existan datos.
- Permitirá analizar la actividad por profesional y servicio, mediante filtros de período, profesional y servicio.
- Incluirá una vista priorizada de próximas citas y reservas que requieren atención, como comprobantes pendientes de revisión.
- La interfaz deberá priorizar comprensión rápida: indicadores principales, evolución temporal y casos que requieren acción. No mostrará todavía métricas contables ni información clínica detallada.

## 6. Reglas de negocio iniciales

- No puede existir superposición de citas activas para un mismo profesional.
- Un horario bloqueado, de vacaciones o feriado no puede ser reservado.
- Una cita pendiente de pago vence únicamente tras 30 minutos; las citas con comprobante enviado no vencen automáticamente.
- Las citas no se eliminan físicamente desde el módulo de agendamiento.
- Todos los datos operativos pertenecen a una empresa y toda consulta deberá respetar dicho aislamiento.
- Los permisos se verifican en el servidor; filtrar elementos en la interfaz no constituye autorización.
- Las métricas del panel se calculan a partir de las citas y sus estados registrados; no pueden depender de valores manuales sin trazabilidad.

## 7. Fuera de alcance inicial

- Múltiples sedes por empresa.
- Alta simultánea de múltiples empresas durante la etapa inicial.
- Usuarios pertenecientes a más de una empresa.
- Invitaciones de usuarios por correo.
- Historia clínica, fichas nutricionales, recetas o seguimiento clínico.
- Facturación, caja, conciliación bancaria y control contable de cobros.
- Integración automática de pagos, bancos o billeteras.
- Verificación por código de WhatsApp para gestionar citas online.
- Automatismos de base de datos no revisados, como triggers, funciones o tareas programadas.

## 8. Principios técnicos y de datos

- Las tablas existentes del proyecto Supabase se conservarán como contexto y no se modificarán sin una revisión específica: [inventario inicial](inventario-supabase-existente.md).
- Los cambios de esquema se diseñarán y revisarán antes de escribirse.
- Cada cambio de Supabase se entregará en una migración SQL explícita, versionada y legible.
- No se aplicarán migraciones ni cambios remotos sin aprobación expresa del propietario del proyecto.
- No se usarán funciones, triggers, RPCs ni tareas programadas de base de datos por defecto.
- Toda entidad sensible definirá explícitamente propiedad, acceso y políticas de seguridad antes de ser expuesta a clientes.
- Las decisiones sobre vencimiento exacto de reservas se implementarán inicialmente con lógica de aplicación explícita; cualquier proceso programado futuro será una decisión separada y aprobada.

## 9. Métricas de éxito iniciales

- El propietario puede crear una empresa, usuarios y permisos sin intervención técnica.
- Un paciente puede completar una reserva online con los cuatro datos requeridos en pocos pasos.
- El sistema nunca muestra un horario que infrinja disponibilidad, bloqueos o duración de servicio.
- Las reservas pendientes liberan horarios después de 30 minutos cuando no hay comprobante enviado.
- Un usuario no puede ver ni modificar información de otra empresa ni ejecutar una acción sin permiso.
- Un usuario autorizado puede identificar en pocos segundos el volumen de citas y los casos pendientes, confirmados, cancelados, vencidos, atendidos o con inasistencia del período elegido.

## 10. Decisiones pendientes

- Reglas detalladas de reprogramación y cancelación por estado, incluyendo plazos y devolución de señas.
- Campos internos que se completarán al convertir un prospecto en paciente.
- Diseño visual, contenido de la página pública y mensajes de WhatsApp.
- Método concreto para liberar reservas vencidas cuando no existe actividad en la aplicación.
- Catálogo y organización de recursos y permisos administrables por el propietario.
- Integración futura de enlaces de pago y comunicación por WhatsApp.

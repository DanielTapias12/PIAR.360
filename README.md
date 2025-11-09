# PIAR.360 - Asistente Inteligente de Inclusión

## Descripción General

PIAR.360 es una plataforma innovadora impulsada por Inteligencia Artificial (IA), diseñada para transformar la creación, gestión y seguimiento de los Planes Individuales de Ajustes Razonables (PIAR) en el entorno educativo. Siguiendo los lineamientos del Decreto 1421 de 2017 de Colombia, esta herramienta busca facilitar la educación inclusiva, empoderando a docentes, directivos, familias y administradores.

Esta aplicación es una demostración funcional que simula un entorno multi-rol, utilizando la API de Google Gemini para potenciar sus características inteligentes y ofreciendo una gestión integral de la comunidad educativa.

## Características Principales

La plataforma ofrece una experiencia personalizada y potente para cada rol del ecosistema educativo:

### 👑 Rol de Jefe Maestro (Superadministrador)
El rol con control total sobre la plataforma, diseñado para la administración y supervisión global.
- **Dashboard de Rendimiento:** Monitorea el estado del sistema con métricas simuladas como usuarios activos y latencia de la API.
- **Administración Total de Usuarios:** Capacidad para registrar, **editar** y eliminar cualquier tipo de usuario, incluyendo **Directivos**.
- **Gestión de Credenciales:** Visualiza y **edita las contraseñas** de todos los usuarios para facilitar el soporte.
- **Asignación de Grados:** Asigna y reasigna docentes a los diferentes grados escolares.
- **Asignación Familiar:** Vincula a cada estudiante con su correspondiente usuario de familia, construyendo el núcleo de la comunidad.
- **Perfiles de Usuario Completos:** Edita información detallada de los usuarios, incluyendo datos de contacto y campos específicos de cada rol.

### 👩‍🏫 Rol de Docente
- **Dashboard Personalizado:** Visualización rápida del estado de los estudiantes a cargo, incluyendo niveles de riesgo y alertas tempranas.
- **Gestión de Estudiantes:** Directorio completo para **asignarse o quitar la asignación** de estudiantes.
- **Registro de Estudiantes:** Capacidad para dar de alta a nuevos estudiantes en la plataforma.
- **Banco de Estrategias:** Busca y **asigna estrategias a múltiples estudiantes a la vez**, optimizando el tiempo.
- **Generador de PIAR con IA:** Creación de borradores de PIAR coherentes y completos a partir del diagnóstico del estudiante, utilizando la IA de Gemini.
- **Análisis de Documentos:** Sube un PIAR existente para que la IA lo analice y ofrezca recomendaciones de mejora.
- **Seguimiento de Progreso:** Registro cronológico de observaciones y avances del estudiante.

### 📈 Rol de Directivo
- **Dashboard Institucional:** Vista panorámica con métricas sobre cumplimiento de PIAR, distribución de estudiantes y progreso por docente.
- **Gestión de Usuarios:** Registra docentes y familias. **Elimina usuarios** con un diálogo de confirmación para prevenir errores.
- **Gestión de Grados:** Asigna docentes responsables para cada grado.
- **Directorio Completo:** Acceso a los perfiles de todos los estudiantes y docentes de la institución.

### 👨‍👩‍👧‍👦 Rol de Familia
- **Portal Simplificado:** Una vista clara y sencilla del progreso y los apoyos que recibe el estudiante.
- **Resumen del PIAR:** Explicación del PIAR en un lenguaje accesible.
- **Asistente Virtual con IA:** Un chatbot amigable para resolver dudas sobre el PIAR y cómo apoyar al estudiante en casa.

### 🧠 Agente Pedagógico Virtual (IA Central)
Integrado en la plataforma, este asistente proactivo ofrece apoyo contextualizado a cada rol, ayudando a sugerir estrategias, resumir información y facilitar la comunicación.

## Autenticación

Para acceder a la aplicación, utilice las siguientes credenciales de demostración:

| Rol            | Usuario              | Contraseña   |
|----------------|----------------------|--------------|
| Jefe Maestro   | `JefeMaestro`        | `JMaestro123`  |
| Docente        | `amorales`           | `password123`  |
| Directivo      | `director`           | `adminpass`    |
| Familia        | `familia.valderrama` | `familypass`   |

## Pila Tecnológica (Stack)

- **Frontend:** React, TypeScript, Tailwind CSS
- **Inteligencia Artificial:** Google Gemini API (`gemini-2.5-pro` y `gemini-2.5-flash`)
- **Gráficos:** Recharts
- **Entorno:** La aplicación se ejecuta completamente en el navegador y utiliza `localStorage` para simular la persistencia de datos.

## Ejecución y Configuración

Esta aplicación está diseñada para ejecutarse en un entorno que provea la API Key de Google Gemini a través de la variable de entorno `process.env.API_KEY`. No se requiere un proceso de construcción (`build`) complejo.

1.  Asegúrese de tener un entorno donde la variable `process.env.API_KEY` esté configurada con una clave válida de Google Gemini.
2.  Sirva los archivos `index.html`, `index.tsx` y el resto de los componentes desde un servidor web simple.
3.  Abra `index.html` en su navegador.

La aplicación manejará el resto, importando los módulos necesarios a través del `importmap` definido en `index.html`.
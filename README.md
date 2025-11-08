# PIAR.ai - Asistente Inteligente de Inclusión

## Descripción General

PIAR.ai es una plataforma innovadora impulsada por Inteligencia Artificial (IA), diseñada para transformar la creación, gestión y seguimiento de los Planes Individuales de Ajustes Razonables (PIAR) en el entorno educativo. Siguiendo los lineamientos del Decreto 1421 de 2017 de Colombia, esta herramienta busca facilitar la educación inclusiva, empoderando a docentes, directivos y familias.

Esta aplicación es una demostración funcional que simula un entorno multi-rol, utilizando la API de Google Gemini para potenciar sus características inteligentes.

## Características Principales

La plataforma ofrece una experiencia personalizada para tres roles clave del ecosistema educativo:

### 🧠 Agente Pedagógico Virtual (IA Central)
Integrado en la plataforma, este asistente inteligente proactivo ofrece apoyo contextualizado a cada rol:
- **Sugiere estrategias pedagógicas personalizadas** basadas en el perfil y progreso del estudiante.
- **Comunica avances y resume datos clave** de manera clara y concisa.
- **Facilita la mediación y comunicación** ayudando a redactar mensajes efectivos entre docentes y familias.
- **Responde dudas** sobre procesos de inclusión, terminología y funcionalidades de la plataforma.

### 👩‍🏫 Rol de Docente
- **Dashboard Personalizado:** Visualización rápida del estado de los estudiantes a cargo, incluyendo niveles de riesgo y alertas tempranas.
- **Gestión de Estudiantes:** Listado y acceso a perfiles individuales de los estudiantes asignados.
- **Generador de PIAR con IA:** Creación de borradores de PIAR coherentes y completos a partir del diagnóstico del estudiante, utilizando la IA de Gemini.
- **Editor de PIAR:** Herramienta para revisar, modificar y personalizar el PIAR generado por la IA, asegurando que se ajuste a las necesidades específicas del estudiante.
- **Análisis de Documentos:** Capacidad de subir un PIAR existente para que la IA lo analice y ofrezca recomendaciones de mejora.
- **Seguimiento de Progreso:** Registro cronológico de observaciones y avances del estudiante en diferentes áreas.

### 📈 Rol de Directivo
- **Dashboard Institucional:** Vista panorámica de toda la institución, con métricas sobre cumplimiento de PIAR, distribución de estudiantes por riesgo y grado.
- **Supervisión de Docentes:** Seguimiento del progreso de los docentes en la creación y gestión de los PIAR de sus estudiantes.
- **Alertas Institucionales:** Identificación de casos críticos que requieren atención, como PIARs pendientes o falta de seguimiento.
- **Directorio Completo:** Acceso a los perfiles de todos los estudiantes de la institución.

### 👨‍👩‍👧‍👦 Rol de Familia
- **Portal Simplificado:** Una vista clara y sencilla del progreso y los apoyos que recibe el estudiante.
- **Resumen del PIAR:** Explicación del PIAR en un lenguaje accesible, enfocándose en fortalezas, apoyos en el colegio y actividades para reforzar en casa.
- **Asistente Virtual con IA:** Un chatbot amigable para resolver dudas sobre el PIAR, el diagnóstico del estudiante y cómo apoyarlo, brindando respuestas seguras y empáticas.

## Autenticación

Para acceder a la aplicación, utilice las siguientes credenciales de demostración:

| Rol       | Usuario              | Contraseña   |
|-----------|----------------------|--------------|
| Docente   | `amorales`           | `password123`  |
| Directivo | `director`           | `adminpass`    |
| Familia   | `familia.valderrama` | `familypass`   |

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
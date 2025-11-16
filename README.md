# PIAR.360 - Asistente Inteligente de Inclusión

## Descripción General

PIAR.360 es una plataforma innovadora impulsada por Inteligencia Artificial (IA), diseñada para transformar la creación, gestión y seguimiento de los Planes Individuales de Ajustes Razonables (PIAR) en el entorno educativo. Siguiendo los lineamientos del Decreto 1421 de 2017 de Colombia, esta herramienta busca facilitar la educación inclusiva, empoderando a docentes, directivos y familias.

Esta aplicación utiliza la API de Google Gemini para potenciar sus características inteligentes y **Supabase** para la gestión de la base de datos y la autenticación.

## Pila Tecnológica (Stack)

- **Frontend:** React, TypeScript, Tailwind CSS
- **Inteligencia Artificial:** Google Gemini API (`gemini-2.5-pro` y `gemini-2.5-flash`)
- **Backend y Base de Datos:** Supabase (PostgreSQL, Auth)
- **Gráficos:** Recharts

---

## 🚀 Configuración de Supabase (¡ACCIÓN REQUERIDA!)

Para que la aplicación funcione, necesitas configurar las tablas y las políticas de seguridad en tu base de datos de Supabase. Copia y ejecuta el siguiente script completo en el **Editor de SQL** de tu proyecto de Supabase.

### Script de Configuración Inicial y Definitivo

Este script creará las tablas, habilitará la seguridad, establecerá las políticas de acceso correctas y poblará la base de datos con datos de ejemplo. **Este script es seguro para ejecutarse varias veces.**

```sql
-- ========= CREACIÓN DE TABLAS =========
-- Usamos IF NOT EXISTS para evitar errores si las tablas ya existen.

-- 1. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL,
    username text UNIQUE,
    name text,
    role text,
    student_id text,
    email text,
    is_new_user boolean DEFAULT true,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Tabla de estudiantes
CREATE TABLE IF NOT EXISTS public.students (
    id text NOT NULL,
    name text,
    photo_url text,
    grade text,
    risk_level text,
    diagnosis text,
    teacher text,
    documents jsonb,
    progress_entries jsonb,
    CONSTRAINT students_pkey PRIMARY KEY (id)
);

-- ========= HABILITAR POLÍTICAS DE SEGURIDAD (RLS) =========
-- Esto se puede ejecutar de forma segura varias veces.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ========= POLÍTICAS DE ACCESO (RLS) =========
-- Eliminamos las políticas existentes antes de crearlas para que el script se pueda ejecutar varias veces.

-- Políticas para la tabla 'users'
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los perfiles." ON public.users;
CREATE POLICY "Los usuarios autenticados pueden ver todos los perfiles." ON public.users FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil." ON public.users;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil." ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil y los directores pueden crear usuarios." ON public.users;
CREATE POLICY "Los usuarios pueden crear su propio perfil y los directores pueden crear usuarios."
ON public.users
FOR INSERT WITH CHECK (
  (auth.uid() = id) OR
  ((SELECT role FROM public.users WHERE id = auth.uid()) = 'Director'::text)
);


-- Políticas para la tabla 'students'
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los estudiantes." ON public.students;
CREATE POLICY "Los usuarios autenticados pueden ver todos los estudiantes." ON public.students FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo directores y docentes pueden actualizar estudiantes." ON public.students;
CREATE POLICY "Solo directores y docentes pueden actualizar estudiantes." ON public.students FOR UPDATE USING (((SELECT role FROM public.users WHERE id = auth.uid()) IN ('Director'::text, 'Docente'::text)));

DROP POLICY IF EXISTS "Solo directores y docentes pueden insertar estudiantes." ON public.students;
CREATE POLICY "Solo directores y docentes pueden insertar estudiantes." ON public.students FOR INSERT WITH CHECK (((SELECT role FROM public.users WHERE id = auth.uid()) IN ('Director'::text, 'Docente'::text)));


-- ========= INSERCIÓN DE DATOS DE EJEMPLO =========
-- Para evitar duplicados, solo insertamos si la tabla de estudiantes está vacía.
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM public.students) THEN
      INSERT INTO public.students (id, name, photo_url, grade, risk_level, diagnosis, teacher, documents, progress_entries) VALUES
      ('st_01', 'Carlos Valderrama', 'https://picsum.photos/seed/cvalderrama/200', 'Tercero', 'alto', 'Trastorno del Espectro Autista (TEA) Nivel 1, con dificultades en la comunicación social y patrones de comportamiento repetitivos.', 'Ana Morales', '[]', '[]'),
      ('st_02', 'Sofia Vergara', 'https://picsum.photos/seed/svergara/200', 'Tercero', 'medio', 'Dislexia. Presenta dificultades específicas en la decodificación de palabras y fluidez lectora.', 'Ana Morales', '[]', '[]'),
      ('st_03', 'Juan Pablo Montoya', 'https://picsum.photos/seed/jpmontoya/200', 'Cuarto', 'bajo', 'Trastorno por Déficit de Atención e Hiperactividad (TDAH), tipo inatento.', 'Carlos Ruiz', '[]', '[]');
   END IF;
END $$;
```

---

## Autenticación

El sistema de autenticación es gestionado por **Supabase Auth** y soporta tres flujos:

1.  **Registro del Primer Director:** En la pantalla de inicio, si no existe ningún director en la base de datos, aparecerá la opción para registrarse con el rol de "Director".
2.  **Registro Público:** Una vez que existe al menos un director, los nuevos usuarios solo podrán registrarse como "Docente" o "Familia". Recibirán un correo de confirmación para activar su cuenta.
3.  **Registro por un Director:** Un director ya registrado puede crear cuentas para otros directores, docentes y familias, generando credenciales temporales que el nuevo usuario deberá cambiar en su primer inicio de sesión.
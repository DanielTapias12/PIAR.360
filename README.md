# PIAR.360 - Asistente Inteligente de Inclusión

## Descripción General

PIAR.360 es una plataforma innovadora impulsada por Inteligencia Artificial (IA), diseñada para transformar la creación, gestión y seguimiento de los Planes Individuales de Ajustes Razonables (PIAR) en el entorno educativo. Siguiendo los lineamientos del Decreto 1421 de 2017 de Colombia, esta herramienta busca facilitar la educación inclusiva, empoderando a docentes, directivos y familias.

Esta aplicación utiliza la API de Google Gemini para potenciar sus características inteligentes y **Supabase** como backend para la base de datos y la autenticación.

## Pila Tecnológica (Stack)

- **Frontend:** React, TypeScript, Tailwind CSS
- **Inteligencia Artificial:** Google Gemini API (`gemini-2.5-pro` y `gemini-2.5-flash`)
- **Backend y Base de Datos:** Supabase (PostgreSQL, Auth)
- **Gráficos:** Recharts

---

## Configuración de Supabase (¡ACCIÓN OBLIGATORIA!)

Para que la aplicación funcione, necesitas configurar tu base de datos y autenticación en Supabase.

### 1. Deshabilitar Confirmación de Correo

Para permitir el inicio de sesión inmediato después del registro, debes deshabilitar la confirmación por correo electrónico.

1.  Ve a tu proyecto en [Supabase](https://app.supabase.com).
2.  En el menú de la izquierda, ve a **Authentication** -> **Providers**.
3.  En la sección de **Email**, haz clic para expandirla.
4.  **Desactiva** el interruptor que dice **"Confirm email"**.

### 2. Configurar Recuperación de Contraseña

Para que los enlaces de recuperación de contraseña funcionen, debes configurar la URL de tu sitio.

1.  En el menú de la izquierda, ve a **Authentication** -> **URL Configuration**.
2.  En el campo **"Site URL"**, introduce la URL donde tu aplicación está desplegada. Para el desarrollo local o en este entorno, suele ser `http://localhost:5173`.
3.  Guarda los cambios.

### 3. Ejecutar Script SQL

Copia y pega el siguiente script completo en el **SQL Editor** de tu proyecto de Supabase y ejecútalo. Este script creará las tablas, configurará la seguridad (RLS) y añadirá los datos de ejemplo.

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

-- ========= FUNCIÓN Y TRIGGER PARA CREAR PERFILES DE USUARIO AUTOMÁTICAMENTE =========
-- Crea una función que inserta una fila en public.users cada vez que se crea un nuevo usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, role, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.email,
    new.raw_user_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'username'
  );
  return new;
end;
$$;

-- Crea un trigger que ejecuta la función handle_new_user después de cada inserción en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ========= POLÍTICAS DE ACCESO (RLS) =========
-- Eliminamos las políticas existentes antes de crearlas para que el script se pueda ejecutar varias veces.

-- Políticas para la tabla 'users'
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los perfiles." ON public.users;
CREATE POLICY "Los usuarios autenticados pueden ver todos los perfiles." ON public.users FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil." ON public.users;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil." ON public.users FOR UPDATE USING (auth.uid() = id);

-- YA NO SE NECESITA POLÍTICA DE INSERT: El trigger en el backend se encarga de esto de forma segura.
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil y los directores pueden crear usuarios." ON public.users;


-- Políticas para la tabla 'students'
DROP POLICY IF EXISTS "Los usuarios autenticados pueden ver todos los estudiantes." ON public.students;
CREATE POLICY "Los usuarios autenticados pueden ver todos los estudiantes." ON public.students FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo directores y docentes pueden actualizar estudiantes." ON public.students;
CREATE POLICY "Solo directores y docentes pueden actualizar estudiantes." ON public.students FOR UPDATE USING (((SELECT role FROM public.users WHERE id = auth.uid()) IN ('Director'::text, 'Docente'::text)));

DROP POLICY IF EXISTS "Solo directores y docentes pueden insertar estudiantes." ON public.students;
CREATE POLICY "Solo directores y docentes pueden insertar estudiantes." ON public.students FOR INSERT WITH CHECK (((SELECT role FROM public.users WHERE id = auth.uid()) IN ('Director'::text, 'Docente'::text)));


-- ========= INSERCIÓN DE DATOS DE EJEMPO =========
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

El sistema de autenticación es gestionado por **Supabase Auth**. El registro se realiza directamente en la interfaz, permitiendo a los usuarios crear su propia cuenta con un **nombre de usuario**, **correo electrónico** y **contraseña**. El inicio de sesión se realiza con el nombre de usuario y la contraseña. El acceso es inmediato después del registro.

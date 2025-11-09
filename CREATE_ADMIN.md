# Crear Usuario Administrador

## Pasos para crear tu primer usuario administrador:

### 1. Ir al Dashboard de Supabase
Abre tu navegador y ve a:
```
https://supabase.com/dashboard/project/jyrnpbsicqydasjqcjgc
```

### 2. Crear Usuario en Authentication
1. En el menú izquierdo, haz clic en **"Authentication"**
2. Luego haz clic en **"Users"**
3. Haz clic en el botón **"Add user"** (o "Invite user")
4. Selecciona **"Create new user"**
5. Ingresa los siguientes datos:
   - **Email**: admin@test.com (o el email que prefieras)
   - **Password**: Admin123! (o la contraseña que prefieras)
6. Haz clic en **"Create user"**

### 3. Crear el Perfil del Usuario
1. En el menú izquierdo, ve a **"SQL Editor"**
2. Haz clic en **"New query"**
3. Copia y pega este código SQL (reemplaza el email si usaste otro):

```sql
-- Obtener el ID del usuario que acabas de crear
WITH user_data AS (
  SELECT id, email FROM auth.users WHERE email = 'admin@test.com'
)
-- Crear el perfil de administrador
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Administrador', 'admin'
FROM user_data
ON CONFLICT (id) DO NOTHING;
```

4. Haz clic en **"Run"** o presiona **Ctrl + Enter**

### 4. Iniciar Sesión
Ahora puedes regresar a la aplicación e iniciar sesión con:
- **Email**: admin@test.com (o el que usaste)
- **Password**: Admin123! (o la que usaste)

---

## Credenciales de Prueba Recomendadas

Si seguiste los pasos exactos:
- **Email**: `admin@test.com`
- **Password**: `Admin123!`

---

## ¿Problemas al Crear el Usuario?

### Opción Alternativa: Usar la API de Supabase directamente

Si tienes problemas con el dashboard, puedes ejecutar este comando desde tu terminal:

```bash
curl -X POST 'https://jyrnpbsicqydasjqcjgc.supabase.co/auth/v1/admin/users' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cm5wYnNpY3F5ZGFzanFjamdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTc0NDEsImV4cCI6MjA3ODEzMzQ0MX0.9H9CdzLFIgY8En3OPQ5Wp053-GfVX--hRXn8n1iJdjA" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!",
    "email_confirm": true
  }'
```

Nota: Necesitarás el SERVICE_ROLE_KEY que está en tu dashboard de Supabase en Settings > API.

---

## Crear Usuario Cliente (Después de tener acceso como admin)

Una vez que inicies sesión como administrador:

1. Ve a la sección **"Clients"** en el menú
2. Haz clic en **"New Client"**
3. Llena los datos del cliente:
   - Nombre de la empresa
   - RUC
   - Email
   - Teléfono (opcional)
   - Dirección (opcional)
   - Persona de contacto (opcional)
4. Guarda el cliente

Si deseas que el cliente tenga acceso al sistema:
1. Crea un usuario en Supabase Auth con el email del cliente
2. Luego ejecuta este SQL (reemplaza el email):

```sql
WITH user_data AS (
  SELECT id, email FROM auth.users WHERE email = 'cliente@ejemplo.com'
)
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Nombre del Cliente', 'client'
FROM user_data
ON CONFLICT (id) DO NOTHING;

-- Vincular el perfil con el cliente
WITH user_data AS (
  SELECT id FROM auth.users WHERE email = 'cliente@ejemplo.com'
)
UPDATE clients
SET user_id = (SELECT id FROM user_data)
WHERE email = 'cliente@ejemplo.com';
```

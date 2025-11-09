/*
  # Triggers Automáticos para Notificaciones

  1. Triggers Implementados
    - Notificación cuando se cambia el estado de un despacho
    - Notificación cuando se crea un nuevo despacho para un cliente
    
  2. Funcionalidad
    - Los triggers envían notificaciones automáticas a los clientes
    - Se crean notificaciones solo si el cliente tiene un user_id asignado
    - Las notificaciones incluyen información contextual del despacho
*/

-- Función para notificar cambios de estado en despachos
CREATE OR REPLACE FUNCTION notify_dispatch_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_client_user_id uuid;
  v_dispatch_number text;
BEGIN
  -- Obtener el user_id del cliente y el número de despacho
  SELECT c.user_id, d.dispatch_number
  INTO v_client_user_id, v_dispatch_number
  FROM clients c
  JOIN dispatches d ON d.client_id = c.id
  WHERE d.id = NEW.id;

  -- Solo notificar si el cliente tiene un user_id asignado
  IF v_client_user_id IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, dispatch_id, type, title, message)
    VALUES (
      v_client_user_id,
      NEW.id,
      'status_updated',
      'Estado de Despacho Actualizado',
      'El estado del despacho ' || v_dispatch_number || ' ha cambiado a: ' || REPLACE(NEW.status, '_', ' ')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para cambios de estado en despachos
DROP TRIGGER IF EXISTS dispatch_status_change_trigger ON dispatches;
CREATE TRIGGER dispatch_status_change_trigger
  AFTER UPDATE OF status ON dispatches
  FOR EACH ROW
  EXECUTE FUNCTION notify_dispatch_status_change();

-- Función para notificar creación de nuevo despacho
CREATE OR REPLACE FUNCTION notify_new_dispatch()
RETURNS TRIGGER AS $$
DECLARE
  v_client_user_id uuid;
BEGIN
  -- Obtener el user_id del cliente
  SELECT user_id
  INTO v_client_user_id
  FROM clients
  WHERE id = NEW.client_id;

  -- Solo notificar si el cliente tiene un user_id asignado
  IF v_client_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, dispatch_id, type, title, message)
    VALUES (
      v_client_user_id,
      NEW.id,
      'dispatch_created',
      'Nuevo Despacho Creado',
      'Se ha creado un nuevo despacho con número: ' || NEW.dispatch_number
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevos despachos
DROP TRIGGER IF EXISTS new_dispatch_trigger ON dispatches;
CREATE TRIGGER new_dispatch_trigger
  AFTER INSERT ON dispatches
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_dispatch();

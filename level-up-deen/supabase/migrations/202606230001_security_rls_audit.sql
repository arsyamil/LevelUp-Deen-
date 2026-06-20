-- Migration: Phase 10 - Security RLS Audit

-- 1. Enable RLS on all remaining tables that might have been missed
ALTER TABLE public.squad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Policies for squad_groups
DROP POLICY IF EXISTS squad_groups_select_policy ON public.squad_groups;
CREATE POLICY squad_groups_select_policy ON public.squad_groups
  FOR SELECT TO public
  USING (
    not is_private 
    or created_by = auth.uid()::text 
    or id in (select squad_id from public.squad_members where user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS squad_groups_insert_policy ON public.squad_groups;
CREATE POLICY squad_groups_insert_policy ON public.squad_groups
  FOR INSERT TO public
  WITH CHECK (created_by = auth.uid()::text);

DROP POLICY IF EXISTS squad_groups_update_policy ON public.squad_groups;
CREATE POLICY squad_groups_update_policy ON public.squad_groups
  FOR UPDATE TO public
  USING (created_by = auth.uid()::text)
  WITH CHECK (created_by = auth.uid()::text);

DROP POLICY IF EXISTS squad_groups_delete_policy ON public.squad_groups;
CREATE POLICY squad_groups_delete_policy ON public.squad_groups
  FOR DELETE TO public
  USING (created_by = auth.uid()::text);

-- 3. Policies for items (Public Read-Only)
DROP POLICY IF EXISTS items_select_policy ON public.items;
CREATE POLICY items_select_policy ON public.items
  FOR SELECT TO public
  USING (true);

-- 4. Policies for achievements (Public Read-Only)
DROP POLICY IF EXISTS achievements_select_policy ON public.achievements;
CREATE POLICY achievements_select_policy ON public.achievements
  FOR SELECT TO public
  USING (true);

-- 5. Policies for task_templates (Public Read-Only)
DROP POLICY IF EXISTS task_templates_select_policy ON public.task_templates;
CREATE POLICY task_templates_select_policy ON public.task_templates
  FOR SELECT TO public
  USING (true);

-- 6. Policies for system_audit_logs (Admin only / Nobody can read publicly)
DROP POLICY IF EXISTS system_audit_logs_select_policy ON public.system_audit_logs;
CREATE POLICY system_audit_logs_select_policy ON public.system_audit_logs
  FOR SELECT TO public
  USING (false); -- Only backend Admin client can read

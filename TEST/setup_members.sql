-- SQL Script to create the `miembros` table and setup RLS rules.
-- Copy and paste this entirely into the Supabase SQL Editor and run it.

CREATE TABLE IF NOT EXISTS public.miembros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    bio TEXT,
    intereses TEXT[],
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.miembros ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can insert (so public forms work for new registrations)
CREATE POLICY miembros_insert_policy ON public.miembros 
FOR INSERT WITH CHECK (true);

-- 2. Only users inside the `admin_roles` table can see the list of members
CREATE POLICY miembros_select_policy ON public.miembros 
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.admin_roles)
);

-- 3. Only admins can update members (approve, reject, etc)
CREATE POLICY miembros_update_policy ON public.miembros 
FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.admin_roles)
);

-- 4. Only admins can delete a member's record
CREATE POLICY miembros_delete_policy ON public.miembros 
FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.admin_roles)
);

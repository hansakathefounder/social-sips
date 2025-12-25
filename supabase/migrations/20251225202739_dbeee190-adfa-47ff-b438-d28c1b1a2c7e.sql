-- Allow users to create their own role (user or restaurant_owner only, no admin)
CREATE POLICY "Users can create their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('user'::public.app_role, 'restaurant_owner'::public.app_role)
);
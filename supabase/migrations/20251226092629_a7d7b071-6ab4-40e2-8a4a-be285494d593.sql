-- Allow authenticated users to read all user_selected_restaurants (required for matching)
CREATE POLICY "Authenticated users can view all user selected restaurants"
ON public.user_selected_restaurants
FOR SELECT
TO authenticated
USING (true);
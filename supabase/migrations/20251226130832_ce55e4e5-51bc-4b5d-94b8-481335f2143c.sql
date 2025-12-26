-- Add status enum for restaurant approval workflow
CREATE TYPE public.restaurant_status AS ENUM ('pending', 'approved', 'rejected');

-- Add new columns to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS status public.restaurant_status NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Update existing restaurants to be approved (they were already public)
UPDATE public.restaurants SET status = 'approved' WHERE status = 'pending';

-- Drop existing SELECT policy and create new one that only shows approved restaurants to public
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON public.restaurants;

-- Public can only see approved restaurants
CREATE POLICY "Public can view approved restaurants" 
ON public.restaurants 
FOR SELECT 
USING (
  status = 'approved' 
  OR auth.uid() = owner_id 
  OR auth.uid() = created_by
  OR has_role(auth.uid(), 'admin')
);

-- Update INSERT policy to allow any authenticated user to submit restaurants
DROP POLICY IF EXISTS "Restaurant owners can insert restaurants" ON public.restaurants;

CREATE POLICY "Authenticated users can submit restaurants" 
ON public.restaurants 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (created_by = auth.uid() OR owner_id = auth.uid()));

-- Update UPDATE policy to allow owners/creators to edit, and admins to approve
DROP POLICY IF EXISTS "Restaurant owners can update their restaurants" ON public.restaurants;

CREATE POLICY "Owners and admins can update restaurants" 
ON public.restaurants 
FOR UPDATE 
USING (
  auth.uid() = owner_id 
  OR auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin')
);

-- Add DELETE policy for admins
CREATE POLICY "Admins can delete restaurants" 
ON public.restaurants 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));
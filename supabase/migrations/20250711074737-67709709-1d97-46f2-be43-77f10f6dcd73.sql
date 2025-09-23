-- Allow users to delete their own edit history entries to remove erroneous examples
CREATE POLICY "Users can delete their own edit history" 
ON public.product_edit_history 
FOR DELETE 
USING (auth.uid() = user_id);
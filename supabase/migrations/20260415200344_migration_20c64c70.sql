-- Add DELETE policy for surveys table
CREATE POLICY "anon_delete_surveys" ON surveys
  FOR DELETE
  USING (true);

-- Add DELETE policy for survey_responses table (just in case)
CREATE POLICY "anon_delete_responses" ON survey_responses
  FOR DELETE
  USING (true);

-- Add UPDATE policy for surveys table (for completing surveys)
CREATE POLICY "anon_update_surveys" ON surveys
  FOR UPDATE
  USING (true);
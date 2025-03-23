
-- Create a function to help debug
CREATE OR REPLACE FUNCTION public.debug_get_projects()
RETURNS SETOF json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT json_agg(p)
  FROM (
    SELECT *
    FROM public.projects
  ) p;
END;
$$;

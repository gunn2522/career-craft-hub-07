-- Reload PostgREST schema cache to recognize new tables
NOTIFY pgrst, 'reload schema';
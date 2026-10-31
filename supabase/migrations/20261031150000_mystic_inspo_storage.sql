-- Inspo photos for Mystic bookings (client upload on /visits)

INSERT INTO storage.buckets (id, name, public)
VALUES ('mystic-inspo', 'mystic-inspo', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Mystic inspo publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mystic-inspo');

CREATE POLICY "Clients upload own mystic inspo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'mystic-inspo'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

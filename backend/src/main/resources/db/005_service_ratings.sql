BEGIN;
CREATE TABLE IF NOT EXISTS service_ratings (
  id varchar(255) PRIMARY KEY,
  reservation_id varchar(255) NOT NULL UNIQUE,
  author_id bigint NOT NULL,
  author_name varchar(255) NOT NULL,
  kind varchar(255) NOT NULL CHECK (kind IN ('TOUR', 'HOTEL')),
  catalog_id bigint NOT NULL,
  stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text NOT NULL,
  image text,
  created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS service_ratings_catalog ON service_ratings(kind,catalog_id,stars,created_at);
COMMIT;

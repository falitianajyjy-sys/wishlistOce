CREATE TABLE IF NOT EXISTS gifts (
                                     id          SERIAL PRIMARY KEY,
                                     name        TEXT NOT NULL,
                                     emoji       TEXT NOT NULL DEFAULT '🎁',
                                     description TEXT,
                                     image_url   TEXT,
                                     claimed_by  TEXT,
                                     claimed_at  TIMESTAMPTZ,
                                     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
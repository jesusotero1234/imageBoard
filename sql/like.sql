DROP TABLE IF EXISTS likes ;

  CREATE TABLE likes (
      id SERIAL PRIMARY KEY,
      userId VARCHAR(255),
      liked VARCHAR(255),
      dislike VARCHAR(255),
      imageID INT references images(id)  ON DELETE CASCADE ,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
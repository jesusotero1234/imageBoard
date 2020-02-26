  CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      comment VARCHAR(255) NOT NULL,
      image_id INT NOT NULL references images(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
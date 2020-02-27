const spicePg = require('spiced-pg');



const db = spicePg( process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/imageboard')


//Insert User information
exports.imagesData = function() {
    return db.query(
        `SELECT * FROM images
        ORDER BY id DESC
        LIMIT 2`
    )
}

//Insert User information
exports.InsertUpload = function(url, username, title,description) {
    return db.query(
        `INSERT INTO images (url, username, title,description)
        VALUES ($1, $2, $3,$4)  `,
        [url, username, title,description]
    )
}

//Retrieve single image
exports.singleImage = function(id) {
    return db.query(
        `SELECT username,url, title,description, created_at FROM images
       WHERE id=$1`,
        [id]
    )
}

//save comments
exports.saveComment = function(username, comment, image_id) {
    return db.query(
        `INSERT INTO comments (username, comment,image_id)
        VALUES ($1, $2,$3)  `,
        [username, comment, image_id]
    )
}

//retrieve comments
exports.comments = function(id) {
    return db.query(
        `SELECT * FROM comments
        WHERE image_id=$1
        ORDER BY created_at DESC`,
        [id]
    )
}

//Query to get more images
exports.getMoreImages = lastId => db.query(
    `SELECT * FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 4 `,
    [lastId]
).then(
    ({rows}) => rows
);

exports.finished = (id)=>db.query(
    `SELECT url, title, id, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1) AS "lowestId" FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 4`,[id]
).then(({rows})=>rows)

//Subquery to compare if we reach the end



const spicePg = require('spiced-pg');



const db = spicePg( process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/imageboard')


//Insert User information
exports.imagesData = function() {
    return db.query(
        `SELECT * FROM images`
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
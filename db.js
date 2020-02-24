const spicePg = require('spiced-pg');



const db = spicePg( process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/imageboard')


//Insert User information
exports.imagesData = function() {
    return db.query(
        `SELECT * FROM images`
    )
}
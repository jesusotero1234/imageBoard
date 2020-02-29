const spicePg = require('spiced-pg');
    


const db = spicePg( process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/imageboard')


//Insert User information
exports.imagesData = function() {
    return db.query(
        `SELECT * FROM images
        ORDER BY id DESC
        LIMIT 6`
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


//Subquery to compare if we reach the end
exports.finished = (id)=>db.query(
    `SELECT url, title, id, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1) AS "lowestId" FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 4`,[id]
).then(({rows})=>rows)

//Check all the images id
exports.allImages= function() {
    return db.query(
        `SELECT id FROM images`
    ).then(({rows})=> rows)
}

//insert UserId for likes
exports.saveUserID = function(userId) {
    return db.query(
        `INSERT INTO likes (userId)
        VALUES ($1)  `,
        [userId]
    )
}

//save seeLikes
exports.imageUrlData = function(userId,imageID) {
    return db.query(
        `INSERT INTO likes (userId,imageId)
        VALUES ($1,$2)  `,
        [userId,imageID]
    )
}

// info of the likes table
exports.likesTable = function(userId,imageID) {
    return db.query(
        `SELECT * FROM likes
        WHERE userID=$1 AND imageID =$2
        `,
        [userId,imageID]
    ).then(({rows})=> rows)
}

//save Likes/Dislikes
exports.saveLikes= function(liked,dislike,userId,imageID) {
    return db.query(
        `UPDATE likes 
        SET liked=$1, dislike=$2
        WHERE userID =$3 AND imageID=$4   `,
        [liked,dislike,userId,imageID]
    )
}

//All likes from tables
exports.likesTableforModal = function(imageID) {
    return db.query(
        `SELECT liked,dislike FROM likes
        WHERE imageID =$1
        `,
        [imageID]
    ).then(({rows})=> rows)
}

//Delete From Database
exports.deleteImage = function(url) {
    return db.query(
        `DELETE FROM images 
        WHERE url=$1
        `,
        [url]
    ).then(({rows})=> rows)
}

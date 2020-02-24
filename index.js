const express = require('express');
const app = express();
const {imagesData} = require('./db.js')//?

app.use(express.static('public'));

//any routes are just for info/data

// app.get('/cities', (req, res) => {
//     //this is going to be hooked up with the database
//     const cities = [
//         {
//             name: 'Valencia',
//             country: 'Venezuela'
//         },
//         {
//             name: 'Quito',
//             country: 'Ecuador'
//         },
//         {
//             name: 'Kinross',
//             country: 'Scotland'
//         }
//     ];
//     res.json(cities);
// });


app.get('/images', (req, res) => {
    //this is going to be hooked up with the database
    imagesData().then(response=>res.json(response));
});

app.listen(8080, () => console.log('server is running'));

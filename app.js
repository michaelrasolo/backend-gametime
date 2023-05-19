require('dotenv').config();
require("./models/connection");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var playgroundsRouter = require('./routes/playgrounds');
const fileUpload = require('express-fileupload');
var sessionsRouter = require('./routes/sessions');

const cors = require("cors") // Cors installation

var app = express();
app.use(cors()) // Cors installation
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/playgrounds', playgroundsRouter);
app.use(fileUpload());
app.use('/sessions', sessionsRouter);

// const Playground = require('./models/playgrounds');
// fetch('https://equipements.sports.gouv.fr/api/explore/v2.0/catalog/datasets/data-es/exports/json?where=typequipement%3D%22Terrain%20de%20basket-ball%22&lang=fr&timezone=Europe%2FParis&use_labels=false&epsg=4326')
// .then(response => response.json())
// .then(data => {
//     for (let item of data) {
//         if (!item.nominstallation.toLowerCase().includes("ecole")
//          && !item.nominstallation.toLowerCase().includes("lycee") 
//          && !item.nominstallation.toLowerCase().includes("college") 
//          && !item.nominstallation.toLowerCase().includes("collège")
//          && !item.nominstallation.toLowerCase().includes("lycée")
//          && !item.nominstallation.toLowerCase().includes("lycee")
//          && !item.nominstallation.toLowerCase().includes("scolaire")
//          && item.caract25 == "true"
//          ) {
//         const newPlayground = new Playground({
//             name: item.nominstallation,
//             photo: Math.floor(Math.random() * 6) + 1,
//             country: "France",
//             postCode: item.codepostal,
//             city:item.commune,
//             address: item.adresse,
//             latitude: item.coordgpsy,
//             longitude: item.coordgpsx,
//         });

//         newPlayground.save().then(
//             console.log('playgroundsaved')
//         )
//     }
//     Playground.find()
//         .then(data => res.json(data))
// }}
// )


module.exports = app;

const mongoose = require('mongoose'); //utiliser mongoose
const connectionString = process.env.CONNECTION_STRING; // add URL in dotenv
mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
.then(() => console.log('Database connected ✅')) //connexion à la db + indication terminal
.catch(error => console.error(error)); // affiche erreur si pas de connexion
var express = require('express');
var router = express.Router();
require('../models/connection');
const Playground = require('../models/playgrounds');
const User = require("../models/users");

/* GET home page. */
router.get('/initialpush', (req, res) => {
    fetch('https://equipements.sports.gouv.fr/api/explore/v2.0/catalog/datasets/data-es/exports/json?where=typequipement%3D%22Terrain%20de%20basket-ball%22&lang=fr&timezone=Europe%2FParis&use_labels=false&epsg=4326')
        .then(response => response.json())
        .then(data => {
            for (let item of data) {
                if (!item.nominstallation.toLowerCase().includes("ecole")
                 && !item.nominstallation.toLowerCase().includes("lycee") 
                 && !item.nominstallation.toLowerCase().includes("college") 
                 && !item.nominstallation.toLowerCase().includes("collège")
                 && !item.nominstallation.toLowerCase().includes("lycée")
                 && !item.nominstallation.toLowerCase().includes("lycee")
                 && !item.nominstallation.toLowerCase().includes("scolaire")
                 ) {
                const newPlayground = new Playground({
                    name: item.nominstallation,
                    photo: Math.floor(Math.random() * 6) + 1,
                    country: "France",
                    postCode: item.codepostal,
                    city:item.commune,
                    address: item.adresse,
                    latitude: item.coordgpsy,
                    longitude: item.coordgpsx,
                });

                newPlayground.save().then(
                    console.log('playgroundsaved')
                )
            }
            Playground.find()
                .then(data => res.json(data))
        }}
        )
})

router.get('/', (req,res) => {
    Playground.find()
                .then(data => res.json(data))
})

router.put('/name/:playgroundName', (req,res) => {
    Playground.find({name:req.params.playgroundName})
                .then(data => res.json(data))
})

router.put('/city/:cityName', (req, res) => {
    Playground.find({ city: req.params.cityName})
      .then(data => res.json(data))
      .catch(error => res.status(500).json({ error: 'An error occurred while retrieving playgrounds.' }));
  });


//   router.put('/:latitude/:longitude', async (req, res) => {
//     const radius = 10; // Radius in kilometers

//     try {
//       const playgrounds = await Playground.find({
//         $where: function() {
//           // Haversine formula for calculating distance
//           function calculateDistance(lat1, lon1, lat2, lon2) {
//             const R = 6371; // Radius of the Earth in kilometers
//             const dLat = toRad(lat2 - lat1);
//             const dLon = toRad(lon2 - lon1);
//             const a =
//               Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//               Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//             const distance = R * c;
//             return distance;
//           }
  
//           function toRad(value) {
//             return (value * Math.PI) / 180;
//           }
  
//           const distance = calculateDistance(this.latitude, this.longitude, parseFloat(req.params.latitude), parseFloat(req.params.longitude));
//           return distance <= radius;
//         },
//       });
  
//       res.json(playgrounds);
//     } catch (error) {
//       res.status(500).json({ message: 'An error occurred while retrieving the playgrounds.' });
//     }
//   });
  

// route to get user's favorite playgrounds
router.get('/favorites/:token', (req, res) => {
    User.findOne({ token: req.params.token })
    .populate('favoritePlaygrounds')
    .then(userData => {
      if (!userData) {
        res.json({ result: false, error: 'No user found' })
       } else if (!userData.favoritePlaygrounds.length > 0) {
        res.json({ result: false, error: 'This user has no favorite playgrounds' })
        } else {
            res.json({result : true, favoritePlaygrounds : userData.favoritePlaygrounds})
        }
   })
  })

// route to delete favorite playground
router.put('/removeFavorite', (req, res) => {
    User.findOne({ token: req.body.token })
        .then(userData => {
            if (!userData) {
                res.json({ result: false, error: 'No user found' });
            } else {
                const favoritePlayground = userData.favoritePlaygrounds.find(playground => String(playground._id) === req.body.playgroundId);
                if (!favoritePlayground) {
                    res.json({ result: false, error: 'No favorite playground found' });
                } else {
                    userData.favoritePlaygrounds.pull(req.body.playgroundId);
                    userData.save();
                    res.json({ result: true, Message : 'Playground was removed from user favorite' });
                }
            }
        })
});

// route to add favorite playground
router.put('/addFavorite/:token', (req, res) => {
    User.findOne({ token: req.body.token })
      .then(userData => {
        if (!userData) {
          res.json({ result: false, error: 'No user found' });
        } else {
          const existingPlayground = userData.favoritePlaygrounds.find(playground => String(playground._id) === req.body.playgroundId);
  
          if (existingPlayground) {
            res.json({ result: false, error: 'Playground already exists in favorites' });
          } else {
            const newPlayground = { _id: req.body.playgroundId };
            userData.favoritePlaygrounds.push(newPlayground);
            userData.save()
              .then(() => {
                res.json({ result: true, message: 'Playground added to favorites' });
              })
              .catch(error => {
                res.json({ result: false, error: 'An error occurred while saving user data' });
              });
          }
        }
      })
      .catch(error => {
        res.json({ result: false, error: 'An error occurred while finding the favorite playground' });
      });
  });

module.exports = router;
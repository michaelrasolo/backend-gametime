var express = require('express');
var router = express.Router();
require('../models/connection');
const Playground = require('../models/playgrounds');
const Session = require('../models/sessions');
const User = require("../models/users");

/* Route qui récupère les terrains de la base de données du gouvernvement et les load dans notre base de données */
router.get('/initialpush', (req, res) => {
    fetch('https://equipements.sports.gouv.fr/api/explore/v2.0/catalog/datasets/data-es/exports/json?where=typequipement%3D%22Terrain%20de%20basket-ball%22&lang=fr&timezone=Europe%2FParis&use_labels=false&epsg=4326')
        .then(response => response.json())
        .then(data => {
            for (let item of data) { 
              //filtres pour enlever les terrains d'établissements scolaires
                if (!item.nominstallation.toLowerCase().includes("ecole")
                 && !item.nominstallation.toLowerCase().includes("lycee") 
                 && !item.nominstallation.toLowerCase().includes("college") 
                 && !item.nominstallation.toLowerCase().includes("collège")
                 && !item.nominstallation.toLowerCase().includes("lycée")
                 && !item.nominstallation.toLowerCase().includes("lycee")
                 && !item.nominstallation.toLowerCase().includes("scolaire")
                 && item.caract25 == "true" //filtre pour garder seulement les terrains accessibles
                 ) {
                const newPlayground = new Playground({
                    name: item.nominstallation,
                    photo: Math.floor(Math.random() * 6) + 1,
                    country: "France",
                    postCode: item.codepostal,
                    city:item.commune,
                    address: item.adresse,
                    location: {
                      type: 'Point',
                      coordinates: [item.coordgpsx, item.coordgpsy]
                    },
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

// ====== ROUTE GET ALL PLAYGROUNDS BY CITY NAME====== //
// Récupère tous les playgrounds dont la ville commence par le params cityName
router.put('/city/:cityName', (req, res) => {
  const regex = new RegExp(`^${req.params.cityName}`, 'i'); // 'i' flag for case-insensitive matching
  Playground.find({ city: regex })
    .then(data => res.json(data))
    .catch(error => res.status(500).json({ error: 'An error occurred while retrieving playgrounds.' }));
});



// ====== ROUTE GET ALL SESSION BY PLAYGROUND ID ====== //

router.get('/:playgroundid', (req, res) => {
  Session.find({ playground: req.params.playgroundid })
  .populate('playground')
    .then((sessions) => {
      res.json({result:true, sessions});
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    });
});


// ====== ROUTE POST ALL PLAYGROUNDS AROUND A LONTITUDE AND LONGITUDE ====== //
// Récupère tous les playgrounds dans un rayon de autour de la latitude et longitude de l'utilisateur, avec l'information du nombre de sessions.
router.post('/nearby', (req, res) => {
  const longitude = parseFloat(req.body.longitude);
  const latitude = parseFloat(req.body.latitude);

  if (isNaN(longitude) || isNaN(latitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const query = {
    location: {
      $geoWithin: {
        $center: [
          [longitude, latitude],
          600 / 6371,
        ],
      },
    },
  };

  Playground.find(query)
    .populate('location.coordinates')
    .exec()
    .then((data) => {
      const transformedData = data.map((item) => {
        const { _id } = item;
        return User.findOne({ token: req.body.token })
          .exec()
          .then((user) => {
            const isLiked = user && user.favoritePlaygrounds.includes(_id);
            return {
              ...item.toObject(),
              coordinates: item.location.coordinates,
              isLiked,
            };
          });
      });

      Promise.all(transformedData)
        .then((results) => res.json(results))
        .catch((error) => {
          console.error('Error:', error);
          res.status(500).json({ error: 'An error occurred' });
        });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    });
});


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

  //Route retournant un boolean (retourne true si l'utilisateur a ce terrain en favoris, false sinon)
  router.get('/isLiked/:token/:playground', (req, res) => {
    User.findOne({ token: req.params.token })
    .populate('favoritePlaygrounds')
    .then(userData => {
      if (!userData) {
        res.json({ result: false, error: 'No user found' })
       } else if (!userData.favoritePlaygrounds.length > 0) {
      Playground.findOne({_id: req.params.playground})
      .then(data => 
       { const isLiked = userData.favoritePlaygrounds.includes(data._id)
       res.json({isLiked})}
       )
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
router.put('/addFavorite/', (req, res) => {
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


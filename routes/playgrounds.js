var express = require('express');
var router = express.Router();
require('../models/connection');
const Playground = require('../models/playgrounds');
const Session = require('../models/sessions');

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
                    location: {
                      type: 'Point',
                      coordinates: [item.coordgpsx, item.coordgpsy]
                    },
                    // latitude: item.coordgpsy,
                    // longitude: item.coordgpsx,
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

// ============ END OF THE ROUTE ============ //


router.post('/nearby', async (req, res) => {
    const longitude = parseFloat(req.body.longitude);
    const latitude = parseFloat(req.body.latitude);
    console.log(longitude)
    console.log(latitude)

    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const query = {
      location: 
      {$geoWithin: { $center: [
        [longitude,latitude],
          500/6371 
        ] }
 }
    }

    Playground.find(query)
    .populate('location.coordinates') 
    .then(data => res.json(data))
    

 
});

module.exports = router;


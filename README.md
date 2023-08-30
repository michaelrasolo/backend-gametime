
![Logo](https://res.cloudinary.com/dwccdtirq/image/upload/v1693409864/GameTime/logo_shadow_mt15kn.jpg)


# 

GameTime is a basketball application helping players to find playgrounds, other players and organized games.

It is the final project of the coding bootcamp [La Capsule](https://www.lacapsule.academy/formation-developpeur-web/full-time).
This exercise has been done in 10 days, and shall remain as it was at the end of the project.

Clean code and new features might be added on personnal copies of the repositories


## Demo

- [Full video](https://drive.google.com/file/d/1LtxMaIspYyy1IxkUKa4b7Xka9DObgOIy/view)

- Screens
## Installation

Install this project with yarn

**Backend**
```bash
  git clone https://github.com/michaelrasolo/backend-gametime.git
  yarn install
  nodemon
```

**Frontend**
```bash
  git clone https://github.com/michaelrasolo/gametime-front.git
  yarn install
  yarn expo
```
In the frontend terminal, find your IP address on the following line
```bash
  Metro waiting on exp://192.168.1.74:19000
```

Copy the IP address in the file config.js while keeping the port 3000.
```bash
const Config = {
    IPAdresse: "http://192.168.1.74:3000",
  };
  
  export default Config;
```
**Expo**

Download and install the application Expo Go on your mobile phone or on your emulator.

Scan the QR code in the frontend terminal with Expo Go and test the application.
## Tech Stack

**Client:** React Native, Expo, Redux, MaterialUI, Socket.io

**Server:** Node, Express, Mongoose, Socket.io

**Database:** MongoDB


## Authors

- Michaël RASOLONJATOVO

  [![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mrasolon)[![github](https://img.shields.io/badge/github-040303?style=for-the-badge&logo=github&logoColor=white)](https://github.com/michaelrasolo)
- Wendy GILLES

  [![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/wendy-gilles-8b83471a8)[![github](https://img.shields.io/badge/github-040303?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dyywen)
- Pierre-Baptiste ROZIC

   [![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pierre-baptiste-rozic-6098ab90)[![github](https://img.shields.io/badge/github-040303?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pbarozic)
- Julien BONYADI

   [![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/julien-bonyadi)[![github](https://img.shields.io/badge/github-040303?style=for-the-badge&logo=github&logoColor=white)](https://github.com/galfior)

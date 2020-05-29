This project is developed by using NodeJS and React with Firebase

## What is Safebox?

Safebox is a project built with NodeJS and React on Firebase to create a web service that manage borrowing/returning using MQTT and subscribe it with Arduino board in order to control the box itself

## Features

- Users Account (Register / Login / Logout)
- Checking status of available device
- Locate Device
- Borrowing Device
- Returning Device
- Posting status of locker through MQTT for Arduino to act
- Reading status of locker through MQTT from Arduino

**Although, adding and removing device could be done through Firebase Firestore**

## Directory

- src => React 
- functions => Node Backend
- *.ino file => Arduino Code File


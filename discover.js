function getRandom() {
    firebase.storage().ref('/games').once('value').then(snapshot {
        Math.floor((Math.random() * snapshot.numChildren()));
    });
}
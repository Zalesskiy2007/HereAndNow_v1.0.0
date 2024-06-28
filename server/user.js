import mongoose from 'mongoose';

let UserS = new mongoose.Schema({
    name: String,
    login: String,
    password: String,
    coordLng: Number,
    coordLat: Number,
    sessionId: Number,
    friends: [String],
    friendsReceivedReq: [String],
    friendsSentReq: [String],
    imageSrc: String,
    imageWidth: Number,
    imageHeight: Number,
    trackingGeo: Boolean,
    mapStyle: Number
});

let User = mongoose.model('MZ2_ED2_HereAndNow_Users', UserS);
//let User = mongoose.model('Users', UserS);
export { User };

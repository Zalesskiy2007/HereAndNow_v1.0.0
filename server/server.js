import http from 'https';
import express from 'express';
import morgan from 'morgan';
import { Server } from 'socket.io';
import fs, { rmSync } from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import jwt from 'jsonwebtoken';
import generateUniqueId from 'generate-unique-id';

import { User } from './user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cookieNoneValue = '-1';
const isNumber = (num) => {
    return !isNaN(Number(num));
};

const app = express();
app.use(morgan('combined'));
app.use(express.static('.'));
app.use(express.static('../client'));
app.use(express.static('../client/assets/fonts'));
app.use(express.static('../client/assets/images'));
app.use(express.static('../client/styles'));
app.use(express.static('../node_modules/maplibre-gl/dist'));

app.get('/login', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../out/index.html'));
});
app.get('/register', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../out/index.html'));
});
app.get('/map', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../out/index.html'));
});
app.get('/friends', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../out/index.html'));
});
app.get('/settings', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../out/index.html'));
});
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../out/index.html'));
});

app.use('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../out/pageNotFound.html'));
});

const server = http.createServer(
    {
        key: fs.readFileSync('../cert/key.pem'),
        cert: fs.readFileSync('../cert/cert.pem')
    },
    app
);

const io = new Server(server, {
    maxHttpBufferSize: 1e8, // something about 100mb,
    pingInterval: 25000,
    pingTimeout: 60000
});

let dbPml30 = 'mongodb+srv://doadmin:x62jNC54Pi1W3t98@db-mongodb-pml30-2024-12312526.mongo.ondigitalocean.com/admin?tls=true&authSource=admin';
let dbLocal = 'mongodb://127.0.0.1:27017/HereAndNow';

//mongoose.connect('mongodb://127.0.0.1:27017/HereAndNow');
mongoose.connect(dbPml30, { dbName: 'PML30-2024-S' });

io.on('connection', (socket) => {
    console.log(`Client connected with id: ${socket.id}`);

    // Clear database
    /*User.find()
        .then((res) => {
            for (let i = 0; i < res.length; i = i + 1) {
                User.deleteOne({ login: res[i].login })
                    .then(() => {
                        console.log('Deleted succeed!');
                    })
                    .catch((err) => console.log(err));
            }
        })
        .catch((err) => console.log(err));*/

    socket.on('checkLogin', (data) => {
        let obj = {
            status: 'null'
        };

        if (data === '') {
            obj.status = 'null';
            socket.emit('checkLoginResponse', JSON.stringify(obj));
        } else {
            User.findOne({ login: data })
                .then((res) => {
                    if (res !== null) obj.status = 'not_avaliable';
                    else obj.status = 'avaliable';

                    socket.emit('checkLoginResponse', JSON.stringify(obj));
                })
                .catch((err) => {
                    console.log('Error: ' + err);
                    obj.status = 'null';
                    socket.emit('checkLoginResponse', JSON.stringify(obj));
                });
        }
    });

    socket.on('loginSubmit', (data) => {
        let d = JSON.parse(data);

        User.findOne({ login: d.login })
            .then((res) => {
                if (res !== null) {
                    if (res.password === d.password) {
                        User.find()
                            .then((r) => {
                                let s = true;
                                let g = -1;

                                while (s) {
                                    let newSesId = generateUniqueId({
                                        length: 20,
                                        useLetters: false,
                                        useNumbers: true
                                    });

                                    if (!isNumber(newSesId)) {
                                        continue;
                                    }

                                    let f = false;
                                    for (let i = 0; i < res.length; i = i + 1) {
                                        if (r[i].sessionId === newSesId) {
                                            f = true;
                                            break;
                                        }
                                    }

                                    if (!f) {
                                        s = false;
                                        g = newSesId;
                                    }
                                }

                                User.updateOne({ login: d.login }, { sessionId: g })
                                    .then((q) => {
                                        socket.emit('logIn', JSON.stringify({ sesId: g }));
                                    })
                                    .catch((p) => {
                                        console.log('Error: ' + p);
                                    });
                            })
                            .catch((e) => {
                                console.log('Error: ' + e);
                            });
                    } else {
                        socket.emit('incorrectPassOrLog');
                    }
                } else {
                    socket.emit('incorrectPassOrLog');
                }
            })
            .catch((err) => {
                console.log('Error: ' + err);
            });
    });

    socket.on('registerSubmit', (data) => {
        let d = JSON.parse(data);

        User.find()
            .then((res) => {
                let search = true;
                let gen = -1;

                while (search) {
                    let newSesId = generateUniqueId({
                        length: 20,
                        useLetters: false,
                        useNumbers: true
                    });

                    if (!isNumber(newSesId)) {
                        continue;
                    }

                    let find = false;
                    for (let i = 0; i < res.length; i = i + 1) {
                        if (res[i].sessionId === newSesId) {
                            find = true;
                            break;
                        }
                    }

                    if (!find) {
                        search = false;
                        gen = newSesId;
                    }
                }

                let pers = new User({
                    name: d.name,
                    login: d.login,
                    password: d.password,
                    coordLng: 0,
                    coordLat: 0,
                    sessionId: gen,
                    friends: [],
                    friendsReceivedReq: [],
                    friendsSentReq: [],
                    imageSrc: d.img,
                    imageWidth: d.imgW,
                    imageHeight: d.imgH,
                    trackingGeo: true,
                    mapStyle: 0
                });

                pers.save()
                    .then((res) => {
                        socket.emit('logIn', JSON.stringify({ sesId: res.sessionId }));
                    })
                    .catch((err) => {
                        console.log('Error: ' + err);
                    });
            })
            .catch((err) => {
                console.log('Error: ' + err);
            });
    });

    socket.on('requestPerson', (data) => {
        if (data !== cookieNoneValue) {
            let sId = parseInt(data);

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        let obj = {
                            name: res.name,
                            login: res.login,
                            id: res._id,
                            coordLng: res.coordLng,
                            coordLat: res.coordLat,
                            friends: res.friends,
                            friendsReceivedReq: res.friendsReceivedReq,
                            friendsSentReq: res.friendsSentReq,
                            imageSrc: res.imageSrc,
                            trackingGeo: res.trackingGeo,
                            mapStyle: res.mapStyle
                        };

                        socket.emit('setPerson', JSON.stringify(obj));
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('requestFriends', (data) => {
        if (data !== cookieNoneValue) {
            let sId = parseInt(data);

            let findById = (num, a) => {
                for (let i = 0; i < a.length; i++) {
                    if (a[i].id === num) {
                        return true;
                    }
                }

                return false;
            };

            let getById = (num, a) => {
                for (let i = 0; i < a.length; i++) {
                    if (a[i].id === num) {
                        return a[i];
                    }
                }

                return null;
            };

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        let usArr = [];
                        let toDel = [];
                        User.find()
                            .then((all) => {
                                for (let i = 0; i < res.friends.length; i++) {
                                    if (findById(res.friends[i], all)) {
                                        let a = getById(res.friends[i], all);
                                        let obj = {
                                            name: a.name,
                                            login: a.login,
                                            id: a._id,
                                            coordLng: a.coordLng,
                                            coordLat: a.coordLat,
                                            imageSrc: a.imageSrc,
                                            trackingGeo: a.trackingGeo
                                        };

                                        usArr.push(obj);
                                    } else {
                                        toDel.push(res.friends[i]);
                                    }
                                }

                                let newArr = res.friends.filter((q) => !toDel.includes(q));

                                User.updateOne({ sessionId: sId }, { friends: newArr })
                                    .then((k) => {
                                        socket.emit('setFriends', JSON.stringify({ stage: 'start' }));
                                        for (let i = 0; i < usArr.length; i++) {
                                            socket.emit('setFriends', JSON.stringify({ stage: 'add', friend: usArr[i] }));
                                        }
                                        socket.emit('setFriends', JSON.stringify({ stage: 'end' }));
                                    })
                                    .catch((p) => {});
                            })
                            .catch((j) => {
                                console.log('j ' + j);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('requestFriendsReceived', (data) => {
        if (data !== cookieNoneValue) {
            let sId = parseInt(data);

            let findById = (num, a) => {
                for (let i = 0; i < a.length; i++) {
                    if (a[i].id === num) {
                        return true;
                    }
                }

                return false;
            };

            let getById = (num, a) => {
                for (let i = 0; i < a.length; i++) {
                    if (a[i].id === num) {
                        return a[i];
                    }
                }

                return null;
            };

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        let usArr = [];
                        let toDel = [];
                        User.find()
                            .then((all) => {
                                for (let i = 0; i < res.friendsReceivedReq.length; i++) {
                                    if (findById(res.friendsReceivedReq[i], all)) {
                                        let a = getById(res.friendsReceivedReq[i], all);
                                        let obj = {
                                            name: a.name,
                                            login: a.login,
                                            id: a._id,
                                            coordLng: a.coordLng,
                                            coordLat: a.coordLat,
                                            imageSrc: a.imageSrc,
                                            trackingGeo: a.trackingGeo
                                        };

                                        usArr.push(obj);
                                    } else {
                                        toDel.push(res.friendsReceivedReq[i]);
                                    }
                                }

                                let newArr = res.friendsReceivedReq.filter((q) => !toDel.includes(q));

                                User.updateOne({ sessionId: sId }, { friendsReceivedReq: newArr })
                                    .then((k) => {
                                        socket.emit('setFriendsReceived', JSON.stringify({ stage: 'start' }));
                                        for (let i = 0; i < usArr.length; i++) {
                                            socket.emit('setFriendsReceived', JSON.stringify({ stage: 'add', friend: usArr[i] }));
                                        }
                                        socket.emit('setFriendsReceived', JSON.stringify({ stage: 'end' }));
                                    })
                                    .catch((p) => {});
                            })
                            .catch((j) => {
                                console.log('j ' + j);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('requestFriendsSent', (data) => {
        if (data !== cookieNoneValue) {
            let sId = parseInt(data);

            let findById = (num, a) => {
                for (let i = 0; i < a.length; i++) {
                    if (a[i].id === num) {
                        return true;
                    }
                }

                return false;
            };

            let getById = (num, a) => {
                for (let i = 0; i < a.length; i++) {
                    if (a[i].id === num) {
                        return a[i];
                    }
                }

                return null;
            };

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        let usArr = [];
                        let toDel = [];
                        User.find()
                            .then((all) => {
                                for (let i = 0; i < res.friendsSentReq.length; i++) {
                                    if (findById(res.friendsSentReq[i], all)) {
                                        let a = getById(res.friendsSentReq[i], all);
                                        let obj = {
                                            name: a.name,
                                            login: a.login,
                                            id: a._id,
                                            coordLng: a.coordLng,
                                            coordLat: a.coordLat,
                                            imageSrc: a.imageSrc,
                                            trackingGeo: a.trackingGeo
                                        };

                                        usArr.push(obj);
                                    } else {
                                        toDel.push(res.friendsSentReq[i]);
                                    }
                                }

                                let newArr = res.friendsSentReq.filter((q) => !toDel.includes(q));

                                User.updateOne({ sessionId: sId }, { friendsSentReq: newArr })
                                    .then((k) => {
                                        socket.emit('setFriendsSent', JSON.stringify({ stage: 'start' }));
                                        for (let i = 0; i < usArr.length; i++) {
                                            socket.emit('setFriendsSent', JSON.stringify({ stage: 'add', friend: usArr[i] }));
                                        }
                                        socket.emit('setFriendsSent', JSON.stringify({ stage: 'end' }));
                                    })
                                    .catch((p) => {});
                            })
                            .catch((j) => {
                                console.log('j ' + j);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('hideGeo', (data) => {
        if (data !== cookieNoneValue) {
            let sId = parseInt(data);

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.updateOne({ sessionId: sId }, { trackingGeo: false })
                            .then((q) => {})
                            .catch((p) => {
                                console.log('Error: ' + p);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('setGeo', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            let sId = parseInt(data.sId);

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.updateOne({ sessionId: sId }, { coordLat: data.lat, coordLng: data.lng })
                            .then((q) => {})
                            .catch((p) => {
                                console.log('Error: ' + p);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('settingsChangeGeo', (data) => {
        if (data !== cookieNoneValue) {
            let sId = parseInt(data);

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.updateOne({ sessionId: sId }, { trackingGeo: !res.trackingGeo })
                            .then((q) => {})
                            .catch((p) => {
                                console.log('Error: ' + p);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('settingsChangeMap', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            let sId = parseInt(data.sId);

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.updateOne({ sessionId: sId }, { mapStyle: data.style })
                            .then((q) => {})
                            .catch((p) => {
                                console.log('Error: ' + p);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('settingsChangePhoto', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            let sId = parseInt(data.sId);

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.updateOne({ sessionId: sId }, { imageSrc: data.newImg })
                            .then((q) => {})
                            .catch((p) => {
                                console.log('Error: ' + p);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('settingsLogout', () => {
        socket.emit('logOut');
    });

    socket.on('settingsDeleteAccount', (data) => {
        if (data !== cookieNoneValue) {
            let sId = parseInt(data);

            User.deleteOne({ sessionId: sId })
                .then(() => {
                    socket.emit('logOut');
                })
                .catch((err) => {
                    console.log('Error: ' + err);
                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('addFriend', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            let sId = parseInt(data.sId);
            let id = data.id;
            console.log(data.id);

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        if (res.friendsReceivedReq.includes(id)) {
                            User.updateOne({ sessionId: sId }, { friendsReceivedReq: res.friendsReceivedReq.filter((e) => e !== id), friends: [...res.friends, id] })
                                .then((u) => {})
                                .catch((q) => {
                                    console.log('Erfror: ' + q);
                                });

                            User.findOne({ _id: id })
                                .then((w) => {
                                    if (w) {
                                        User.updateOne({ _id: id }, { friendsSentReq: w.friendsSentReq.filter((e) => e !== res.id), friends: [...w.friends, res.id] })
                                            .then((u) => {})
                                            .catch((q) => {
                                                console.log('Esrror: ' + q);
                                            });
                                    }
                                })
                                .catch((er) => {});
                        } else {
                            console.log('abc');
                            User.updateOne({ sessionId: sId }, { friendsSentReq: [...res.friendsSentReq, id] })
                                .then((u) => {})
                                .catch((q) => {
                                    console.log('Erbror: ' + q);
                                });

                            User.findOne({ _id: id })
                                .then((w) => {
                                    if (w) {
                                        User.updateOne({ _id: id }, { friendsReceivedReq: [...w.friendsReceivedReq, res.id] })
                                            .then((u) => {
                                                console.log('abc-u');
                                            })
                                            .catch((q) => {
                                                console.log('Errtor: ' + q);
                                            });
                                    }
                                })
                                .catch((er) => {});
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('deleteFriend', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            let sId = parseInt(data.sId);
            let id = data.id;

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.findOne({ _id: id })
                            .then((fi) => {
                                if (fi) {
                                    User.updateOne(
                                        { _id: id },
                                        {
                                            friends: fi.friends.filter((b) => b !== res.id),
                                            friendsReceivedReq: fi.friendsReceivedReq.filter((b) => b !== res.id),
                                            friendsSentReq: fi.friendsSentReq.filter((b) => b !== res.id)
                                        }
                                    )
                                        .then((hanR) => {})
                                        .catch((hanE) => {});
                                }
                            })
                            .catch((f) => {
                                console.log(f);
                            });

                        User.findOne({ sessionId: sId })
                            .then((fi) => {
                                User.updateOne(
                                    { sessionId: sId },
                                    {
                                        friends: fi.friends.filter((b) => b !== id),
                                        friendsReceivedReq: fi.friendsReceivedReq.filter((b) => b !== id),
                                        friendsSentReq: fi.friendsSentReq.filter((b) => b !== id)
                                    }
                                )
                                    .then((hanR) => {})
                                    .catch((hanE) => {});
                            })
                            .catch((f) => {
                                console.log(f);
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('acceptFriend', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            let sId = parseInt(data.sId);
            let id = data.id;

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.updateOne({ sessionId: sId }, { friendsReceivedReq: res.friendsReceivedReq.filter((e) => e !== id), friends: [...res.friends, id] })
                            .then((u) => {})
                            .catch((q) => {
                                console.log('Erfror: ' + q);
                            });

                        User.findOne({ _id: id })
                            .then((w) => {
                                if (w) {
                                    User.updateOne({ _id: id }, { friendsSentReq: w.friendsSentReq.filter((e) => e !== res.id), friends: [...w.friends, res.id] })
                                        .then((u) => {})
                                        .catch((q) => {
                                            console.log('Esrror: ' + q);
                                        });
                                }
                            })
                            .catch((er) => {});
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('declineFriend', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            let sId = parseInt(data.sId);
            let id = data.id;

            User.findOne({ sessionId: sId })
                .then((res) => {
                    if (!res) {
                        socket.emit('logOut');
                    } else {
                        User.updateOne({ sessionId: sId }, { friendsReceivedReq: res.friendsReceivedReq.filter((e) => e !== id) })
                            .then((u) => {})
                            .catch((q) => {
                                console.log('Erfror: ' + q);
                            });

                        User.findOne({ _id: id })
                            .then((w) => {
                                if (w) {
                                    User.updateOne({ _id: id }, { friendsSentReq: w.friendsSentReq.filter((e) => e !== res.id) })
                                        .then((u) => {})
                                        .catch((q) => {
                                            console.log('Esrror: ' + q);
                                        });
                                }
                            })
                            .catch((er) => {});
                    }
                })
                .catch((err) => {
                    console.log(err);

                    socket.emit('logOut');
                });
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('searchUsers', (d) => {
        let data = JSON.parse(d);
        if (data.sId !== cookieNoneValue) {
            User.findOne({ sessionId: data.sId })
                .then((cur) => {
                    if (cur) {
                        User.find()
                            .then((res) => {
                                if (res) {
                                    socket.emit('setSearchResults', JSON.stringify({ step: 'start' }));
                                    for (let i = 0; i < res.length; i++) {
                                        let fr = res[i];
                                        if (fr.sessionId !== cur.sessionId && fr.login.toLowerCase().includes(data.str.toLowerCase())) {
                                            let obj = {
                                                name: fr.name,
                                                login: fr.login,
                                                id: fr._id,
                                                coordLng: fr.coordLng,
                                                coordLat: fr.coordLat,
                                                imageSrc: fr.imageSrc,
                                                trackingGeo: fr.trackingGeo
                                            };

                                            socket.emit('setSearchResults', JSON.stringify({ step: 'add', us: obj }));
                                        }
                                    }
                                    socket.emit('setSearchResults', JSON.stringify({ step: 'end' }));
                                }
                            })
                            .catch((err) => {
                                console.log(err);

                                socket.emit('logOut');
                            });
                    }
                })
                .catch((ops) => {});
        } else {
            socket.emit('logOut');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected with id: ${socket.id}`);
    });
});

mongoose.connection.once('open', () => {
    console.log('Connected to database!');
    server.listen(process.env.PORT || 5000, () => {
        console.log(`Server started on port ${server.address().port} :)`);
    });
});

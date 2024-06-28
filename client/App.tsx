import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BottomNavigation } from './components/common/Navigation';
import { MapPage } from './pages/MapPage';
import { SettingsPage } from './pages/SettingsPage';
import { FriendsPage } from './pages/FriendsPage';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { io } from 'socket.io-client';
import {User, Friend, _User, _Friend} from "./User";
import * as cookie from "./utils/Cookie-util";

let socket = io({reconnection: true, reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000, timeout: 20000});
const spbCoords = {
        lng: 30.3158,
        lat: 59.9398
    };

function setIntervalImmediatly(func: any, interval: number) {
    func();
    return setInterval(func, interval);
}

export function App() {
    //cookie.deleteCookie(cookie.name); //reset

    console.log("Start render");

    let [sesId, setSesId] = useState<string>(cookie.getCookie(cookie.name));
    const setAuthFromSesId = (idData: string) => {
        if (idData === cookie.noneValue) return false;
        else return true;         
    };

    let [isAuth, setIsAuth] = useState(setAuthFromSesId(sesId));

    let intervalReq = useRef<NodeJS.Timeout | undefined>(undefined);
    let intervalSetPos = useRef<NodeJS.Timeout | undefined>(undefined);

    let [user, setUser] = useState<_User>(User("abc", "test", "p", spbCoords.lng, spbCoords.lat, ["q"], ["w"], ["l"], "-", false, -1));
    let [userData, setUserData] = useState("");

    let [friends, setFriends] = useState<_Friend[]>([]);
    let [friendsData, setFriendsData] = useState("");
    let friendsFlag = useRef(false);
    let friendsRef = useRef<_Friend[]>([]);

    let [friendsReceived, setFriendsReceived] = useState<_Friend[]>([]);
    let [friendsDataReceived, setFriendsDataReceived] = useState("");
    let friendsFlagReceived = useRef(false);
    let friendsRefReceived = useRef<_Friend[]>([]);


    let [friendsSent, setFriendsSent] = useState<_Friend[]>([]);
    let [friendsDataSent, setFriendsDataSent] = useState("");
    let friendsFlagSent = useRef(false);
    let friendsRefSent = useRef<_Friend[]>([]);


    useEffect(() => {
        socket.on("connect", () => {
            console.log(`Connected with socketID: ${socket.id}`);            
        });        
        
        socket.on("logIn", (data) => {
            let d = JSON.parse(data).sesId.toString();
            cookie.setCookie(cookie.name, d);             
            setSesId(d);          

            console.log("logIn");
        });
        socket.on("logOut", () => {
            cookie.deleteCookie(cookie.name);      
            setSesId(cookie.noneValue); 
            
            setUserData("");
            setFriendsData("");
            setFriendsDataReceived("");
            setFriendsDataSent("");

            friendsFlag.current = false;
            friendsRef.current = [];

            friendsFlagReceived.current = false;
            friendsRefReceived.current = [];

            friendsFlagSent.current = false;
            friendsRefSent.current = [];
            
            console.log("logOut");
        });

        socket.on("setPerson", (data) => {                        
            setUserData(data);
            console.log("setUserData");
        });  

        socket.on('setFriends', (d) => {
            let data = JSON.parse(d);
            
            if (data.stage === "start") {
                friendsFlag.current = true;
                friendsRef.current = [];
                console.log("start");
            } else if (data.stage === "add") {
                let fr = Friend(data.friend.name, data.friend.login, data.friend.id, data.friend.coordLng, data.friend.coordLat, data.friend.imageSrc, data.friend.trackingGeo);
                friendsRef.current = [...friendsRef.current, fr];
                console.log("add");
            } else if (data.stage === "end") {
                setFriendsData(JSON.stringify(friendsRef.current));
                console.log("setFriendsData: " + JSON.stringify(friendsRef.current));
                console.log("end");
                friendsFlag.current = false;
            }          
        });

        socket.on('setFriendsReceived', (d) => {
            let data = JSON.parse(d);
            
            if (data.stage === "start") {
                friendsFlagReceived.current = true;
                friendsRefReceived.current = [];
                console.log("startR");
            } else if (data.stage === "add") {
                let fr = Friend(data.friend.name, data.friend.login, data.friend.id, data.friend.coordLng, data.friend.coordLat, data.friend.imageSrc, data.friend.trackingGeo);
                friendsRefReceived.current = [...friendsRefReceived.current, fr];
                console.log("addR");
            } else if (data.stage === "end") {
                setFriendsDataReceived(JSON.stringify(friendsRefReceived.current));
                console.log("endR");
                friendsFlagReceived.current = false;
            }          
        });

        socket.on('setFriendsSent', (d) => {
            let data = JSON.parse(d);
            
            if (data.stage === "start") {
                friendsFlagSent.current = true;
                friendsRefSent.current = [];
                console.log("startS");
            } else if (data.stage === "add") {
                let fr = Friend(data.friend.name, data.friend.login, data.friend.id, data.friend.coordLng, data.friend.coordLat, data.friend.imageSrc, data.friend.trackingGeo);
                friendsRefSent.current = [...friendsRefSent.current, fr];
                console.log("addS");
            } else if (data.stage === "end") {
                setFriendsDataSent(JSON.stringify(friendsRefSent.current));
                console.log("endS");
                friendsFlagSent.current = false;
            }          
        });
        
        return () => {
            socket.off("connect");
            clearInterval(intervalReq.current);
            clearInterval(intervalSetPos.current);
        };        
    }, []);

    // User updater
    useEffect(() => {
        if (userData !== "") {
            let d = JSON.parse(userData);        
            let us = User(d.name, d.login, d.id, d.coordLng, d.coordLat, d.friends, d.friendsReceivedReq, d.friendsSentReq, d.imageSrc, d.trackingGeo, d.mapStyle);
            setUser(us);
            console.log("setUser from " + user.name + " to " + us.name);
        }        
    }, [userData]);

    // Friends updater
    useEffect(() => {
        if (friendsData !== "") {
            let d = JSON.parse(friendsData);                    
            setFriends(d);
            console.log("setFriends: " + friendsData);
        }        
    }, [friendsData]);


    // Friends received updater
    useEffect(() => {
        if (friendsDataReceived !== "") {
            let d = JSON.parse(friendsDataReceived);                    
            setFriendsReceived(d);
            console.log("setFriendsReceived: " + friendsDataReceived);
        }        
    }, [friendsDataReceived]);

    // Friends sent updater
    useEffect(() => {
        if (friendsDataSent !== "") {
            let d = JSON.parse(friendsDataSent);                    
            setFriendsSent(d);
            console.log("setFriendsSent: " + friendsDataSent);
        }        
    }, [friendsDataSent]);

    // Geo tracker
    useEffect(() => {
        let b = setAuthFromSesId(sesId);

        if (b === true) {
            if (user.trackingGeo === true) {
                clearInterval(intervalSetPos.current);
                intervalSetPos.current = setIntervalImmediatly(() => {                                
                    navigator.geolocation.getCurrentPosition((pos) => {
                        let obj = {
                            sId: sesId,
                            lng: pos.coords.longitude,
                            lat: pos.coords.latitude
                        };

                        socket.emit("setGeo", JSON.stringify(obj));
                        console.log("setGeo");
                    }, (err) => {
                        socket.emit("hideGeo", sesId);
                    }, {enableHighAccuracy: true});
                }, 2000);
                console.log("Start interval set pos");
            } else {
                clearInterval(intervalSetPos.current);
            }
        } else {
            clearInterval(intervalSetPos.current);            
        } 
        
        console.log("useEffect");

        return () => {
            clearInterval(intervalSetPos.current);
        };        
    }, [user.trackingGeo, sesId]);

    // Requests emitter about user and his friends
    useEffect(() => {
        let b = setAuthFromSesId(sesId);
        setIsAuth(b); 

        if (b === true) {
            clearInterval(intervalReq.current);
            intervalReq.current = setIntervalImmediatly(() => {                                
                socket.emit("requestPerson", sesId);
                console.log("requestPerson");

                if (friendsFlag.current === false) {
                    socket.emit("requestFriends", sesId);
                    console.log("requestFriends");
                }      
                
                if (friendsFlagReceived.current === false) {
                    socket.emit("requestFriendsReceived", sesId);
                    console.log("requestFriendsReceived");
                }  
                
                if (friendsFlagSent.current === false) {
                    socket.emit("requestFriendsSent", sesId);
                    console.log("requestFriendsSent");
                }  
            }, 2000);
            console.log("Start interval req");
        } else {
            clearInterval(intervalReq.current);
        }  

        return () => {
            clearInterval(intervalReq.current);            
        };
    }, [sesId]);

    // Resolution effect
    useEffect(() => {
        function updateVH() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        updateVH();
        window.addEventListener('resize', updateVH);

        return () => {
            window.removeEventListener('resize', updateVH);
        };
    }, []);

    return (
        <Router>
            <div className="app-container">
                <Switch>
                    <Route path="/login" render={(props) => (<LoginPage {...props} socket={socket} user={user} friends={friends} isAuth={isAuth} sesId={sesId}/>)}/> 
                    <Route path="/register" render={(props) => (<RegisterPage {...props} socket={socket} user={user} friends={friends} isAuth={isAuth} sesId={sesId}/>)} />                    
                    <Redirect exact from="/" to="/map" />
                    <Route>
                        <div className="main-area">
                            <Switch>
                                <Route path="/map" render={(props) => (<MapPage {...props} socket={socket} user={user} friends={friends} isAuth={isAuth} sesId={sesId}/>)} />
                                <Route path="/settings" render={(props) => (<SettingsPage {...props} socket={socket} user={user} friends={friends} isAuth={isAuth} sesId={sesId}/>)} />
                                <Route path="/friends" render={(props) => (<FriendsPage {...props} socket={socket} user={user} friends={friends} isAuth={isAuth} sesId={sesId} friendsReq={friendsReceived} friendsSent={friendsSent}/>)} />
                                <Redirect exact from="/" to="/map" />
                            </Switch>
                        </div>
                        <div className="bottom-area">
                            <BottomNavigation />
                        </div>
                    </Route>                    
                </Switch>
            </div>
        </Router>
    );
}
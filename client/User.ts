export class _User {
    name: string;
    login: string;
    id: string;
    coordLng: number;
    coordLat: number;
    friends: string[];
    friendsReceivedReq: string[];
    friendsSentReq: string[];
    imageSrc: string;
    trackingGeo: boolean;
    mapStyle: number;

    constructor(    newname: string,
                    newlogin: string,
                    newid: string,
                    newcoordLng: number,
                    newcoordLat: number,
                    newfriends: string[],
                    newfriendsReceivedReq: string[],
                    newfriendsSentReq: string[],
                    newimageSrc: string,
                    newtrackingGeo: boolean,
                    newmapStyle: number 
                ) {
        this.name = newname;
        this.login = newlogin;
        this.id = newid;
        this.coordLng = newcoordLng;
        this.coordLat = newcoordLat;
        this.friends = newfriends;
        this.friendsReceivedReq = newfriendsReceivedReq;
        this.friendsSentReq = newfriendsSentReq;
        this.imageSrc = newimageSrc;
        this.trackingGeo = newtrackingGeo;
        this.mapStyle = newmapStyle;
    }
}

export class _Friend {
    name: string;
    login: string;
    id: string;
    coordLng: number;
    coordLat: number; 
    imageSrc: string;
    trackingGeo: boolean;

    constructor(    newname: string,
                    newlogin: string,
                    newid: string,
                    newcoordLng: number,
                    newcoordLat: number,
                    newimageSrc: string,
                    newtrackingGeo: boolean                     
                ) {
        this.name = newname;
        this.login = newlogin;
        this.id = newid;
        this.coordLng = newcoordLng;
        this.coordLat = newcoordLat;
        this.imageSrc = newimageSrc;
        this.trackingGeo = newtrackingGeo;
    }
}

export function User(...args: [string, string, string, number, number, string[], string[], string[], string, boolean, number]) {
    return new _User(...args);
}

export function Friend(...args: [string, string, string, number, number, string, boolean]) {
    return new _Friend(...args);
}
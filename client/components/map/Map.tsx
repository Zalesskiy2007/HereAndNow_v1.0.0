import React, { useEffect, useState } from 'react';
import Maplibre, { MapStyle } from '../../../node_modules/react-map-gl/dist/es5/exports-maplibre';
import { Marker } from './Popup';

import { Socket, io } from 'socket.io-client';
import * as cookie from "../../utils/Cookie-util";
import {User, Friend, _User, _Friend} from "../../User";

export function Map(props: {socket: Socket, user: _User, friends: _Friend[], isAuth: Boolean, sesId: String}) { 
    const style : MapStyle = {
        version: 8,
        sources: {
            osm: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors',
                maxzoom: 19
            }
        },
        layers: [
            {
                id: 'osm',
                type: 'raster',
                source: 'osm' // This must match the source key above
            }
        ]
    };

    let chooseStyle = (num: number) => {
        if (num === 0) return 'https://api.maptiler.com/maps/streets/style.json?key=tgMhLsjzo9PFbyrDjEbt';
        else if (num === 1) return 'https://api.maptiler.com/maps/satellite/style.json?key=wF0uF9Z2aWYMkBfbi5rd';
        else if (num === 2) return style;
        else return 'https://api.maptiler.com/maps/streets/style.json?key=tgMhLsjzo9PFbyrDjEbt';
    };

    let [mapFr, setMapFr] = useState<_Friend[]>(props.friends);

    useEffect(() => {
        setMapFr(props.friends);
    }, [props.friends, props.user]);

    return (
        <Maplibre
            onClick={() => {}}
            id="map"
            initialViewState={{
                longitude: props.user.coordLng,
                latitude: props.user.coordLat,
                zoom: 10
            }}
            mapStyle={chooseStyle(props.user.mapStyle)}
        >     

            {
                mapFr.map((fr) => {
                    return (
                        <div key={fr.id} className="popup-wrapper">
                            <Marker
                                lng={fr.coordLng}
                                lat={fr.coordLat}
                                imageURL={fr.imageSrc}
                                isHideGeo={!fr.trackingGeo}
                            />
                        </div>                         
                    );
                })
            }        
            <div className="popup-wrapper">                
                <Marker
                    lng={props.user.coordLng}
                    lat={props.user.coordLat}
                    imageURL={props.user.imageSrc}
                    isHideGeo={!props.user.trackingGeo}
                />
            </div>            
        </Maplibre>
    );
}

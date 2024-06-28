import React, { useEffect, useState, ChangeEvent } from 'react';

import { Socket, io } from 'socket.io-client';
import * as cookie from "../../utils/Cookie-util";
import {User, Friend, _User, _Friend} from "../../User";
import { imageToData, dataToImage } from '../../utils/Image';

export function Settings(props: {socket: Socket, user: _User, friends: _Friend[], isAuth: Boolean, sesId: String}) {
    let setThemeFromNumber = (v: number) => {
        if (v === 0) return 'map';
        else if (v === 1) return 'satellite';
        else if (v === 2) return 'hybrid';
        else return 'map';
    };

    let setNumberFromTheme = (v: string) => {
        if (v === 'map') return 0;
        else if (v === 'satellite') return 1;
        else if (v === 'hybrid') return 2;
        else return 0;
    };
    
    const [toggleCheck, setToggleCheck] = useState<boolean>(props.user.trackingGeo);
    const [mapStyle, setMapStyle] = useState<string>(setThemeFromNumber(props.user.mapStyle));    

    const handleToggleChange = () => {
        setToggleCheck((toggle) => !toggle);        
        props.socket.emit("settingsChangeGeo", props.sesId); 
    };

    const handleMapChange = (n: string) => {
        let g = setNumberFromTheme(n);

        setMapStyle(setThemeFromNumber(g));
        let obj = {
            sId: props.sesId,
            style: g
        };
        props.socket.emit("settingsChangeMap", JSON.stringify(obj)); 
    };

    const getActiveMapStyle = (style: string) => {
        return mapStyle === style ? 'active' : '';
    };

    useEffect(() => {
        setToggleCheck(props.user.trackingGeo);
        setMapStyle(setThemeFromNumber(props.user.mapStyle));
    }, [props.user]);

    const handleLogout = () => {
        props.socket.emit("settingsLogout");        ;
    };

    const handleDeleteAccount = () => {
        props.socket.emit("settingsDeleteAccount", props.sesId);        
    };

    const handleProfilePhotoChanged = (event: ChangeEvent<HTMLInputElement>) => {
        let file = event.target;
        if (file !== null && file.files !== null && file.files[0] !== undefined) {
            let url = URL.createObjectURL(file.files[0]);
            let newImg = document.createElement('img');
            newImg.src = url;

            newImg.onload = () => {
                newImg.width = 512;
                newImg.height = 512; 

                imageToData(newImg, (data: any) => {
                    let newSrc = dataToImage(data, newImg.width, newImg.height);
                    let obj = {
                        sId: props.sesId,
                        newImg: newSrc
                    };                
                    
                    props.socket.emit("settingsChangePhoto", JSON.stringify(obj));
                });
            }; 
        }                 
    };

    return (
        <div className="settings-content">
            <div className="settings-content-wrapper">
                <div className="user-info-wrapper">
                    <div className="div-row-user-info row-profile-photo">
                        <img src={props.user.imageSrc} />
                    </div>
                    <div className="div-row-user-info row-user-info">
                        <div className="row-name-a">
                            <h1>{props.user.name}</h1>
                        </div>
                        <div className="row-user-name">
                            <p>@{props.user.login}</p>
                        </div>
                    </div>
                </div>
                <div className="buttons-wrapper">
                    <div className="div-row-buttons">
                        <input
                            type="file"
                            id="profile-photo-change"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleProfilePhotoChanged}
                        />
                        <button
                            className="button change-photo-button"
                            onClick={() =>
                                document
                                    .getElementById('profile-photo-change')
                                    ?.click()
                            }
                        >
                            Change Profile Photo
                        </button>
                    </div>
                    <div className="div-row-buttons row-button-block">
                        <label className="button block-button hide-geo-toggle">
                            Hide Geolocation
                            <input
                                type="checkbox"
                                checked={!toggleCheck}
                                onChange={handleToggleChange}
                            />
                            <i></i>
                        </label>
                        <div className="button block-button map-style-button">
                            <nav className="map-style-nav">
                                <div className="nav-button-style">
                                    <button
                                        className={getActiveMapStyle('map')}
                                        onClick={() => {
                                            handleMapChange('map');
                                        }}
                                    >
                                        Map
                                    </button>
                                </div>
                                <div className="nav-button-style">
                                    <button
                                        className={getActiveMapStyle('satellite')}
                                        onClick={() => {
                                            handleMapChange('satellite');
                                        }}
                                    >
                                        Satellite
                                    </button>
                                </div>
                                <div className="nav-button-style">
                                    <button
                                        className={getActiveMapStyle('hybrid')}
                                        onClick={() => {
                                            handleMapChange('hybrid');
                                        }}
                                    >
                                        Detailed
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>
                    <div className="div-row-buttons row-button-block">
                        <button className="button block-button logout-button" onClick={handleLogout}>
                            Log Out
                        </button>
                        <button className="button block-button delete-acc-button" onClick={handleDeleteAccount}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

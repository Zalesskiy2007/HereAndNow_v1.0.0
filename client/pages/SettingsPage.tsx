import React from 'react';
import { Settings } from '../components/settings/Settings';

import { Redirect, Switch } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import * as cookie from "../utils/Cookie-util";
import {User, Friend, _User, _Friend} from "../User";

export function SettingsPage(props: {socket: Socket, user: _User, friends: _Friend[], isAuth: Boolean, sesId: String}) {
    if (props.isAuth) {
        return (
            <div className="settings-wrapper">
                <Settings socket={props.socket} user={props.user} friends={props.friends} isAuth={props.isAuth} sesId={props.sesId}/>
            </div>
        );
    } else {        
        return (<Switch><Redirect exact from="/settings" to="/login" /></Switch>);        
    }
}

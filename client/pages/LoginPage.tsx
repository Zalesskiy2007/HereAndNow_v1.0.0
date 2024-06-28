import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

import { Redirect, Switch } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';
import * as cookie from '../utils/Cookie-util';
import { User, Friend, _User, _Friend } from '../User';

export function LoginPage(props: { socket: Socket; user: _User; friends: _Friend[]; isAuth: Boolean; sesId: String }) {
    const history = useHistory();

    if (props.isAuth) {
        return (
            <Switch>
                <Redirect exact from="/login" to="/map" />
            </Switch>
        );
    }

    let loginForm = () => {
        let lUs = document.getElementById('loginUs') as HTMLInputElement;
        let lPass = document.getElementById('loginPass') as HTMLInputElement;

        if (lUs.value !== '' && lPass.value !== '') {
            let obj = {
                login: lUs.value,
                password: lPass.value
            };
            props.socket.emit('loginSubmit', JSON.stringify(obj));
        } else {
            let a = document.getElementById('password_label') as HTMLLabelElement;
            a.innerText = 'enter username and password';
        }
    };

    useEffect(() => {
        props.socket.on('incorrectPassOrLog', () => {
            let a = document.getElementById('password_label') as HTMLLabelElement;

            a.innerText = 'username or password are incorrect';
        });
    }, []);

    return (
        <div className="login-wrapper">
            <div className="login-content">
                <div className="login-content-wrapper">
                    <div className="div-row row-title">
                        <h2>Sign in</h2>
                    </div>
                    <div className="div-row row-username">
                        <input id="loginUs" type="text" className="input" placeholder="username" />
                    </div>
                    <div className="div-row row-password">
                        <input id="loginPass" type="password" className="input" placeholder="password" />
                        <label htmlFor="loginPass" id="password_label" style={{ color: 'red' }}></label>
                    </div>
                    <div className="div-row">
                        <button className="submit-button" onClick={loginForm}>
                            Login
                        </button>
                    </div>
                    <div className="div-row">
                        <button className="signup-button" onClick={() => history.push('/register')}>
                            Sign up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
// import { NavLink } from 'react-router-dom';
import { useHistory, useLocation } from 'react-router';

export function BottomNavigation() {
    const history = useHistory();
    const location = useLocation();

    const getActiveClass = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="bottom-navigation">
            <div className="nav-button">
                <button
                    className={getActiveClass('/friends')}
                    onClick={() => {
                        history.push('/friends');
                    }}
                >
                    Friends
                </button>
            </div>
            <div className="nav-button">
                <button
                    className={getActiveClass('/map')}
                    onClick={() => {
                        history.push('/map');
                    }}
                >
                    Map
                </button>
            </div>
            <div className="nav-button">
                <button
                    className={getActiveClass('/settings')}
                    onClick={() => {
                        history.push('/settings');
                    }}
                >
                    Settings
                </button>
            </div>
        </nav>
    );
}

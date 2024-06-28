import React, { ChangeEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Socket, io } from 'socket.io-client';
import * as cookie from '../../utils/Cookie-util';
import { User, Friend, _User, _Friend } from '../../User';

export function Friends(props: { socket: Socket; user: _User; friends: _Friend[]; isAuth: Boolean; sesId: String; friendsReq: _Friend[]; friendsSent: _Friend[] }) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<_Friend[]>([]);

    let [searchResultsData, setSearchResultData] = useState('');
    let searchResultsFlag = useRef(false);
    let searchResultsRef = useRef<_Friend[]>([]);

    const [requestsMode, setRequestsMode] = useState<boolean>(false);

    const [stateFriends, setStateFriends] = useState(props.friends);
    const [stateFriendsReq, setStateFriendsReq] = useState(props.friendsReq);
    const [stateFriendsSent, setStateFriendsSent] = useState(props.friendsSent);

    useEffect(() => {
        setStateFriends(props.friends);
    }, [props.friends]);

    useEffect(() => {
        setStateFriendsReq(props.friendsReq);
    }, [props.friendsReq]);

    useEffect(() => {
        setStateFriendsSent(props.friendsSent);
    }, [props.friendsSent]);

    // Socket listening
    useEffect(() => {
        props.socket.on('setSearchResults', (d) => {
            let data = JSON.parse(d);

            if (data.step === 'start') {
                searchResultsFlag.current = true;
                searchResultsRef.current = [];
                console.log('start');
            } else if (data.step === 'add') {
                let fr = Friend(data.us.name, data.us.login, data.us.id, data.us.coordLng, data.us.coordLat, data.us.imageSrc, data.us.trackingGeo);
                searchResultsRef.current = [...searchResultsRef.current, fr];
                console.log('add');
            } else if (data.step === 'end') {
                console.log(JSON.stringify(searchResultsRef.current));
                setSearchResultData(JSON.stringify(searchResultsRef.current));
                console.log('end');
                searchResultsFlag.current = false;
            }
        });

        console.log(JSON.stringify(searchResultsRef.current));

        props.socket.on('logOut', () => {
            setSearchResultData('');
            searchResultsFlag.current = false;
            searchResultsRef.current = [];
        });
    }, []);

    useEffect(() => {
        if (searchResultsData !== '') {
            let d = JSON.parse(searchResultsData);
            setSearchResults(d);
        }
    }, [searchResultsData]);

    const ifIdInArray = (id: string, arr: _Friend[]) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
                return true;
            }
        }

        return false;
    };

    const findByIdInArray = (id: string, arr: _Friend[]) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
                return arr[i];
            }
        }

        return null;
    };

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (searchResultsFlag.current === false) {
            setSearchTerm(event.target.value);
            props.socket.emit('searchUsers', JSON.stringify({ sId: props.sesId, str: event.target.value }));
        }
    };

    const handleAddFriend = (id: string) => {
        props.socket.emit('addFriend', JSON.stringify({ sId: props.sesId, id: id }));
    };

    const handleRemoveFriend = (id: string) => {
        setStateFriends((prev) => prev.filter((d) => d.id !== id));
        setStateFriendsReq((prev) => prev.filter((d) => d.id !== id));
        setStateFriendsSent((prev) => prev.filter((d) => d.id !== id));
        props.socket.emit('deleteFriend', JSON.stringify({ sId: props.sesId, id: id }));
    };

    const handleAcceptRequest = (id: string) => {
        setStateFriends((prev) => {
            let a = findByIdInArray(id, prev);
            let arr = prev;
            if (a !== null) {
                arr.push(a);
            }
            return arr;
        });
        setStateFriendsReq((prev) => prev.filter((d) => d.id !== id));
        props.socket.emit('acceptFriend', JSON.stringify({ sId: props.sesId, id: id }));
    };

    const handleDeclineRequest = (id: string) => {
        setStateFriendsReq((prev) => prev.filter((d) => d.id !== id));
        props.socket.emit('declineFriend', JSON.stringify({ sId: props.sesId, id: id }));
    };

    return (
        <div className="friends-content">
            <div className="div-row-friends friends-header">
                <h1>{!requestsMode ? 'Friends' : 'Requests'}</h1>
                <div className="requests-button">
                    {!requestsMode ? (
                        <button
                            className={stateFriendsReq.length > 0 ? 'active' : ''}
                            onClick={() => {
                                setRequestsMode((m) => !m);
                            }}
                        >
                            Requests
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setRequestsMode((m) => !m);
                            }}
                        >
                            Friends
                        </button>
                    )}
                </div>
            </div>
            {!requestsMode ? (
                <div className="div-row-friends friends-mode-wrapper">
                    <div className="div-row-friends friends-search">
                        <input type="text" placeholder="Search" id="friends-search-input" value={searchTerm} onChange={handleSearchChange} />
                    </div>
                    <div className="div-row-friends friends-list">
                        <ul>
                            {stateFriends.length > 0 || stateFriendsSent.length > 0 || searchTerm !== '' ? (
                                searchTerm === '' ? (
                                    [
                                        ...stateFriends.map((user) => (
                                            <li key={user.id}>
                                                <img src={user.imageSrc} />
                                                {user.login}
                                                <button
                                                    onClick={() => {
                                                        handleRemoveFriend(user.id);
                                                    }}
                                                    style={{ backgroundColor: 'rgb(210, 30, 20)' }}
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        )),
                                        ...stateFriendsSent.map((user) => (
                                            <li key={user.id}>
                                                <img src={user.imageSrc} />
                                                {user.login}
                                                <button
                                                    onClick={() => {
                                                        handleRemoveFriend(user.id);
                                                    }}
                                                    style={{ backgroundColor: 'rgb(100, 100, 100)' }}
                                                >
                                                    Cancel
                                                </button>
                                            </li>
                                        ))
                                    ]
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((result) => (
                                        <li key={result.id}>
                                            <img src={result.imageSrc} />
                                            {result.login}
                                            {ifIdInArray(result.id, stateFriendsSent) ? (
                                                <button
                                                    onClick={() => {
                                                        handleRemoveFriend(result.id);
                                                    }}
                                                    style={{ backgroundColor: 'rgb(100, 100, 100)' }}
                                                >
                                                    Cancel
                                                </button>
                                            ) : !ifIdInArray(result.id, stateFriends) ? (
                                                <button
                                                    onClick={() => {
                                                        handleAddFriend(result.id);
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        handleRemoveFriend(result.id);
                                                    }}
                                                    style={{ backgroundColor: 'rgb(210, 30, 20)' }}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <p className="no-requests">No results</p>
                                )
                            ) : (
                                <p className="no-requests">You have no friends</p>
                            )}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="div-row-friends friends-mode-wrapper">
                    <div className="div-row-friends friends-list">
                        <ul>
                            {stateFriendsReq.length > 0 ? (
                                stateFriendsReq.map((user) => (
                                    <li key={user.id}>
                                        <img src={user.imageSrc} />
                                        {user.login}
                                        {!ifIdInArray(user.id, stateFriends) ? (
                                            <div className="accept-decline-buttons">
                                                <button
                                                    onClick={() => {
                                                        handleAcceptRequest(user.id);
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDeclineRequest(user.id);
                                                    }}
                                                    style={{ backgroundColor: 'rgb(210, 30, 20)' }}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    handleRemoveFriend(user.id);
                                                }}
                                                style={{ backgroundColor: 'rgb(210, 30, 20)' }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <p className="no-requests">You have no friend requests</p>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

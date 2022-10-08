import { Button, Card, CardContent, CardMedia, Icon, Tab, Tabs, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";
import io from "socket.io-client"
import DragHandleIcon from '@mui/icons-material/DragHandle';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import './Room.css'

let socket;
const Room = (props) => {

    const ENDPOINT = "localhost:5000";

    const [users, setUsers] = useState([])

    const [roomJoined, setRoomJoined] = useState(false)

    const [userName, setUserName] = useState("")

    const [roomName, setRoomName] = useState("")

    const [tabValue, setTabValue] = useState(0)

    const fibonacciValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?"]

    const [canShowCard, setCanShowCard] = useState(false);

    const [flipCard, setFlipCard] = useState(false);

    useEffect( () => {
         socket = io(ENDPOINT)
         
    }, [])

    useEffect( () => {
        socket.on("roomCreated", (roomId) => {
            setRoomName(roomId)
        })  

        socket.on("userJoined", (allUsers) => {
            setUsers(allUsers)
        })  

        socket.on("sendedVote", (allUsers) => {
            setUsers(allUsers)
            checkCanReveal(allUsers)
        }) 

        socket.on("cardRevealed", () => {
            setFlipCard(true)
        })

        socket.on("newVoteRequested", (allUsers) => {
            setUsers(allUsers)
            setCanShowCard(false)
            setFlipCard(false)
        })

        return () => { socket.emit("disconnect", {roomName: roomName})}
    }, [])

    const createRoom = (event) => {
        socket.emit("createRoom", userName, (error) => {
            if (error) {
              alert(error);
            }
          });    
        setUsers(arr => [...arr, {userName: userName, vote:-1}])
        setRoomJoined(true)    
    }

    const checkCanReveal = (allUsers) => {
        console.log("check")
        if(allUsers.filter(user => {
            return user.vote === -1;
        }).length === 0 ){
            setCanShowCard(true);
        }
        else {
            setCanShowCard(false);
        }
    }
    const joinRoom =  async (event) => {
        setRoomJoined(true)
        await socket.emit("joinRoom", {userName: userName, roomId: roomName}, (error) => {
            if (error) {
              alert(error);
            }
        });    
    } 

    const sendVote = async ( vote ) => {
        await socket.emit("sendVote", {userName: userName, roomId: roomName, "vote": vote}, (error) => {
            if (error) {
              alert(error);
            }
        }); 
    }

    const revealCard = async () => {
        await socket.emit("revealCard", roomName, (error) => {
            if (error) {
              alert(error);
            }
        }); 
    }

    const requestNewVote = async () => {
        await socket.emit("newVote", roomName, (error) => {
            if (error) {
              alert(error);
            }
        }); 
    }

    const renderCreateOrJoin = () => {

        if(tabValue === 0){
            return (
                <div style={{margin: 20}}>
                    <div>
                        <TextField onChange={(event) => {setUserName(event.target.value)}} id="outlined-basic" label="Username" variant="outlined" />
                    </div>
                    <div>
                        <Button onClick={createRoom} style={{backgroundColor: "white", color: "black", margin: 20}} variant="outlined">Crea room</Button>
                    </div>
                </div>
            )
        }

        return (
            <div style={{padding: 20}}>
                <div>
                    <TextField onChange={(event) => {setUserName(event.target.value)}} id="outlined-basic" label="Username" variant="outlined" />
                </div>
                <div>
                    <TextField onChange={(event) => {setRoomName(event.target.value)}} style={{marginTop: 20}} id="outlined-basic" label="Codice room" variant="outlined" />
                </div>
                <div>
                    <Button onClick={joinRoom} style={{backgroundColor: "white", color: "black", margin: 20}} variant="outlined">Join room</Button>
                </div>
            </div>
        )
    }

    const createFibonacciButtons = () => {
        return (
            <div>
                {fibonacciValues.map(item => (
                    <Button onClick={() => {sendVote(item)}} className="buttonFibonacci" style={{backgroundColor: "white", color: "#000000", fontSize:'20px', borderColor: "#000000", margin: 10, height:80}} variant="outlined">{item}</Button>
                ))}
            </div>
        )
    }

    const createTable = () => {
        return(
            <div style={{display: 'flex', border:'solid 1px black', borderRadius: '50px', width: 800, height: 200, backgroundColor: '#D7E9FF', textAlign: "center", alignItems: 'center', alignContent: 'center', justifyItems: 'center', justifyContent:'center'}}>
                {!canShowCard ?
                    <Typography variant="h4">
                        Vota
                    </Typography>
                    :
                    (
                        flipCard ?
                            <Button onClick={() => {requestNewVote()}} style={{backgroundColor: "#147BC3", color: "white", margin: 20, height: 50, width: 250, borderRadius:10}} variant="outlined">Nuova votazione</Button>
                        :
                            <Button onClick={() => {revealCard()}} style={{backgroundColor: "#147BC3", color: "white", margin: 20, height: 50, width: 250, borderRadius:10}} variant="outlined">Rivela</Button>
                    )
                }
            </div>
        )
    }

    const createUserCard = (userName, vote) => {
        return (
            <div className="cardDiv" style={{height:80, width: 'auto', minWidth: 100, padding:5, backgroundColor: vote === -1 || flipCard ? '#D7E9FF': '#aaff80', borderRadius:'10px', margin: 20}} >
                <ReactCardFlip className="cardDiv" isFlipped={flipCard} flipDirection="horizontal">
                    <div className="cardDiv">
                        <Typography>
                            {userName}
                        </Typography>
                    </div>
                    <div className="cardDiv">
                        <Typography>
                            {userName}
                        </Typography>
                        <Typography fontWeight={'bold'}>
                            {vote !== -1 ? vote: null}
                        </Typography>
                    </div>
                </ReactCardFlip>
            </div>
        )
    }

    const drawUsers = (startUserNumber, usersNumberToDraw) => {
        var usersToDraw = users.slice(startUserNumber, usersNumberToDraw)
        return(
            <div style={{display: 'flex', flexDirection: 'row'}}>
                {
                    usersToDraw.map(element => (
                            createUserCard(element.userName, element.vote)
                        )
                    )
                }
            </div>
        )
    }

    const getVoteAverage = () => {
        let voteCount = 0.0
        let voteSum = 0

        users.forEach(user => {
            voteSum += user.vote
            voteCount++
        })

        return voteSum / voteCount
    }

    const getMinVote = () => {
        return Math.min(...users.map(user => (user.vote)))
    }

    const getMaxVote = () => {
        return Math.max(...users.map(user => (user.vote)))
    }

    return (
        <div className="Room">    
            {!roomJoined ? 
                <div> 
                    <Typography variant="h2" component="div" gutterBottom>
                        Crea una nuova room, o unisciti ad una già esistente!
                    </Typography>
                    <div>
                        <Tabs value={tabValue} onChange={(event, tab) => {setTabValue(tab)}} centered textColor="black">
                            <Tab className="tab" label="Crea nuova Room" />
                            <Tab className="tab" label="Unisciti a una room esistente" />
                        </Tabs>
                    </div>
                    {renderCreateOrJoin()}
                </div>
                : 
                <div>
                    <Typography color={"whitesmoke"} variant="h6" component="div" gutterBottom>
                       Room id: {roomName}
                    </Typography>
                    {drawUsers(0,5)}
                    {createTable()}
                    {drawUsers(5,10)}
                    <div style={{bottom: 0, position:"fixed", width: '100%', left: '50%', transform: 'translate(-50%, 0)'}}>
                        {createFibonacciButtons()}
                    </div>

                    {
                        flipCard ?
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center',}}>
                            <Box sx={{
                                width: 200,
                                height: 80,
                                backgroundColor: 'white',
                                
                                marginTop: 5,
                                borderRadius: 5,
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignContent:'center',
                                alignItems:'center',
                                justifyItems:'center',
                                marginRight: 5
                            }}>
                                <Typography variant="h7" color="text.secondary" component="div">
                                    Media Voti: {getVoteAverage()}
                                </Typography>
                                <DragHandleIcon style={{color: '#cccc00'}} />
                            </Box>

                            <Box sx={{
                                width: 200,
                                height: 80,
                                backgroundColor: 'white',
                                
                                marginTop: 5,
                                borderRadius: 5,
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignContent:'center',
                                alignItems:'center',
                                justifyItems:'center',
                                marginRight: 5
                            }}>
                                <Typography variant="h7" color="text.secondary" component="div">
                                    Voto più basso: {getMinVote()}
                                </Typography>
                                <DoneIcon style={{color: 'green'}} />
                            </Box>

                            <Box sx={{
                                width: 200,
                                height: 80,
                                backgroundColor: 'white',
                                
                                marginTop: 5,
                                borderRadius: 5,
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignContent:'center',
                                alignItems:'center',
                                justifyItems:'center',
                                marginRigth: 5
                            }}>
                                <Typography variant="h7" color="text.secondary" component="div">
                                    Voto più alto: {getMaxVote()}
                                </Typography>
                                <CloseIcon style={{color: 'red'}} />
                            </Box>
                        </div>
                        :
                        null
                    }
                </div>     
                        
            }
                
        </div>
    )
}

export default Room
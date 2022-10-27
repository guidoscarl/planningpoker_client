import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, FormControl, Grid, Icon, InputLabel, MenuItem, Paper, Select, Tab, Tabs, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import ReactCardFlip from "react-card-flip";
import io from "socket.io-client"
import DragHandleIcon from '@mui/icons-material/DragHandle';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { CSVLink } from "react-csv";
import './Room.css'

let socket;
const Room = (props) => {

    const ENDPOINT = "https://planningpoker-s.herokuapp.com";

    const [users, setUsers] = useState([])

    const [roomJoined, setRoomJoined] = useState(false)

    const [userName, setUserName] = useState("")

    const [roomName, setRoomName] = useState("")

    const [tabValue, setTabValue] = useState(0)


    const fibonacciValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "?"]
    const fibonacciModificatoValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?"]
    const potenzeValues = [0, 1, 2, 4, 8, 16, 32, 64, "?"]

    const votingSystemValues = { Fibonacci: fibonacciValues, FibonacciModificato: fibonacciModificatoValues, Potenze: potenzeValues }

    const [canShowCard, setCanShowCard] = useState(false);

    const [flipCard, setFlipCard] = useState(false);

    const [roomError, setRoomError] = useState(false)

    const [roomFull, setRoomFull] = useState(false)

    const [UserNameAlreadyExist, setUserNameAlreadyExist] = useState(false)

    const [openSaveVote, setOpenSaveVote] = useState(false)

    const [savedVotes, setSavedVotes] = useState([])

    const [openSavedItems, setopenSavedItems] = useState(false)
    const [itemName, setItemName] = useState("")

    const [newVoteAlert, setNewVoteAlert] = useState(false)
    const [openNewVoteAlert, setOpenNewVoteAlert] = useState(false)

    const [isRoomAdmin, setIsRoomAdmin] = useState(false)

    const [votingSystem, setVotingSystem] = useState("Fibonacci")

    useEffect(() => {
        socket = io(ENDPOINT)

    }, [])

    useEffect(() => {
        if (newVoteAlert && openSaveVote) {
            setOpenNewVoteAlert(true)
        }

        setNewVoteAlert(false)

    }, [newVoteAlert, openSaveVote])

    useEffect(() => {
        socket.on("roomCreated", (roomId) => {
            setRoomName(roomId)
        })

        socket.on("userJoined", (data) => {
            setRoomJoined(true)
            setUsers(data.users)
            setVotingSystem(data.votingSystem)
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
            setNewVoteAlert(true)
            setOpenSaveVote(false)
        })

        socket.on("userDisconnected", (allUsers) => {

            setUsers(allUsers)
        })

        socket.on("RoomNotExist", () => {

            setRoomError(true)
        })

        socket.on("RoomFull", () => {

            setRoomFull(true)
        })

        socket.on("UserNameAlreadyExist", () => {

            setUserNameAlreadyExist(true)
        })

        return () => { socket.emit("disconnect", { roomName: roomName }) }
    }, [])

    const createRoom = (event) => {
        socket.emit("createRoom", userName, votingSystem, (error) => {
            if (error) {
                alert(error);
            }
        });
        setUsers(arr => [...arr, { userName: userName, vote: -1 }])
        setIsRoomAdmin(true)
        setRoomJoined(true)
    }

    const checkCanReveal = (allUsers) => {
        console.log("check")
        if (allUsers.filter(user => {
            return user.vote === -1;
        }).length === 0) {
            setCanShowCard(true);
        }
        else {
            setCanShowCard(false);
        }
    }

    const joinRoom = async (event) => {
        await socket.emit("joinRoom", { userName: userName, roomId: roomName }, (error) => {
            if (error) {
                alert(error);
            }
        });
    }

    const sendVote = async (vote) => {
        await socket.emit("sendVote", { userName: userName, roomId: roomName, "vote": vote }, (error) => {
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

        if (tabValue === 0) {
            return (
                <div style={{ margin: 20 }}>
                    <div>
                        <TextField onChange={(event) => { setUserName(event.target.value) }} id="outlined-basic" label="Username" variant="outlined" />
                    </div>
                    <div style={{ marginTop: 5 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Voting System</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={votingSystem}
                                label="Voting System"
                                onChange={event => setVotingSystem(event.target.value)}
                            >
                                <MenuItem value={"Fibonacci"}>{"Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?)"}</MenuItem>
                                <MenuItem value={"FibonacciModificato"}>{"Fibonacci Modificato ( 0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?)"}</MenuItem>
                                <MenuItem value={"Potenze"}>{"Potenze di 2 ( 0, 1, 2, 4, 8, 16, 32, 64, ?)"}</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <Button disabled={userName.length > 0} onClick={createRoom} style={{ backgroundColor: "white", color: "black", margin: 20 }} variant="outlined">Crea room</Button>
                    </div>
                </div>
            )
        }

        return (
            <div style={{ padding: 20 }}>
                <div>
                    <TextField onChange={(event) => { setUserName(event.target.value) }} id="outlined-basic" label="Username" variant="outlined" />
                </div>
                <div>
                    <TextField onChange={(event) => { setRoomName(event.target.value) }} style={{ marginTop: 20 }} id="outlined-basic" label="Codice room" variant="outlined" />
                </div>
                <div>
                    <Button disabled={userName.length > 0} onClick={joinRoom} style={{ backgroundColor: "white", color: "black", margin: 20 }} variant="outlined">Join room</Button>
                </div>

                {
                    roomError ?
                        <div>
                            <Typography variant="h5" style={{ color: 'red' }}> Codice room errato!</Typography>
                        </div>
                        : null
                }

                {
                    roomFull ?
                        <div>
                            <Typography variant="h5" style={{ color: 'red' }}> Room piena!</Typography>
                        </div>
                        : null
                }

                {
                    UserNameAlreadyExist ?
                        <div>
                            <Typography variant="h5" style={{ color: 'red' }}> Username già occupato all'interno della room!</Typography>
                        </div>
                        : null
                }
            </div>
        )
    }

    const createFibonacciButtons = () => {
        return (

            !flipCard ?

                <div>
                    {votingSystemValues[votingSystem].map(item => (
                        <Button onClick={() => { sendVote(item) }} className="buttonFibonacci" style={{ backgroundColor: "white", color: "#000000", fontSize: '20px', borderColor: "#000000", margin: 10, height: 80 }} variant="outlined" disabled={flipCard}>{item}</Button>
                    ))}
                </div>

                : null
        )
    }

    const createTable = () => {
        return (
            <div style={{ display: 'flex', border: 'solid 1px black', borderRadius: '50px', width: 800, height: 150, backgroundColor: '#D7E9FF', textAlign: "center", alignItems: 'center', alignContent: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                {!canShowCard ?
                    <Typography variant="h5" fontWeight={"bold"}>
                        Vota
                    </Typography>
                    :
                    (
                        isRoomAdmin ? (
                            flipCard ?
                                <Button onClick={() => { requestNewVote() }} style={{ backgroundColor: "#147BC3", color: "white", margin: 20, height: 50, width: 250, borderRadius: 10 }} variant="outlined">Nuova votazione</Button>
                                :
                                <Button onClick={() => { revealCard() }} style={{ backgroundColor: "#147BC3", color: "white", margin: 20, height: 50, width: 250, borderRadius: 10 }} variant="outlined">Rivela</Button>
                        )
                        : null                       
                    )
                }
            </div>
        )
    }

    const createUserCard = (userName, vote) => {
        return (
            <div className="cardDiv" style={{ height: 80, width: 'auto', minWidth: 100, padding: 5, backgroundColor: vote === -1 || flipCard ? '#D7E9FF' : '#aaff80', borderRadius: '10px', margin: 20 }} >
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
                            {vote !== -1 ? vote : null}
                        </Typography>
                    </div>
                </ReactCardFlip>
            </div>
        )
    }

    const drawUsers = (startUserNumber, usersNumberToDraw) => {
        var usersToDraw = users.slice(startUserNumber, usersNumberToDraw)
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
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
        let voteSum = 0.0

        users.forEach(user => {
            if (user.vote !== '?') {
                voteSum += user.vote
                voteCount++
            }
        })

        if (voteCount === 0.0) {
            return 0;
        }

        return voteSum / voteCount
    }

    const getMinVote = () => {
        return Math.min(...users.filter(obj => { return obj.vote !== "?" }).map(user => (user.vote)))
    }

    const getMaxVote = () => {
        return Math.max(...users.filter(obj => { return obj.vote !== "?" }).map(user => (user.vote)))
    }


    const saveVote = (name, average, minVote, maxVote) => {
        setSavedVotes([...savedVotes, { name: name, average: average, minVote: minVote, maxVote: maxVote }])
    }

    return (
        <div className="Room">
            {!roomJoined ?
                <div>
                    <Typography variant="h1" fontWeight={"bold"} component="div" gutterBottom>
                        Planning Poker
                    </Typography>

                    <Typography variant="h5" component="div" gutterBottom>
                        Crea una nuova room, o unisciti ad una già esistente!
                    </Typography>
                    <div>
                        <Tabs value={tabValue} onChange={(event, tab) => { setTabValue(tab) }} centered textColor="black">
                            <Tab className="tab" label="Crea nuova Room" />
                            <Tab className="tab" label="Unisciti a una room esistente" />
                        </Tabs>
                    </div>
                    {renderCreateOrJoin()}
                </div>
                :
                <div style={{ marginTop: 10 }}>
                    <Typography color={"black"} variant="h6" component="div" gutterBottom>
                        Room id: {roomName}
                    </Typography>
                    {drawUsers(0, 5)}
                    {createTable()}
                    {drawUsers(5, 10)}
                    <div style={{ bottom: 0, position: "fixed", width: '100%', left: '50%', transform: 'translate(-50%, 0)' }}>
                        {createFibonacciButtons()}
                    </div>

                    {
                        flipCard ?
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
                                <Box sx={{
                                    width: 200,
                                    height: 80,
                                    backgroundColor: 'white',
                                    marginTop: 5,
                                    borderRadius: 5,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyItems: 'center',
                                    marginRight: 5
                                }}>
                                    <Typography variant="h7" color="text.secondary" component="div">
                                        Media Voti: {getVoteAverage()}
                                    </Typography>
                                    <DragHandleIcon style={{ color: '#cccc00' }} />
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
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyItems: 'center',
                                    marginRight: 5
                                }}>
                                    <Typography variant="h7" color="text.secondary" component="div">
                                        Voto più basso: {getMinVote()}
                                    </Typography>
                                    <DoneIcon style={{ color: 'green' }} />
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
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyItems: 'center',
                                    marginRigth: 5
                                }}>
                                    <Typography variant="h7" color="text.secondary" component="div">
                                        Voto più alto: {getMaxVote()}
                                    </Typography>
                                    <CloseIcon style={{ color: 'red' }} />
                                </Box>
                            </div>
                            :
                            null
                    }

                    <div style={{ position: 'fixed', bottom: 0, left: 0, padding: 5, display: 'flex', flexDirection: 'column' }}>
                        <Fab style={{ margin: 5 }} color="primary" aria-label="add" disabled={!flipCard} onClick={() => { setOpenSaveVote(true) }}>
                            <AddIcon />
                        </Fab>
                        <Fab style={{ margin: 5 }} color="primary" aria-label="add" onClick={() => { setopenSavedItems(true) }}>
                            <BookmarksIcon />
                        </Fab>
                    </div>

                    <Dialog open={openSaveVote}>
                        <DialogTitle>Salva la stima corrente!</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Inserisci il nome dell'item appena stimato
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                type="text"
                                fullWidth
                                variant="standard"
                                onChange={(sender) => { setItemName(sender.target.value) }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { saveVote(itemName, getVoteAverage(), getMinVote(), getMaxVote()); setOpenSaveVote(false); }}>Salva</Button>
                            <Button onClick={() => { setOpenSaveVote(false) }}>Esci</Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={openSavedItems} fullWidth={true}>
                        <DialogTitle style={{ textAlign: 'center' }}>Item salvati</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={4} style={{ textAlign: 'center' }}>
                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                    <Typography variant="h7" color="text.primary" component="div">
                                        Nome Item
                                    </Typography>
                                </Grid>
                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                    <Typography variant="h7" color="text.primary" component="div">
                                        Voto Max
                                    </Typography>
                                </Grid>
                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                    <Typography variant="h7" color="text.primary" component="div">
                                        Voto Min
                                    </Typography>
                                </Grid>
                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                    <Typography variant="h7" color="text.primary" component="div">
                                        Voto Medio
                                    </Typography>
                                </Grid>
                                {
                                    savedVotes.map(item => {
                                        return (
                                            <React.Fragment>
                                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                                    <Paper style={{ textAlign: 'center' }}>
                                                        <Typography variant="h7" color="text.primary" component="div">
                                                            {item.name}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                                    <Paper style={{ textAlign: 'center' }}>
                                                        <Typography variant="h7" color="text.primary" component="div">
                                                            {item.maxVote}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                                    <Paper style={{ textAlign: 'center' }}>
                                                        <Typography variant="h7" color="text.primary" component="div">
                                                            {item.minVote}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={3} sm={3} lg={3} md={3}>
                                                    <Paper style={{ textAlign: 'center' }}>
                                                        <Typography variant="h7" color="text.primary" component="div">
                                                            {item.average}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </React.Fragment>

                                        )
                                    })
                                }

                            </Grid>

                        </DialogContent>
                        <DialogActions>
                            <CSVLink separator=";" data={savedVotes} filename={"PlanningPoker_" + new Date().getFullYear() + new Date().getMonth() + new Date().getDate() + ".csv"}> <Button>Export CSV</Button> </CSVLink>
                            <Button onClick={() => { setopenSavedItems(false) }}>Esci</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openNewVoteAlert} style={{ textAlign: 'center' }}>
                        <DialogTitle>Attenzione!</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Impossibile salvare, è stata richiesta una nuova votazione!
                            </DialogContentText>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { setOpenNewVoteAlert(false); setNewVoteAlert(false) }}>Esci</Button>
                        </DialogActions>
                    </Dialog>

                    {/* <Dialog open={openLightDialog} style={{textAlign: 'center'}}>
                        <DialogTitle>La perla del giorno</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {frasi[Math.floor(Math.random() * 4)]}
                            </DialogContentText>
                            
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { setOpenLightDialog(false) }}>Esci</Button>
                        </DialogActions>
                    </Dialog> */}
                </div>
            }

        </div>
    )
}



export default Room
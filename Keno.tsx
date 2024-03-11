import React, { useRef, useState, useEffect } from "react";
import NavbarComp from "../components/NavbarComp";
import ChatMenu from "../components/ChatMenu";
import Main from "../components/Main";
import Footer from "../components/Footer";
import { BsFileLock2Fill } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { GoArrowSwitch } from "react-icons/go";
import Ripples from 'react-ripples'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client'; // Import the Socket.io client library
import axios from 'axios';
import { Card, Skeleton, Button, Checkbox } from '@nextui-org/react';
import * as CryptoJS from 'crypto-js';
import { useSpring, animated } from 'react-spring'; // Import React Spring
import icon from "../assets/img/usdt.svg";
import OverView from "../components/OverView";
import { Box, InputAdornment, OutlinedInput, Stack, Typography } from '@mui/material';
import './Keno.scss'; // Import the CSS file containing your styles
import { FormattedMessage } from 'react-intl'; // Import FormattedMessage
import classnames from 'classnames';

const Keno = () => {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0.00);
  const [level, setLevel] = useState('');
  const nrRoll_1 = getRandomInt(0, 9);
  const nrRoll_2 = getRandomInt(0, 9);
  const nrRoll_3 = getRandomInt(0, 9);
  const nrRoll_4 = getRandomInt(0, 9);
  const [currentRoll, setCurrentRoll] = useState(null);
  const [crashPoint, setCrashPoint] = useState(null);
  const [playerWinss, setPlayerWinss] = useState(false);
const [playerLosts, setPlayerLosts] = useState(false);
const [amount, setAmount] = useState<number | string>('');
const [selected, setSelected] = useState<number[]>([]);
const [autoPickInProcess, setAutoPickInProcess] = useState<boolean>(false);
const [response, setResponse] = useState<number[]>([]);

const onBet = () => {
  // Check if there are selected numbers
  if (selected.length === 0) {
      alert("Please select at least one number before placing a bet.");
      return;
  }

  // Calculate the total bet amount
  const totalBetAmount = Number(amount) * selected.length;

  // Here you can add further logic like sending a request to a backend API,
  // updating user balance, etc. For now, let's just display an alert with the bet amount.
  alert(`You have placed a bet of $${totalBetAmount} on ${selected.length} number(s): ${selected.join(', ')}.`);
};

const chain = (times: number, ms: number, cb: Function) => {
  let i = 0;
  const next = () => {
      if (i < times) {
          setTimeout(() => {
              cb(i);
              next();
          }, ms);
          i += 1;
      }
  };
  next();
};
const Random = (min: number, max: number, floor = true) => {
  const r = Math.random() * max + min;
  return floor ? Math.floor(r) : r;
};
const onAutoPick = () => {
  if (autoPickInProcess) return;
  setAutoPickInProcess(true);
  setSelected([]);
  const picked: number[] = [];
  while (picked.length < 10) {
      const rand = Random(1, 40);
      if (!picked.includes(rand)) {
          picked.push(rand);
      }
  }

  chain(10, 100, (index: number) => {
      setSelected(picked.slice(0, index));
      if (index === 9) setAutoPickInProcess(false);
  });
};
const tileClick = (number: number) => {
  if (selected.length >= 10 && !selected.includes(number)) return;
  if (!selected.includes(number)) {
      setSelected([...selected, number]);
  } else {
      setSelected([...selected.filter((e) => e !== number)]);
  }
};
const odds = {
1: [0, 1.8],
2: [0, 1.96, 3.6],
3: [0, 1.1, 1.38, 24],
4: [0, 0, 2.1, 7.8, 88.6],
5: [0, 0, 1.5, 4, 12, 292],
6: [0, 0, 1.1, 1.85, 6, 100, 600],
7: [0, 0, 1.1, 1.6, 3.2, 14, 200, 700],
8: [0, 0, 1.1, 1.4, 2, 5, 39, 100, 800],
9: [0, 0, 1.1, 1.3, 1.6, 2.3, 7, 40, 200, 900],
10: [0, 0, 1.1, 1.2, 1.3, 1.4, 2.6, 10, 30, 200, 1000]
} as any;

const onClear = () => {
    // Handle clear logic here
};

useEffect(() => {
    // Fetch minimum bet amount or other necessary data on component mount
    // Example:
    setAmount('10'); // Set default bet amount to $10
}, []);
  const springProps = useSpring({
    number: crashPoint ? crashPoint : 1.01, // Target value for the animation
    from: { number: 1.00 }, // Initial value
    config: { duration: 300 } // Animation duration
  });


  const [rangeData, setRangeData] = useState(50);
  const [inputColor, setInputColor] = useState(false);
  let inputRef = useRef();
  const [betAmount, setBetAmount] = useState(1);
  const [MultiplierAmount, setMultiplierAmount] = useState(1.00);

  useEffect(() => {
    // Initialize socket connection
    const socket = io('http://localhost:3001');
  
    // Set the socket state
    setSocket(socket);
  
    // Variable to track if the component is mounted
    let isMounted = true;
  
    // Listen for 'connect' event to check if the connection is successful
    socket.on('connect', async () => {
      console.log('Socket connected');
      
      try {
        // Emit 'getUserData' event to request user data from the server
        socket.emit('getUserData'); // en onemlisi
  
        // Use a Promise to wait for the 'userData' event from the server
        const userData = await new Promise((resolve) => {
          // Listen for 'userData' event from the server
          socket.on('userData', (data) => resolve(data));
        });
  
        // Check if the component is still mounted
        if (isMounted) {
          if (userData.success) {
            const {
              id,
              username,
              email,
              balance,
              total_bets,
              games_won,
              total_wagered,
              net_profit,
              all_time_high,
              all_time_low,
              total_deposited,
              total_withdrawn,
              join_date,
              level,
              xp
            } = userData.userData;
  
            // Update state variables accordingly
            setUsername(username);
            setBalance(balance);
            setLevel(level);
          } else {
            // Handle error
            console.error("Failed to fetch user data");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });
  
    // Clean up the event listener when the component unmounts
    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, []);  
  function roundedToFixed(number, decimals){
    number = Number((parseFloat(number).toFixed(5)));
    
    var number_string = number.toString();
    var decimals_string = 0;
    
    if(number_string.split('.')[1] !== undefined) decimals_string = number_string.split('.')[1].length;
    
    while(decimals_string - decimals > 0) {
      number_string = number_string.slice(0, -1);
      
      decimals_string --;
    }
    
    return Number(number_string);
  }
  

  const HOUSE_EDGE = 4; // Limbo game has a 4% house edge
  const MAX_MULTIPLIER = 1000.00; // Limbo game has a 1000.00x max multiplier
    
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  
  //console.log(`Generated Game Seed: ${generatedGameSeed}`);
  //console.log(`Crash Point: ${crashPoint}x`);
    

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

const fetchUserData = async () => {
  try {
   const token = localStorage.getItem("token");
     const response = await axios.get("http://localhost:3001/getUserData", {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });

     if (response.data.success) {
       const userData = response.data; // Assuming response.data contains all the fields

       // Set state variables using destructuring
       const {
         id,
         username,
         email,
         balance,
         total_bets,
         games_won,
         total_wagered,
         net_profit,
         all_time_high,
         all_time_low,
         total_deposited,
         total_withdrawn,
         join_date,
         level,
         xp
       } = userData;

       // Now set your state variables accordingly
       setUsername(username);
       //setBalance(balance);
       setLevel(level);
     } else {
       // Handle error
       console.error("Failed to fetch user data");
     }
   } catch (error) {
     console.error("Error fetching user data:", error);
   }
 };
  
   // fetchUserData();
   function generateRandomGame() {
    // Generate a random game seed
    let gameSeed = generateRandomString(32);

    const clientSeed = '893a28219f012dc6ad42e442a9eaa926dddbea4d7f5ff16ddfeb3b5a72ef6094';

    function sha256(s) {
      return CryptoJS.SHA256(s).toString(CryptoJS.enc.Hex);
    }

    function clamp(num, min, max) {
      return Math.min(Math.max(num, min), max);
    }

    function getGameHash(gameSeed, clientSeed) {
      return CryptoJS.HmacSHA256(clientSeed, gameSeed).toString(CryptoJS.enc.Hex);
    }

    function getNumberFromHash(gameHash) {
      return parseInt(gameHash.slice(0, 52 / 4), 16);
    }

    function getCrashPoint(gameHash) {
      const n = getNumberFromHash(gameHash);
      const e = Math.pow(2, 52);
      const num = Math.floor(((100 - HOUSE_EDGE) * e - n) / (e - n)) / 100;
      return clamp(num, 1.00, MAX_MULTIPLIER);
    }

    gameSeed = sha256(gameSeed);
    const gameHash = getGameHash(gameSeed, clientSeed);
    const crashPoint = getCrashPoint(gameHash);

    return {
      generatedGameSeed: gameSeed,
      crashPoint: crashPoint
    };
  }


   const handlePlaceBets = async () => {
    try {
      const token = localStorage.getItem("token");
  
      // Generate a random game
      const { generatedGameSeed, crashPoint } = generateRandomGame();
      console.log(`Generated Game Seed: ${generatedGameSeed}`);
      console.log(`Crash Point: ${crashPoint}x`);
  
      // Calculate the multiplier based on the crashPoint value
      const multiplier = crashPoint.toFixed(2);
  
      console.log('Crash Point:', crashPoint);
      console.log('Multiplier:', multiplier);
      console.log('Bet Amount:', betAmount);
      setCrashPoint(crashPoint);
      const playerWinss = crashPoint > MultiplierAmount;
      const playerLosts = crashPoint < MultiplierAmount;
      setPlayerWinss(playerWinss);
      setPlayerLosts(playerLosts);
  
      // Compare crashPoint with MultiplierAmount
      if (playerWinss) {
        // Player loses
        const winamount = betAmount * MultiplierAmount;
        console.log (betAmount * MultiplierAmount);
        console.log('Win Amount (Win):', winamount);
   //   toast.success(`Place Bet successful! You won ${winamount} coins.`);
        setBalance(winamount);

        socket.emit('winbet', { winamount, username });

      } else if (playerLosts) {
        // Player wins
        const loseamount = (- betAmount);
        console.log('Updated Balance (Loss):', loseamount);
        setBalance(loseamount);
    //    toast.error(`Place Bet successful! You Lost ${betAmount} coins.`);
        socket.emit('losebet', { loseamount, username });
      }
  
      // Update the crashPoint state
    } catch (error) {
      console.error('Error placing bet:', error.message);
      // Handle the error, possibly show an error toast to the user
      toast.error('Error placing bet');
    }
  };
          

  return (
    <div>
      <NavbarComp />
      <ChatMenu />
      <div>
        <div className="pt-24 xl:ml-[80px]">
          <div className="xl:w-[68%] lg:w-[80%]  w-[90%] xl:ml-[450px] lg:ml-[420px] mx-auto lg:h-[600px] h-[700px] bg-[#22242F] rounded-md">
            
            <div className="flex lg:flex-row flex-col-reverse justify-between items-start py-12">

              <div className="border-t border-b border-r border-gray-700 px-2 py-4 lg:w-[300px] w-[100%] lg:h-[500px]">
                
                <div>
                  <p className="text-white font-semibold font-primary">
                    Bet Amount
                  </p>

                  <div className="relative">
                    <img
                      src={icon}
                      width="23"
                      height="23"
                      className="absolute top-4 left-2 text-2xl text-lightgrey"
                    />
                    <input
                      type="number"
                      ref={inputRef}
                      className="w-full h-10 bg-[#2F3241] focus:shadow-lg outline-none pl-10 text-white mt-2 font-primary font-semibold tracking-wider"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                    />
                    <div className="flex gap-x-2 absolute right-3 top-3">
                      <button
                        className="text-gray-400 font-semibold font-primary hover:bg-gray-700 p-1"
                        onClick={() =>
                          setBetAmount((prevAmount) => prevAmount / 2)
                        }
                      >
                        1/2
                      </button>
                      <button
                        className="text-gray-400 font-semibold font-primary hover:bg-gray-700 p-1"
                        onClick={() =>
                          setBetAmount((prevAmount) => prevAmount * 2)
                        }
                      >
                        2x
                      </button>
                    </div>
                  </div>
                </div>


                  <div className="relative">
                  <div className="mineNumberSetting">
                  <p className="text-white font-semibold ">
                    Risk
                  </p>
              <select name="minesNumber" id="mineNumber" >

                <option value="1">Classic</option>
                <option value="2">Medium</option>
                <option value="3">Hard</option>
              </select>
              </div>
              </div>
            
                <div className="-mt-[1px]">
                <Button
                  className="betbutton bg-blue-500 w-full h-12 text-white flex justify-center items-center border-2 mt-4 border-blue-800 hover:bg-blue-500 transition duration-200 font-primary font-semibold xl:text-base text-sm z-0 cursor-pointer relative transition duration-200"

                 onClick={onAutoPick} disabled={autoPickInProcess}>
                    Auto pick
                </Button>


                <Button
  className="betbutton bg-green w-full h-12 text-white flex justify-center items-center border-2 mt-4 border-blue-800 hover:bg-green transition duration-200 font-primary font-semibold xl:text-base text-sm z-0 cursor-pointer relative transition duration-200"
  onClick={handlePlaceBets}
>
  Place Bet
</Button>

                  

                </div>

              </div>
              <div className="border-t border-b border-l border-gray-700 lg:w-3/4 w-[95%] lg:ml-0 mx-auto lg:h-[500px] h-[400px] bg-[#1C1D27] z-0 relative">
            {/* <div class="grid grid-cols-6 gap-2">
  <button class="rounded-sm font-semibold text-sm p-1 flex justify-center items-center bg-green">3.00×</button>
  <button class=" rounded-sm font-semibold text-sm p-2 flex justify-center items-center bg-red-800">1.46×</button>
  <button class=" rounded-sm font-semibold text-sm p-2 flex justify-center items-center bg-red-800">1.47×</button>
  <button class=" rounded-sm font-semibold text-sm p-2 flex justify-center items-center bg-red-800">1.05×</button>
  <button class=" rounded-sm font-semibold text-sm p-2 flex justify-center items-center bg-red-800">24.00×</button>
  <button class=" rounded-sm font-semibold text-sm p-2 flex justify-center items-center bg-red-800">1.14×</button>
</div> */}
<div className="relative bottom-10 text-white  font-semibold select-none text-center">
  
  <animated.div
  className={playerWinss ? ' font-semibold select-none text-green' : playerLosts ? ' font-semibold select-none text-red-500' : ''}
  style={{
  }}
  >
      <Stack
      className="game-container game-keno"
      sx={{
          flexDirection: 'row',
          '@media (max-width:767px)': {
              flexDirection: 'column'
          }
      }}
  >

      <Stack
          sx={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
          }}
      >
          <Box className="game-content game-content-keno">
              <Box className="keno-grid">
                  {Array.from(Array(40).keys()).map((item, key) => (
                      <Box
                          key={key}
                          className={classnames({
                              active: selected.includes(key + 1),
                              selected: response.includes(key + 1)
                          })}
                          onClick={() => tileClick(key + 1)}
                      >
                          <span>{key + 1}</span>
                      </Box>
                  ))}
              </Box>
              {selected.length ? (
                  <Box className="game-history">
                      {odds[selected.length].map((item: number, key: number) => (
                          <Box key={key} className="history history-keno">
                              <Box>{item.toFixed(2)}x</Box>
                              <Box>
                                  {key} <i className="fas fa-square d-none d-lg-inline-block" />
                              </Box>
                          </Box>
                      ))}
                  </Box>
              ) : null}
          </Box>
      </Stack>
  </Stack>

  </animated.div>
  </div>    </div>




            </div>
          </div>
        </div>

        <div className="pt-24 xl:ml-[80px]">
          <div className="xl:w-[68%] lg:w-[80%]  w-[90%] xl:ml-[450px] lg:ml-[420px] mx-auto lg:mt-0 mt-6 lg:h-[300px] h-[600px] bg-[#1C1D27] rounded-md px-4 py-6">
            <h1 className="text-3xl text-lightgrey font-semibold font-primary">
              Limbo
            </h1>
            <div className="flex lg:flex-row flex-col gap-x-24">
              <div className="lg:w-1/4 w-full">
                <div className="mt-2">
                  <h2 className="text-lightgrey lg:text-lg text-base font-primary font-semibold">
                    Game Info
                  </h2>
                  <div className="flex flex-col gap-y-4 mt-4">
                    <div className="flex items-center justify-between px-4 text-lightgrey font-primary font-semibold bg-[#22242F] h-10 xl:text-base text-sm rounded-md">
                      <p>House Edge</p>
                      <p>4%</p>
                    </div>
                    <div
                      className="flex items-center justify-between px-4 text-lightgrey font-primary font-semibold bg-[#22242F] h-10
                  xl:text-base text-sm rounded-md"
                    >
                      <p>Max Bet</p>
                      <div className="flex items-center gap-x-2">
                        <p>400.00</p>
                        <BsFileLock2Fill className="text-xl" />
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between px-4 text-lightgrey font-primary font-semibold bg-[#22242F] h-10
                  xl:text-base text-sm rounded-md"
                    >
                      <p>Max Win</p>
                      <div className="flex items-center gap-x-2">
                        <p>4,000.000</p>
                        <BsFileLock2Fill className="text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/3 w-full xl:mt-2 lg:mt-2 mt-10">
                <h2 className="lg:text-lg text-base font-primary font-semibold text-lightgrey">
                  Game Description
                </h2>
                <p className="mt-4 text-lightgrey font-primary bg-[#22242F] px-4 xl:py-7 py-4 rounded-md xl:text-base text-sm">
Limbo is straightforward and simple, yet engaging all the same. This is why it's ideal for all players regardless of experience or expertise, as well as any budget and risks of appetite.

You have the choice to go either really small or make a beeline for bigger wins as high a 1,000.00x your bet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OverView/>

      <Footer />
      <ToastContainer
  position="top-right"
  autoClose={2500}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="white"
  style={{
    fontSize: '14px',
    padding: '10px',
    maxWidth: '100%',
  }}
/>

    </div>

  );
};

export default Keno;

"use client";

import { io } from "socket.io-client";

const BASE_URL = process.env.BASE_BACKEND_API_URL;
// const BASE_URL = "http://192.168.1.22:5001"

export const socket = io(BASE_URL);

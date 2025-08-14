// import React, { useMemo } from "react";
// import { Box, Typography } from "@mui/material";
// import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'


const invVal = 10000
const invROI = 0.06
const invTime = 20
const invCont = 200
const invContTime = 10
let totalCont = 0
let val = invVal
const populateFields = (invVal, invROI, invTime, invCont, invContTime) => {
    for (let i=0; i < (invContTime * 12); i++){ 
        val = ((val + invCont) * (1 + (invROI/12)))
        totalCont += invCont
    }
    for (let i=0; i < ((invTime - invContTime) * 12); i++){
        val = (val * (1+ (invROI/12)))
    }
    console.log("final value ", val, " Total Contributed: ", totalCont)
}
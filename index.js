#!/usr/bin/env node

import * as helper from "./helpers.js";
import * as booker from "./booking-utils.js";
import * as email from "./email-handler.js";
import * as configs from "./configs.js";


async function main(currentBookedDate) {
  if (!currentBookedDate) {
    helper.log(`Invalid current booked date: ${currentBookedDate}`)
    process.exit(1)
  }

  if (configs.FACILITY_ID != 125 && configs.FACILITY_ID != 124){
    helper.log(`Invalid facility ID`)
    process.exit(1)
  }

  var transporter = null
  if (isNotifEnabled){
    transporter = email.prepareMailSender()
  }  

  helper.log(`Initializing with current date ${currentBookedDate}`)

  let sessionHeaders = await booker.login()
  let counter = 0
  while(true) {
    try {
      counter++
      console.log(`Checking for available dates... (${counter})`)
      if (counter % 5 == 0) {
        sessionHeaders = await booker.login()
      }
      
      const date = await booker.checkAvailableDate(sessionHeaders)

      if (!date) {
        helper.log('No available date')
      } else if (date < currentBookedDate) {
        const time = await booker.checkAvailableTime(sessionHeaders, date)
        if (time !== undefined){
          booker.book(sessionHeaders, date, time)
          .then(res => helper.log(res))
          .then(d => helper.log(`Booked time at ${date} ${time}`), true)
        }else {
          console.log(`No time found in ${data}`)
        }
      } else {     
        helper.log(`Closest available date is further than the already booked date (${currentBookedDate} vs ${date})`)
      }
    } catch(err) {
      console.error(err)
      helper.log("Trying again...")
    }
    
    await helper.sleep()
  } 
}

const args = process.argv.slice(2);
const isNotifEnabled = args[0].toLowerCase() === "true" ? true : false

var latestBookedDate = configs.CURRENT_APPOINTMENT_DATE;
main(latestBookedDate)
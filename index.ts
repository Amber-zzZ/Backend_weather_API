import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const weather_api = process.env.API_KEY



const app = express();
app.use(cors());
const port:number = 3000

interface weatherQuery{
  latitude:number,
  longitude:number
}

interface cachedData{
  data:weatherData ,
  cached_time:number
}

interface weatherData {
  main_weather: string;
  temperature: number;
  feeling_temperature: number;
  humidity: number;
}


const cache:Record<string,cachedData> ={}
const expire= 5*60*1000;




app.get('/',async(req,res)=>{
  let {latitude,longitude}= req.query as unknown as weatherQuery 
   latitude = 30
   longitude = 30


  const key = `${latitude},${longitude}`
  if (cache[key]&& Date.now() - cache[key].cached_time < expire){
    console.log("cache hit")
      res.send(cache[key].data)
      return
  }

  try{
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weather_api}`)
      const data = response.data;
      const result = {"main_weather":data.weather.main,
        "temperature":data.main.temp,
        "feeling_temperature":data.main.feels_like,
        "humidity":data.main.humidity
      }
      console.log(data);
      cache[key] = {data:result, cached_time:Date.now()}
      res.send(result)
  }catch(err){
    console.log("Error getting weather info",err)
    res.status(500).json({ERROR:"error"})
  }
    
})

app.listen(port,() =>{console.log("Server listen on Port 3000")});
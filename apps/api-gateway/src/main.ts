
import cors from 'cors'
import express from 'express';
import proxy from 'express-http-proxy'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit';
import swaggerui from 'swagger-ui-express'
import axios from 'axios';
import cookieParser from  'cookie-parser'


const app = express();

app.use(cors({
  origin:"*",
  credentials:true
}))

app.use(morgan("dev"))
app.use(express.json({limit:"100mb"}))
app.use(express.urlencoded({limit:"100mb",extended:true}))
app.use(cookieParser())
app.set("trusty proxy",1)

const limiter = rateLimit({
  windowMs:14*60*1000,
  max:(req:any)=> (req.user ? 1000:100),
  message:{error:"Too many reqs,please try again later"},
  standardHeaders:true,
  legacyHeaders:true,
  keyGenerator:(req:any)=> req.ip
})
app.use(limiter)

app.use("/",proxy("http://localhost:6001"))

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

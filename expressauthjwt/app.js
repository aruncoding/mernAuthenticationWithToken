import dotenv from 'dotenv'
dotenv.config() // Make availble all variable created on .env file to access to this page
import express from 'express'
import cors from 'cors'
import connectDb from './config/connectdb.js'
import UserRoutes from './routes/userRoutes.js'


const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

//CORS Policy
app.use(cors())

//Database Connection
connectDb(DATABASE_URL)

//use JSON to return api in json form
app.use(express.json())

// Load Routes
app.use("/api/user", UserRoutes)

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
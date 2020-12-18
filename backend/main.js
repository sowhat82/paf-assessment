const morgan = require('morgan')
const express = require('express')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser');
const secureEnv = require('secure-env')
global.env = secureEnv({secret:'mySecretPassword'})
const AWS = require('aws-sdk');
const fs = require('fs')
var multer = require('multer');
var multipart = multer({dest: 'uploads/'});
const config = require('./config.json');
AWS.config.credentials = new AWS.SharedIniFileCredentials('day25todo');
const endpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: config.accessKeyId || process.env.ACCESS_KEY,
    secretAccessKey: config.secretAccessKey
    || process.env.SECRET_ACCESS_KEY
});
const app = express()

app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

const startApp = async (app, pool) => {
	const conn = await pool.getConnection()
	try {
		console.info('Pinging database...')
		await conn.ping()
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`)
		})
	} catch(e) {
		console.error('Cannot ping database', e)
	} finally {
		conn.release()
	}
}

// create connection pool
const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT) || 3306,
	database: 'paf2020',
	user: global.env.DB_USER || process.env.DB_USER,
	password: global.env.DB_PASSWORD || process.env.DB_PASSWORD,
	connectionLimit: 4
})


// start the app
startApp(app, pool)


app.use(express.static ( __dirname + '/frontend'))

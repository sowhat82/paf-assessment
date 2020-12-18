const morgan = require('morgan')
const MongoClient = require('mongodb').MongoClient;
const express = require('express')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser');
const secureEnv = require('secure-env')
global.env = secureEnv({secret:'mySecretPassword'})
const AWS = require('aws-sdk');
const url = 'mongodb://localhost:27017' /* connection string */
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
// create a client pool
const DATABASE = 'PAF'
const COLLECTION = 'shares'
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true });    

const app = express()

app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

const startApp = async (app, pool) => {
	const conn = await pool.getConnection()
	try {
		console.info('Pinging database...')
		await conn.ping()

        client.connect()
        .then(() => {
            app.listen(PORT, () => {
                console.info(`Application started on port ${PORT} at ${new Date()}`)        
            })
        })
        .catch(e => {
                console.error('cannot connect to mongodb: ', e)
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

const SQL_SELECT_COUNT_WHERE_USERNAME_PASSWORD = 'select count(*) from user where user_id = ? and password = ?;'

// start the app
startApp(app, pool)

app.post('/login', async (req, resp) => {

	console.info('here')
    const username = req.body.username;
    const password = req.body.password;

	const conn = await pool.getConnection()
	try {

		await conn.beginTransaction()

		console.info(username, password)
        const [ count, _ ] = await conn.query(
            SQL_SELECT_COUNT_WHERE_USERNAME_PASSWORD, [username, password],
		)

		console.info(count[0]['count(*)'])
		await conn.commit()

		if (count[0]['count(*)'] > 0){
			resp.status(200)
			resp.json({result: 'ok'})	
		}
		else{
			resp.status(401)
			resp.json({result: 'invalid'})	
		}

	} catch(e) {
		conn.rollback()
		resp.status(500).send(e)
		resp.end()
	} finally {
		conn.release()
	}
});

app.post('/uploadImage', multipart.single('image-file'),
    (req, resp) => {

        try{
            fs.readFile(req.file.path, async (err, imgFile) => {
            
                // put object configurations
    
                // post to digital ocean        
                const params = {
                    Bucket: 'tfipbucket',
                    Key: req.file.filename,
                    Body: imgFile,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype,
                    ContentLength: req.file.size,
                    Metadata: {
                        originalName: req.file.originalname,
                        author: 'alvin',
                        update: 'new image',
                    }
                }
                // post to digital ocean continued
                s3.putObject(params, (error, result) => {    
                })

                // delete temp file that multer stores
                resp.on('finish', () => {
                    fs.unlink(req.file.path, () =>{})
                })

                return resp.status(200)
                .type('application/json')
                .json({ 'key': req.file.filename });
        })    

        }
        catch(e){
            resp.status(500)
            console.info(e)
            resp.json({e})
        }

    }    
);

app.post('/share', async (req, resp) => {

    const title = req.body.title;
    const comments	 = req.body.comments;
    const digitalOceanKey = req.body.digitalOceanKey

    try{
        const result = await client.db(DATABASE)
        .collection(COLLECTION)
        .insertOne({
            title: title,
            comments: comments,
            digitalOceanKey: digitalOceanKey,
            timeStamp: new Date(),
        })

        resp.status(200)
        resp.type('application/json')
        resp.json(result)

    }
    catch(e){
        resp.status(500)
        console.info(e)
        resp.json({e})
    }

});

app.use(express.static ( __dirname + '/frontend'))

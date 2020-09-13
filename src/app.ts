
// const config = require('./config')
import { LevelController } from './LevelController'
import session from 'cookie-session';
// const TaskDao = require('./models/taskDao')
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')


import cors from 'cors';

interface ErrorWithStatus extends Error {
    status: number;
}

class App {

    private config = {
        endpoint: process.env.COSMOS_DB_URL || '',
        key: process.env.COSMOS_DB_KEY || '',
        databaseId: process.env.COSMOS_DB_ID || '',
        containerId: process.env.COSMOS_DB_CONTAINER || '',
        partitionKey: { paths: ["/UserId"] }
    };

    private allowedOrigins: string[] = ['http://someorigin.com',
        'http://anotherorigin.com',
        'http://localhost:3001'];
    private corsOptions: cors.CorsOptions = {
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'X-Access-Token',
            'Authorization'
        ],

        methods: ['GET', 'OPTIONS', 'PUT', 'POST', 'DELETE'],

        preflightContinue: false,
        origin: function (origin, callback) {
            // allow requests with no origin
            // (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (this.allowedOrigins.indexOf(origin) === -1) {
                var msg = 'The CORS policy for this site does not ' +
                    'allow access from the specified Origin.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },

        exposedHeaders: ['Content-Length'],
        credentials: true,
    };

    public app: express.Application = null;
    private levelController: LevelController;

    constructor() {
        this.init()
        this.app = express()
        // this.app.use(cors(this.corsOptions));
        this.security()
        this.middleware();
        this.routes();
    }

    async init() {
        // const cosmosClient = new CosmosClient({
        //     endpoint: this.config.endpoint,
        //     key: this.config.key
        // })
        // const cosmosTest = new CosmosTest(cosmosClient, this.config)
        // this.levelController = new LevelController(cosmosTest)
        // const taskList = new TaskList(taskDao)
        // cosmosTest
        //     .init(err => {
        //         console.error(err)
        //     })
        //     .catch(err => {
        //         console.error(err)
        //         console.error(
        //             'Shutting down because there was an error settinig up the database.'
        //         )
        //         process.exit(1)
        //     })
    }


    // Security

    private security() {
        this.app.use(cors(this.corsOptions));

        var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        this.app.use(session({
            name: 'session',
            keys: ['Test1', 'test2'],
            cookie: {
                secure: true,
                httpOnly: true,
                domain: 'discordapi.hoppeh.no',
                path: 'test',
                expires: expiryDate
            }
        }))
        this.app.use(helmet())

    }

    // Configure Express middleware.
    private middleware(): void {

        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser())
    }



    routes() {

        const router = express.Router();





        // view engine setup
        // this.app.set('views', path.join(__dirname, 'views'))
        // this.app.set('view engine', 'jade')

        // uncomment after placing your favicon in /public
        //this.app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

        // this.app.use(express.static(path.join(__dirname, 'public')))

        // add your routes

        // enable pre-flight
        // router.options('*', cors(options));
        router.use((req, res, next) => {
            if (req.method === 'OPTIONS') {
                res.send(200);
            } else {
                next();
            }
        });
        // placeholder route handler
        router.use('/', (req, res, next) => {
            res.json({
                message: 'Hello World11111!'
            });
        });

        //Todo this.app:


        // router.get('/', (req: Request, res: Response, next: NextFunction) => console.log('ShowTasks'))
        // this.app.get('/', (req: Request, res: Response, next: NextFunction) => LevelController.showTasks(req, res).catch(next))
        router.post('/addtask', (req, res, next) => { console.log('Addtask'); this.levelController.addTask(req, res).catch(next) })
        router.post('/completetask', (req, res, next) => {
            console.log('test');
            this.levelController.completeTask(req, res).catch(next)
            res.status(200).message('Tasks completed')
            res.send();
        }
        )


        this.app.use('/', cors(), router);


        // catch 404 and forward to error handler
        this.app.use(function (req: Request, res: Response, next: NextFunction) {
            const err = new Error('Not Found') as ErrorWithStatus
            err.status = 404
            next(err)
        })

        // error handler
        this.app.use(function (err, req: Request, res: Response, next: NextFunction) {
            // set locals, only providing error in development
            res.locals.message = err.message
            res.locals.error = req.app.get('env') === 'development' ? err : {}

            // render the error page
            res.status(err.status || 500)
            res.send(err)
        })
    }

}



export default new App().app;
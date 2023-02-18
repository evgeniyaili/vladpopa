import config from 'dotenv/config'
import express from 'express'
import sequelize from './sequelize.js'
import * as mapping from './models/mapping.js'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import router from './routes/index.js'
import errorMiddleware from './middleware/errorMiddleware.js'


const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TOKEN, {polling: true});
const WAurl = 'https://unrivaled-peony-83c0f1.netlify.app/';
const PORT = process.env.PORT || 5000

const app = express()
// Cross-Origin Resource Sharing
app.use(cors({origin: ['http://localhost:3001'], credentials: true}))
// middleware для работы с json
app.use(express.json())
// middleware для статики (img, css)
app.use(express.static('static'))
// middleware для загрузки файлов
app.use(fileUpload())
// middleware для работы с cookie
app.use(cookieParser(process.env.SECRET_KEY))
// все маршруты приложения
app.use('/api', router)

// обработка ошибок
app.use(errorMiddleware)

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text === '/start'){
        await bot.sendMessage(chatId, 'Thanks for your message, visit our site', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Place an order', web_app:{url: WAurl}}]
                ]
             }
         })
         await bot.sendMessage(chatId, 'Fill in the form down!', {
            reply_markup: {
            keyboard: [
                    [{text: 'Info', web_app:{url: WAurl + '/form'}}]
                ]
             }
         })
    }
    if (msg?.web_app_data?.data){
        try{
            const data = JSON.parse(msg?.web_app_data?.data);
            console.log(data)
            await bot.sendMessage(chatId,'Information is accepted');
            await bot.sendMessage(chatId, 'Your street is ' + data?.address);
        } catch (e) {
            console.log(e);
        }
       
    }
    
  });

//   app.post('/web-data', async (req,res) => {
//     const {queryId, products, totalPrice} = req.body;
//         try {
//             await bot.answerWebAppQuery(queryId, {
//                 type: 'article',
//                 id: queryId,
//                 title: 'Successful!',
//                 input_message_content: {message_text:'All done, total amount spent: ' + totalPrice}
//             })
//             return res.status(200).json({});
//         } catch (e) {
//             await bot.answerWebAppQuery(queryId, {
//                 type: 'article',
//                 id: queryId,
//                 title: 'Something went wrong',
//                 input_message_content: {message_text:'Something went wrong'}
//             })
//             return res.status(500).json({});
//         }
        
// })

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log('Сервер запущен на порту', PORT))
    } catch(e) {
        console.log(e)
    }
}

start()

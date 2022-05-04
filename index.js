const { Telegraf } = require('telegraf')
const Markup = require('telegraf/markup')
require('dotenv').config()
const bot = new Telegraf(process.env.BOT_TOKEN) //сюда помещается токен, который дал botFather
var admin = require("firebase-admin");

var serviceAccount = require("./rusik-magaz17-firebase-adminsdk-w3rld-77f8788aad.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rusik-magaz17-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

async function addDoc (d){
    const docRef = db.collection('test').doc();
    await docRef.set(d);
}

async function getDoc (colname){
    const snapshot = await db.collection(colname).get();
    let list =[]
    snapshot.forEach((doc) => {
         list.push(doc.data())
    });
    return list
} 
async function getTovar(menuId){
    const citiesRef = db.collection('tovar');
    const snapshot = await citiesRef.where('menuId', '==', menuId).get();
    if (snapshot.empty) {
    console.log('No matching documents.');
    return;
    }  

    let list =[]
    snapshot.forEach((doc) => {
         list.push(doc.data())
    });
    return list
}

 getMenu = async () =>{
     let mm =[]
    for(let d of await getDoc('mainMenu')){
       mm.push(d.name)
    }

    return Markup.keyboard(
        mm
     ).resize().extra()
}



bot.start( async (ctx) => ctx.reply('Меню',await getMenu()  )) //ответ бота на команду /start
bot.help((ctx) => ctx.reply('Send me a sticker')) //ответ бота на команду /help
bot.on('sticker', (ctx) => ctx.reply('')) //bot.on это обработчик введенного юзером сообщения, в данном случае он отслеживает стикер, можно использовать обработчик текста или голосового сообщения
//  bot.hears('hi',async (ctx) => {
     
        
    
// })

bot.hears('Пицца', async (ctx) => {
    let menuId = await (await getDoc('mainMenu')).filter((n)=>{ return n.name.match(ctx.update.message.text) })
      for(let t of await getTovar(menuId[0].id)){
        ctx.reply(t.name+' '+t.size, { 
            reply_markup: Markup.inlineKeyboard(
                 [Markup.callbackButton('В корзину', 'addShopCart' ) ]
            )
          })
      }    
})

bot.action('addShopCart', ctx=> {
    bot.telegram.sendMessage(ctx.chat.id, 'Добавлено в корзину')
    console.log(ctx.update.callback_query)
})



// bot.hears это обработчик конкретного текста, данном случае это - "hi"
bot.launch() 
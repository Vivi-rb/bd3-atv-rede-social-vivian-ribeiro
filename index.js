const express = require("express");
const ejs = require("ejs");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "public"));

app.engine('html', ejs.renderFile);

app.use('/', (request, response) => {
    response.render('index.html');
});

//função pra conectar com o banco
function connectDB() {

    let dbUrl = 'mongodb+srv://vvivi2:Tortinha!21@cluster0.lonp2jb.mongodb.net/'

    mongoose.connect(dbUrl);

    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

    mongoose.connection.once('open', function callBack() {
        console.log("Conectado!✨")
    });

}

let posts = [];

connectDB();

let Postagem = mongoose.model('Postagem', { titulo: String, dataHora: String, texto: String });

Postagem.find({}) //find sem critérios
    .then(docs => { //async function
        console.log('DOCS:' + docs);
        posts = docs;
        console.log('Posts:' + posts);
    }).catch(error => {
        console.log('ERRO:' + error);
    });

io.on("connection", socket => {

    console.log("ID de usuário conectado: " + socket.id) //pra ligar o socketIO

    socket.emit("previousPost", posts); //emite as mensagens

    socket.on("sendPost", data => {

        //messages.push(data); --> posição de fila ou pilha => o último que entra é o primeiro que sai

        let post = new Postagem(data);

        //socket.broadcast.emit("receivedMessage", data);

        post.save()
            .then(
                socket.broadcast.emit('receivedPost', data)
            ).catch(error => {
                console.log('ERRO:' + error)
            })

    });

});


server.listen(3333, () => {
    console.log("SERVIDOR RODANDO EM - http://localhost:3333");
});
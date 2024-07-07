const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 8000;
const list_users = {};

// Middleware para servir archivos estáticos desde la carpeta views
app.use(express.static(path.join(__dirname, "views")));
app.use('/css', express.static(path.join(__dirname, 'views/css')));
app.use('/js', express.static(path.join(__dirname, 'views/js')));
app.use('/img', express.static(path.join(__dirname, 'views/img')));

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Configuración de Socket.IO
io.on("connection", (socket) => {
  socket.on("register", ({ username, userType, adminCode }) => {
    if (list_users[username]) {
      socket.emit("userExists");
    } else {
      if (userType === "administrador" && adminCode !== "GHS") {
        socket.emit("adminCodeInvalid");
      } else {
        list_users[username] = { id: socket.id, userType };
        socket.username = username;
        socket.userType = userType;
        socket.emit("login", { username, userType });
        io.emit("activeSessions", list_users);
      }
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete list_users[socket.username];
      io.emit("activeSessions", list_users);
    }
  });

  socket.on("sendMessage", ({ message, image }) => {
    io.emit("sendMessage", { message, user: socket.username, image });
  });

  socket.on("sendMessagesPrivate", ({ message, image, selectUser }) => {
    if (list_users[selectUser]) {
      io.to(list_users[selectUser].id).emit("sendMessagesPrivate", {
        message,
        user: socket.username,
        image,
      });
    } else {
      socket.emit("sendMessage", {
        message: "El usuario al que intentas enviar el mensaje no existe!",
        user: "Sistema",
        image: null,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

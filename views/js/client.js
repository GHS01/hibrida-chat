const socket = io();

let fileURL;
let privateChatUser = '';

// Formularios
const formLogin = document.querySelector("#formLogin");
const formContentChat = document.querySelector(".body-chat");
const formShowUsers = document.querySelector("#formShowUsers");
const formChatGrupal = document.querySelector("#formChatGrupal");

// Textbox's
const txtUserNickName = document.querySelector("#userNickName");
const txtUserMessage = document.querySelector("#userMessage");
const txtPrivateUserMessage = document.querySelector("#privateUserMessage");
const txtUserRole = document.querySelector("#userRole");
const txtAdminCode = document.querySelector("#adminCode");
const adminCodeField = document.querySelector("#adminCodeField");

// File - Image
const userFile = document.querySelector("#userFile");
const privateUserFile = document.querySelector("#privateUserFile");

// Button's
const btnrRegisterUser = document.querySelector("#registerUser");
const btnSendMessage = document.querySelector("#sendMessage");
const btnSendFile = document.querySelector("#sendFile");
const btnPrivateSendMessage = document.querySelector("#privateSendMessage");
const btnPrivateSendFile = document.querySelector("#privateSendFile");
const btnToggleEmojiPicker = document.querySelector("#toggleEmojiPicker");
const btnTogglePrivateEmojiPicker = document.querySelector("#togglePrivateEmojiPicker");

// Print
const printUsersActive = document.querySelector("#usersActive");
const printMessages = document.querySelector("#messages");
const printPrivateMessages = document.querySelector("#privateMessages");

// Modal
const privateChatModal = document.getElementById("privateChatModal");
const spanClose = document.getElementsByClassName("close")[0];

// Emoji Picker
const emojiPicker = document.querySelector("#emojiPicker");
const privateEmojiPicker = document.querySelector("#privateEmojiPicker");

formContentChat.style.display = "none";
formShowUsers.style.display = "none";
formChatGrupal.style.display = "none";

// Variables globales para burbujas de chat
const chatBubblesContainer = document.getElementById('chatBubblesContainer');
let openBubbles = {};

// Función para abrir una burbuja de chat
function openChatBubble(user) {
  if (openBubbles[user]) {
    // Si la burbuja ya está abierta, enfocarla
    openBubbles[user].querySelector('input').focus();
  } else {
    // Crear una nueva burbuja de chat
    const bubble = document.createElement('div');
    bubble.classList.add('chatBubble');
    bubble.innerHTML = `
      <div class="chatBubbleHeader">
        <h4>${user}</h4>
        <span class="minimizeBubble">-</span>
        <span class="closeBubble">&times;</span>
      </div>
      <div class="chatBubbleMessages" id="bubbleMessages-${user}"></div>
      <div class="chatBubbleInput">
        <input type="text" placeholder="Escribir mensaje..." id="bubbleInput-${user}">
        <button onclick="sendPrivateMessage('${user}')">Enviar</button>
      </div>
    `;
    chatBubblesContainer.appendChild(bubble);
    openBubbles[user] = bubble;

    // Añadir eventos
    bubble.querySelector('.closeBubble').addEventListener('click', () => closeChatBubble(user));
    bubble.querySelector('.minimizeBubble').addEventListener('click', () => minimizeChatBubble(user));
  }
}

// Función para cerrar una burbuja de chat
function closeChatBubble(user) {
  const bubble = openBubbles[user];
  if (bubble) {
    chatBubblesContainer.removeChild(bubble);
    delete openBubbles[user];
  }
}

// Función para minimizar una burbuja de chat
function minimizeChatBubble(user) {
  const bubble = openBubbles[user];
  if (bubble) {
    bubble.style.display = 'none';
    const minimizedBubble = document.createElement('div');
    minimizedBubble.classList.add('minimizedBubble');
    minimizedBubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path d="M4.5 6.75A.75.75 0 015.25 6h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 12a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25A.75.75 0 014.5 12zm0 5.25a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
    </svg>`;
    minimizedBubble.addEventListener('click', () => restoreChatBubble(user, minimizedBubble));
    chatBubblesContainer.appendChild(minimizedBubble);
  }
}

// Función para restaurar una burbuja de chat minimizada
function restoreChatBubble(user, minimizedBubble) {
  const bubble = openBubbles[user];
  if (bubble) {
    bubble.style.display = 'flex';
    chatBubblesContainer.removeChild(minimizedBubble);
  }
}

// Función para enviar un mensaje privado
function sendPrivateMessage(user) {
  const input = document.getElementById(`bubbleInput-${user}`);
  const message = input.value.trim();
  if (message !== "") {
    socket.emit('sendMessagesPrivate', { message, selectUser: user });
    input.value = "";
    const messageHtml = `<div class="message my_message"><p>${message}</p></div>`;
    document.getElementById(`bubbleMessages-${user}`).insertAdjacentHTML("beforeend", messageHtml);
    document.getElementById(`bubbleMessages-${user}`).scrollTop = document.getElementById(`bubbleMessages-${user}`).scrollHeight;
  }
}

// Recibir mensajes privados y mostrarlos en la burbuja correspondiente
socket.on('sendMessagesPrivate', ({ message, user }) => {
  if (!openBubbles[user]) {
    openChatBubble(user);
  }
  const messageHtml = `<div class="message frnd_message"><p>${message}</p></div>`;
  document.getElementById(`bubbleMessages-${user}`).insertAdjacentHTML("beforeend", messageHtml);
  document.getElementById(`bubbleMessages-${user}`).scrollTop = document.getElementById(`bubbleMessages-${user}`).scrollHeight;
  // Añadir notificación si la burbuja no está en foco
  if (document.activeElement !== document.getElementById(`bubbleInput-${user}`)) {
    openBubbles[user].classList.add('newMessage');
  }
});

// Abrir burbuja de chat al hacer clic en un usuario
document.querySelectorAll('#usersActive li').forEach(li => {
  li.addEventListener('click', () => openChatBubble(li.textContent));
});

// Abrir modal
function openModal(user) {
  privateChatUser = user;
  privateChatModal.style.display = "block";
  printPrivateMessages.innerHTML = ''; // Limpiar mensajes previos
}

// Cerrar modal
spanClose.onclick = function () {
  privateChatModal.style.display = "none";
};

// Cerrar modal al hacer clic fuera de él
window.onclick = function (event) {
  if (event.target == privateChatModal) {
    privateChatModal.style.display = "none";
  }
}

// Mostrar/ocultar el Emoji Picker
btnToggleEmojiPicker.addEventListener("click", () => {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
});

btnTogglePrivateEmojiPicker.addEventListener("click", () => {
  privateEmojiPicker.style.display = privateEmojiPicker.style.display === "none" ? "block" : "none";
});

// Añadir el emoji al campo de texto
emojiPicker.addEventListener("emoji-click", (event) => {
  txtUserMessage.value += event.detail.unicode;
});

privateEmojiPicker.addEventListener("emoji-click", (event) => {
  txtPrivateUserMessage.value += event.detail.unicode;
});

// Inicializar el emoji picker
new EmojiMart.Picker({
  onEmojiSelect: (emoji) => {
    txtUserMessage.value += emoji.native;
  },
  parent: emojiPicker,
  set: "apple",
  perLine: 8, // Ajusta este valor según sea necesario para el diseño
  theme: 'light'
});

new EmojiMart.Picker({
  onEmojiSelect: (emoji) => {
    txtPrivateUserMessage.value += emoji.native;
  },
  parent: privateEmojiPicker,
  set: "apple",
  perLine: 8, // Ajusta este valor según sea necesario para el diseño
  theme: 'light'
});

socket.on("login", ({ username, userType }) => {
  alert(
    "¡Bienvenido " +
      txtUserNickName.value.trim() +
      "!\nRecuerda, respetar a los demás usuarios."
  );
  formLogin.style.display = "none";
  formContentChat.style.display = "flex";
  formShowUsers.style.display = "block";
  formChatGrupal.style.display = "block";
});

socket.on("userExists", () => {
  alert(
    "El nickname: " +
      txtUserNickName.value.trim() +
      " ya está en uso, intenta con otro."
  );
  txtUserNickName.value = "";
  txtUserNickName.focus();
});

socket.on("adminCodeInvalid", () => {
  alert("Código de administrador incorrecto. Intenta nuevamente.");
  txtAdminCode.value = "";
  txtAdminCode.focus();
});

socket.on("activeSessions", (users) => {
  printUsersActive.innerHTML = "";
  for (const user in users) {
    const li = document.createElement("li");
    li.textContent = `${user} (${users[user].userType})`;
    li.dataset.user = user;
    li.addEventListener("click", () => {
      openChatBubble(user);
    });
    printUsersActive.appendChild(li);
  }
});

socket.on("sendMessage", ({ message, user, image }) => {
  const isMyMessage = user === txtUserNickName.value.trim();
  const messageHtml = `
    <div class="message ${isMyMessage ? 'my_message' : 'frnd_message'}">
      <div class="username">${isMyMessage ? 'Tú' : user}</div>
      <p>${message}</p>
      ${image ? `<img src="${image}" alt="Imagen">` : ""}
    </div>
  `;
  printMessages.insertAdjacentHTML("beforeend", messageHtml);
  printMessages.scrollTop = printMessages.scrollHeight;
});

// Asegurar que no haya duplicidad en el evento 'sendMessagesPrivate'
socket.off('sendMessagesPrivate').on("sendMessagesPrivate", ({ message, user, image }) => {
  if (!openBubbles[user]) {
    openChatBubble(user);
  }
  const isMyMessage = user === txtUserNickName.value.trim();
  const messageHtml = `
    <div class="message ${isMyMessage ? 'my_message' : 'frnd_message'}">
      <div class="username">${isMyMessage ? 'Tú' : user}</div>
      <p>${message}</p>
      ${image ? `<img src="${image}" alt="Imagen">` : ""}
    </div>
  `;
  document.getElementById(`bubbleMessages-${user}`).insertAdjacentHTML("beforeend", messageHtml);
  document.getElementById(`bubbleMessages-${user}`).scrollTop = document.getElementById(`bubbleMessages-${user}`).scrollHeight;
  if (document.activeElement !== document.getElementById(`bubbleInput-${user}`)) {
    openBubbles[user].classList.add('newMessage');
  }
});

txtUserNickName.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    btnrRegisterUser.click();
  }
});

btnrRegisterUser.addEventListener("click", () => {
  let username = txtUserNickName.value.trim();
  let userType = txtUserRole.value;
  let adminCode = txtAdminCode.value.trim();

  if (userType === "administrador" && adminCode === "") {
    alert("El código de administrador es obligatorio.");
    txtAdminCode.focus();
    return;
  }

  if (userType === "administrador" && adminCode !== "GHS") {
    alert("Código de administrador incorrecto. Intenta nuevamente.");
    txtAdminCode.focus();
    return;
  }

  if (txtUserNickName.value.trim() != "") {
    socket.emit("register", { username, userType, adminCode });
  }
});

btnSendMessage.addEventListener("click", () => {
  if (fileURL != undefined) {
    if (txtUserMessage.value.startsWith("-private:")) {
      const selectUser = txtUserMessage.value.split(" ")[1];
      const message = txtUserMessage.value.substr(selectUser.length + 10);
      socket.emit("sendMessagesPrivate", {
        message,
        image: fileURL,
        selectUser,
      });
    } else {
      socket.emit("sendMessage", {
        message: txtUserMessage.value.trim(),
        image: fileURL,
      });
    }
  } else {
    if (txtUserMessage.value.trim() != "") {
      if (txtUserMessage.value.startsWith("-private:")) {
        const selectUser = txtUserMessage.value.split(" ")[1];
        const message = txtUserMessage.value.substr(selectUser.length + 10);
        socket.emit("sendMessagesPrivate", {
          message,
          image: fileURL,
          selectUser,
        });
      } else {
        socket.emit("sendMessage", {
          message: txtUserMessage.value.trim(),
          image: fileURL,
        });
      }
    }
  }

  txtUserMessage.value = "";
  fileURL = undefined;
  printMessages.scrollTop = printMessages.scrollHeight;
});

txtUserMessage.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    if (fileURL != undefined) {
      if (txtUserMessage.value.startsWith("-private:")) {
        const selectUser = txtUserMessage.value.split(" ")[1];
        const message = txtUserMessage.value.substr(selectUser.length + 10);
        socket.emit("sendMessagesPrivate", {
          message,
          image: fileURL,
          selectUser,
        });
      } else {
        socket.emit("sendMessage", {
          message: txtUserMessage.value.trim(),
          image: fileURL,
        });
      }
    } else {
      if (txtUserMessage.value.trim() != "") {
        if (txtUserMessage.value.startsWith("-private:")) {
          const selectUser = txtUserMessage.value.split(" ")[1];
          const message = txtUserMessage.value.substr(selectUser.length + 10);
          socket.emit("sendMessagesPrivate", {
            message,
            image: fileURL,
            selectUser,
          });
        } else {
          socket.emit("sendMessage", {
            message: txtUserMessage.value.trim(),
            image: fileURL,
          });
        }
      }
    }
    txtUserMessage.value = "";
    fileURL = undefined;
  }

  printMessages.scrollTop = printMessages.scrollHeight;
});

btnSendFile.addEventListener("click", () => {
  userFile.click();
});

userFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    fileURL = reader.result;
  };
  reader.readAsDataURL(file);
  fileURL
    ? alert("Error al adjuntar, seleccione nuevamente.")
    : alert("Foto adjunta, lista para enviar.");
});

// Lógica para mensajes privados
btnPrivateSendMessage.addEventListener("click", () => {
  if (privateChatUser && txtPrivateUserMessage.value.trim() != "") {
    socket.emit("sendMessagesPrivate", {
      message: txtPrivateUserMessage.value.trim(),
      image: fileURL,
      selectUser: privateChatUser,
    });
    const messageHtml = `
      <div class="message my_message">
        <div class="username">Tú</div>
        <p>${txtPrivateUserMessage.value.trim()}</p>
        ${fileURL ? `<img src="${fileURL}" alt="Imagen">` : ""}
      </div>
    `;
    printPrivateMessages.insertAdjacentHTML("beforeend", messageHtml);
    txtPrivateUserMessage.value = "";
    fileURL = undefined;
    printPrivateMessages.scrollTop = printPrivateMessages.scrollHeight;
  }
});

txtPrivateUserMessage.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    btnPrivateSendMessage.click();
  }
});

btnPrivateSendFile.addEventListener("click", () => {
  privateUserFile.click();
});

privateUserFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    fileURL = reader.result;
  };
  reader.readAsDataURL(file);
  fileURL
    ? alert("Error al adjuntar, seleccione nuevamente.")
    : alert("Foto adjunta, lista para enviar.");
});

// Cerrar el Emoji Picker al hacer clic fuera de él
window.addEventListener("click", (event) => {
  if (!event.target.closest("#emojiPicker") && !event.target.closest("#toggleEmojiPicker")) {
    emojiPicker.style.display = "none";
  }
  if (!event.target.closest("#privateEmojiPicker") && !event.target.closest("#togglePrivateEmojiPicker")) {
    privateEmojiPicker.style.display = "none";
  }
});

txtUserRole.addEventListener("change", function () {
  if (txtUserRole.value === "administrador") {
    adminCodeField.style.display = "block";
  } else {
    adminCodeField.style.display = "none";
  }
});

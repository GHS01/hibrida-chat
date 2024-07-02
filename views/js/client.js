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

// File - Image
const userFile = document.querySelector("#userFile");
const privateUserFile = document.querySelector("#privateUserFile");

// Button's
const btnrRegisterUser = document.querySelector("#registerUser");
const btnSendMessage = document.querySelector("#sendMessage");
const btnSendFile = document.querySelector("#sendFile");
const btnPrivateSendMessage = document.querySelector("#privateSendMessage");
const btnPrivateSendFile = document.querySelector("#privateSendFile");

// Print
const printUsersActive = document.querySelector("#usersActive");
const printMessages = document.querySelector("#messages");
const printPrivateMessages = document.querySelector("#privateMessages");

// Modal
const privateChatModal = document.getElementById("privateChatModal");
const spanClose = document.getElementsByClassName("close")[0];

formContentChat.style.display = "none";
formShowUsers.style.display = "none";
formChatGrupal.style.display = "none";

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

socket.on("login", () => {
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
});

socket.on("activeSessions", (users) => {
  printUsersActive.innerHTML = "";
  for (const user in users) {
    const li = document.createElement("li");
    li.textContent = user;
    li.addEventListener("click", () => {
      openModal(user);
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

socket.on("sendMessagesPrivate", ({ message, user, image }) => {
  if (user === privateChatUser) {
    const isMyMessage = user === txtUserNickName.value.trim();
    const messageHtml = `
      <div class="message ${isMyMessage ? 'my_message' : 'frnd_message'}">
        <div class="username">${isMyMessage ? 'Tú' : user}</div>
        <p>${message}</p>
        ${image ? `<img src="${image}" alt="Imagen">` : ""}
      </div>
    `;
    printPrivateMessages.insertAdjacentHTML("beforeend", messageHtml);
    printPrivateMessages.scrollTop = printPrivateMessages.scrollHeight;
  }
});

txtUserNickName.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    btnrRegisterUser.click();
  }
});

btnrRegisterUser.addEventListener("click", () => {
  if (txtUserNickName.value.trim() != "") {
    let username = txtUserNickName.value.trim();
    socket.emit("register", username);
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

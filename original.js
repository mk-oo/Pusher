var firstScreen = document.querySelector('#first-screen');
var scecondScreen = document.querySelector('#second-screen');
let msgBtn = document.querySelector('#sendmsg-btn');
// var group = document.querySelector('#group-name-inp').value;
var user = 0.1;
var userEntriesObjects = {};
var userEntriesArray = [];
var event = 'my-event'
var room = 'my-channel'
var name = "";


function join() {

    room = validategroupName(document.querySelector('#group-name-inp').value);
    name = validateName(document.querySelector('#name-inp').value);

    console.log(room);
    console.log(name);
    user = getGUID();

    if (!confirm("Are you sure ?")) {
        return
    } else {
        firstScreen.style.display = 'none';
        scecondScreen.style.display = "block";
    }
    
    timer(60);
    storeLocalStrorage(name, user, room);
    subscribeToPusher(room, user);
}



function storeLocalStrorage(nameOfUser, idOfUser, room) {
    let div = document.querySelector('#online-users');


    var userEntriesObjects = {
        id: idOfUser,
        nameInArray: nameOfUser
    };
    var userEntriesArray = [];
    if (localStorage.getItem("key") === null) {
        userEntriesArray = [];
    } else {
        userEntriesArray = JSON.parse(localStorage.getItem("key"));
    }
    userEntriesArray.push(userEntriesObjects);
    localStorage.setItem('key', JSON.stringify(userEntriesArray));


    // get online user count
    onlineMembers = JSON.parse(localStorage.getItem('key')).length;
    console.log(onlineMembers);

    div.innerHTML = `${room}: Online Users (${onlineMembers}) `;

}

let subscribeToPusher = async function (room, user) {
    Pusher.logToConsole = true;

    var pusher = new Pusher('b2d0db28cededf04656d', {
        cluster: 'ap2'
    });
    var channel = pusher.subscribe(room);
    recievedMesage(channel, user)
}


recievedMesage = async function (channel, user) {
    channel.bind('my-event', function (data) {
        respond = JSON.parse(JSON.stringify(data));
        message = respond.message;
        senderId = respond.userId;
        senderName = respond.userName;
        addedMsg = document.querySelector('#chat');

        if (user == senderId) {
            addedMsg.insertAdjacentHTML("beforeend", `<p id= 'sender'> You: ${message}</p>`)
        }
        if (user != senderId) {
            addedMsg.insertAdjacentHTML("beforeend", `<p id ='reciever'>${senderName}: ${message}</p>`)
        }


    });
}


async function sendMessage() {
    console.log('Send Button Clicked')
    message = document.querySelector('#sendmsg-inp').value;
    document.querySelector('#sendmsg-inp').value = "";

    if (message === null || message.length === 0 || message.replace(/^\s+|\s+$/gm, '') == "") {
        alert('your text area is empty');
        return;
    }
    document.querySelector('#time').innerText = 60

    pusherAPI(message);
}

async function pusherAPI(message) {

    let body = {
        data: `{"message":"${message}","userName":"${name}","userId":"${user}"}`,
        name: "my-event",
        channel: room
    }
    let timeStamp = Date.now() / 1000;
    let md5 = getMD5(body);
    let url = `https://cors.bridged.cc/https://api-ap2.pusher.com/apps/1258784/events?body_md5=${md5}&auth_version=1.0&auth_key=b2d0db28cededf04656d&auth_timestamp=${timeStamp}&auth_signature=${getAuthSignature(md5,timeStamp)}`;
    let req = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });

}

function validateName(name) {
    if (name === null || name.length === 0 || name.replace(/^\s+|\s+$/gm, '') == "" || Boolean(name) === false) {
        alert('enter your name');

    } else {
        return name;
    }
}
function validategroupName(groupNam) {
    if (groupNam === null || groupNam.length === 0 || groupNam.replace(/^\s+|\s+$/gm, '') == "" || Boolean(groupNam) === false) {
        alert('enter your group name');

    } else {
        return groupNam;
    }
}
function getMD5(body) {
    return CryptoJS.MD5(JSON.stringify(body));
}
function getAuthSignature(md5, timeStamp) {
    return CryptoJS.HmacSHA256(`POST\n/apps/1258784/events\nauth_key=b2d0db28cededf04656d&auth_timestamp=${timeStamp}&auth_version=1.0&body_md5=${md5}`, "c83118ee1cad8cf369f7");
}
function getGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function getTime() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time
}
function logout() {
    firstScreen.style.display = 'block';
    scecondScreen.style.display = "none";
    localStorage.removeItem("key");
}
document.addEventListener('keypress', function (event) {

    if (event.keyCode == 13) {
        sendMessage();
    }
})
function timer(time) {
    time = Number(document.querySelector('#time').innerText);
    var timer = setInterval(function () {
        if (time > 1) {
            time = Number(document.querySelector('#time').innerText);
            display = document.querySelector('#time');
            time--;
            display.textContent = time;
        } else {
            logout();
            clearInterval(interval)
        }
    }, 1000);

}
const line = require('@line/bot-sdk');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const port = process.env.PORT || 4000

app.set('port', (process.env.PORT || 4000));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken
    let msg = req.body.events[0].message.text
    let id = req.body.events[0].source.userId
    console.log("id " + id);
    console.log(req.body.events[0]);
    var command = msg.split(" ");
    //reply(reply_token, msg)
    if (command[0] == "id") {
        console.log(command[0]);
        console.log(command[1]);
        record(id, command[1])
        replymsg(reply_token, "ok")
    } else {
        replymsg(reply_token, msg)
    }
    res.sendStatus(200)
});
//app.listen(port)

app.get('/', function(req, res) {
    res.send('Hello')
})
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

function record(userid, lineid) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {channel access token}'
    }
    if (lineid) {
        var body = JSON.stringify({
            "lineid": lineid,
            "userid": userid
        })
        request.post({
            url: 'https://leavebackend.herokuapp.com/lines/create',
            headers: headers,
            body: body
        }, (err, res, body) => {
            //console.log('status = ' + res.statusCode);
            //console.log(body);
            console.log(err);
        });
        console.log("recorded");

    }

}

function reply(reply_token, msg) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {channel access token}'
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: msg
        }]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
        console.log(err);
    });
}

app.post('/sendmessage', (req, res) => {
    let userid = req.body.id
    let msg = req.body.text
        //console.log(req.body);
    console.log(userid);
    console.log(msg);

    pushmsg(userid, msg);
    getuserinfo(userid);
    res.send('sended?')
});

const client = new line.Client({
    channelAccessToken: 'channel access token'
});

function pushmsg(userid, msg) {


    const message = {
        type: 'text',
        text: msg
    };

    client.pushMessage(userid, message)
        .then(() => {
            console.log('sended?');
        })
        .catch((err) => {
            // error handling
            console.log("error");

        });
}

function replymsg(reply_token, msg) {
    const message = {
        type: 'text',
        text: msg
    };

    client.replyMessage(reply_token, message)
        .then(() => {
            console.log('sended?');
        })
        .catch((err) => {
            // error handling
            console.log("error");
        });
}

function getuserinfo(userid) {
    client.getProfile(userid)
        .then((profile) => {
            console.log(profile.displayName);
            console.log(profile.userId);
            console.log(profile.pictureUrl);
            console.log(profile.statusMessage);
        })
        .catch((err) => {
            // error handling
        });
}
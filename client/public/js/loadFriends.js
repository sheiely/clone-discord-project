function getCookie(name){
    let cookie = {};
    
    document.cookie.split(';').forEach(function(el) {
        let [k,v] = el.split('=');
        cookie[k.trim()] = v;
    })
    
    return cookie[name];

};
if(!getCookie('token')){
    window.location.replace("/login");/////////REMEMBER CHANGE FOR DEPLOY
}

//First load
loadAllFriends();
loadPedding();


//All Friends
function loadAllFriends(){
    $('#content-all-items').text("");
    $.ajax({
        method: "POST",
        url: "http://23.20.170.178:8081/friendship/friends",/////////REMEMBER CHANGE FOR DEPLOY
        headers: {
            "Authorization": getCookie("token")
        },
    }).then((result)=>{
        $('#qntFriends').text(result.qnt);
            
        result.friends.forEach((c, i, a)=>{
            var link = $("<a href='/channels/"+c.friend._id+"'></a>");
            var userCard = $("<div class='userCard'></div>");
            var imgDiv = $("<div class='userCard-img'><img src='/images/user.jpg'><div class='userCard-StatusBorder'><div id='status-"+c.friend._id+"' class='userCard-status'></div></div></div>");
            var userCardName = $("<div class='userCard-name'></div>");
            var name = $("<p>"+c.friend.name+"</p>");
            var span = $("<span id='userStatus-"+c.friend._id+"'>Offline</span>");
            userCardName.append(name);
            userCardName.append(span);
            userCard.append(imgDiv);
            userCard.append(userCardName);
            link.append(userCard);
            $('#content-all-items').append(link);
        });
    }).catch((err)=>{
        console.log(err.responseJSON);
    });    
}
function loadPedding(){
    $('#content-pedding-items').text("");
    $.ajax({
        method: "GET",
        url: "http://23.20.170.178:8081/friendship/invitesReceived",/////////REMEMBER CHANGE FOR DEPLOY
        headers: {
            "Authorization": getCookie("token")
        },
    }).then((result)=>{
        $('#qntPedding').text(result.qnt);
        
        result.invites.forEach((c, i, a)=>{
            var cardInvite = $("<div class='userCardInvite'></div>");
            var profile = $("<div class='userCardProfile'><img src='/images/user.jpg'></div>");
            var div = $("<div></div>");
            var cardName = $("<div class='userCard-name'></div>");
            var name = $("<p>"+c.idInviter.name+"</p>");
            var span = $("<span>Request of friendship</span>");
            var buttonAccept = $("<button class='btn-accept' onclick=\"acceptInvite('"+c._id+"')\" id='inviteaccept-"+c._id+"'>Accept</button>");
            var buttonDeny = $("<button class='btn-deny' onclick=\"denyInvite('"+c._id+"')\" id='invitedeny-"+c._id+"'>Deny</button></div></div>");
            cardName.append(name);
            cardName.append(span);
            profile.append(cardName);
            cardInvite.append(profile);
            div.append(buttonAccept);
            div.append(buttonDeny);
            cardInvite.append(div);
            $('#content-pedding-items').append(cardInvite);
        });
    }).catch((err)=>{
        console.log(err.responseJSON);
    });
}
//Pedding

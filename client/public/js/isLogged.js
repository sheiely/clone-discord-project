if(!getCookie('token')){
    window.location.replace("/login");
}
var myUser = {};
$.ajax({
    method: "POST",
    url: server+"/user/getmyuser",
    headers: {
        "Authorization": getCookie("token")
    }
}).then((result)=>{ 
    myUser = result.user;
    $("#user-option-name").text(myUser.name);

}).catch((err)=>{
   errors(err);
});


//Load Directs
function loadDirects(){
    $.ajax({
        method: "POST",
        url: server+"/direct/getdirects",
        headers: {
            "Authorization": getCookie("token")
        }
    }).then((result)=>{ 
        for(var i = 0; i < result.directs.length; i++){
            $('#direct-messages').append("<div class='card-direct' onclick=\"direct('"+result.directs[i].friend._id+"')\"><div class='direct-perfil'><img src='/images/user.jpg'><p>"+result.directs[i].friend.name+"</p></div><div><img class='direct-delete' src='/images/icons/delete.png'></div></div>");
        }
        
    }).catch((err)=>{
        errors(err);
    });
}
function direct(idFriend){
    window.location.href = "/channels/"+idFriend;
}



//All Friends
async function loadAllFriends(){
    $('#content-all-items').text("");
    var test = $.ajax({
        method: "POST",
        url: server+"/friendship/friends",
        headers: {
            "Authorization": getCookie("token")
        },
    }).then((result)=>{
        $('#qntFriends').text(result.qnt);
        result.friends.forEach((c, i, a)=>{
            var link = $("<a href='/channels/"+c.friend._id+"'></a>");
            //var link = $("<a onclick=\"window.location.replace('http://localhost:3000/channels/"+c.friend._id+"')\"></a>");
            var userCard = $("<div class='userCard'></div>");
            if(c.notifics == 0){
                var imgDiv = $("<div class='userCard-img'><img src='/images/user.jpg'><div class='userCard-StatusBorder'><div id='status-"+c.friend._id+"' class='userCard-status'></div></div></div>");
            }else{
                var imgDiv = $("<div class='userCard-img'><img src='/images/user.jpg'><div class='userCard-StatusBorder'><div id='status-"+c.friend._id+"' class='userCard-status notified'>"+c.notifics+"</div></div></div>");
            }
            
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
        errors(err);
        console.log("foi aki");
    });    
    return await test;
}
function loadPedding(){
    $('#content-pedding-items').text("");
    $.ajax({
        method: "GET",
        url: server+"/friendship/invitesReceived",
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
        errors(err);
    });
}
//Pedding
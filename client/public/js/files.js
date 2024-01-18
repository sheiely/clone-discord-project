const server = "http://54.92.176.48:8081";


function errors(err){
    if(err.status==401){
        console.log("Inautorizado!");
        document.cookie = "token"+'=; Max-Age=-99999999;'; 
        window.location.replace("/error"); 
    }
}

function getCookie(name) {
    let cookie = {};
    
    document.cookie.split(';').forEach(function(el) {
        let [k,v] = el.split('=');
        cookie[k.trim()] = v;
    })
    
    return cookie[name];

}
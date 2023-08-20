const server = "http://54.92.176.48:8081";
function getCookie(name) {
    let cookie = {};
    
    document.cookie.split(';').forEach(function(el) {
        let [k,v] = el.split('=');
        cookie[k.trim()] = v;
    })
    
    return cookie[name];

}
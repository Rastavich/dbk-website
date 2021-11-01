function o(e,n){return fetch(e,{method:"POST",credentials:"include",body:JSON.stringify(n||{}),headers:{"Content-Type":"application/json"}}).then(t=>t.json())}export{o as p};

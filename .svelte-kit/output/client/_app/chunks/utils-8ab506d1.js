function e(e,n){return fetch(e,{method:"POST",credentials:"include",body:JSON.stringify(n||{}),headers:{"Content-Type":"application/json"}}).then((e=>e.json()))}export{e as p};

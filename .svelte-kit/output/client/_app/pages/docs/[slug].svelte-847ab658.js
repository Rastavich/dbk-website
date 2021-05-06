import{S as t,i as s,s as a,V as e,j as n,k as o,e as i,D as r,t as c,m as l,n as d,c as f,a as h,d as p,g as m,b as u,o as g,f as k,E as x,h as $,v,r as w,w as y}from"../../chunks/vendor-6fa84470.js";import{G as j,a as D}from"../../chunks/index-71af2701.js";import{O as b}from"../../chunks/open-graph-17b21669.js";import"../../chunks/stores-1bba30e8.js";function B(t){let s,a,j,D,B,E,S,H,M,T,G,K,N=t[0].title+"",O=e(t[0].content)+"";return s=new b({props:{description:"Documentation for Digital Business Keys to explain core concepts such as DNS, Domain Names, Domain Hosts, Emails and more",title:"Digital Business Keys - "+t[0].title,type:"website"}}),{c(){n(s.$$.fragment),a=o(),j=i("a"),D=r("svg"),B=r("path"),E=c("\n  Go Back"),S=o(),H=i("h1"),M=c(N),T=o(),G=i("div"),this.h()},l(t){l(s.$$.fragment,t),a=d(t),j=f(t,"A",{class:!0,href:!0});var e=h(j);D=f(e,"svg",{fill:!0,stroke:!0,"stroke-linecap":!0,"stroke-linejoin":!0,"stroke-width":!0,class:!0,viewBox:!0},1);var n=h(D);B=f(n,"path",{d:!0},1),h(B).forEach(p),n.forEach(p),E=m(e,"\n  Go Back"),e.forEach(p),S=d(t),H=f(t,"H1",{class:!0});var o=h(H);M=m(o,N),o.forEach(p),T=d(t),G=f(t,"DIV",{}),h(G).forEach(p),this.h()},h(){u(B,"d","M5 13h14M12 6l-7 7l7 6"),u(D,"fill","none"),u(D,"stroke","currentColor"),u(D,"stroke-linecap","round"),u(D,"stroke-linejoin","round"),u(D,"stroke-width","2"),u(D,"class","w-4 h-4 ml-2"),u(D,"viewBox","0 0 24 24"),u(j,"class","mt-3 pb-12 text-indigo-300 inline-flex items-center"),u(j,"href","/docs"),u(H,"class","sm:text-3xl text-2xl font-medium title-font text-gray-50")},m(t,e){g(s,t,e),k(t,a,e),k(t,j,e),x(j,D),x(D,B),x(j,E),k(t,S,e),k(t,H,e),x(H,M),k(t,T,e),k(t,G,e),G.innerHTML=O,K=!0},p(t,[a]){const n={};1&a&&(n.title="Digital Business Keys - "+t[0].title),s.$set(n),(!K||1&a)&&N!==(N=t[0].title+"")&&$(M,N),(!K||1&a)&&O!==(O=e(t[0].content)+"")&&(G.innerHTML=O)},i(t){K||(v(s.$$.fragment,t),K=!0)},o(t){w(s.$$.fragment,t),K=!1},d(t){y(s,t),t&&p(a),t&&p(j),t&&p(S),t&&p(H),t&&p(T),t&&p(G)}}}const E=!0;async function S({page:t,fetch:s}){const a=await s(`${j}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:D})}),e=await a.json();if(e){const s=t.path;return console.log(e.data),e.data.documentations=e.data.documentations.filter((t=>s.includes(t.Slug))),{pagedata:e.data.documentations[0]}}}function H(t,s,a){let{pagedata:e}=s;return t.$$set=t=>{"pagedata"in t&&a(0,e=t.pagedata)},[e]}export default class extends t{constructor(t){super(),s(this,t,H,B,a,{pagedata:0})}}export{S as load,E as prerender};
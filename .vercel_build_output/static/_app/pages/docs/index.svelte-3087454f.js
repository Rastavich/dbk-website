import{S as t,i as e,s as l,T as s,e as a,a as o,F as n,B as r,c,g as i,h,j as d,l as f,k as m,n as u,U as g,t as p,d as x,f as v,m as k,D as b,b as E,V as w}from"../../chunks/vendor-3aa37ad1.js";import{G as D,a as y,t as I}from"../../chunks/snarkdown.es-0fe202fd.js";const{document:T}=g;function S(t,e,l){const s=t.slice();return s[2]=e[l],s}function V(t,e,l){const s=t.slice();return s[2]=e[l],s}function j(t){return{c:u,l:u,m:u,p:u,d:u}}function L(t){let e,l,s,n,r,u,g,b,D,y,I,T,j,L,N,B,C=t[0],z=[];for(let a=0;a<C.length;a+=1)z[a]=H(V(t,C,a));let O=t[0],P=[];for(let a=0;a<O.length;a+=1)P[a]=M(S(t,O,a));return{c(){e=a("div"),l=a("div"),s=a("div"),n=a("ul");for(let t=0;t<z.length;t+=1)z[t].c();r=o(),u=a("div"),g=a("h1"),b=p("Documentation"),D=o(),y=a("div");for(let t=0;t<P.length;t+=1)P[t].c();I=o(),T=a("button"),j=E("svg"),L=E("path"),this.h()},l(t){e=c(t,"DIV",{class:!0});var a=x(e);l=c(a,"DIV",{id:!0,class:!0});var o=x(l);s=c(o,"DIV",{class:!0});var d=x(s);n=c(d,"UL",{class:!0});var f=x(n);for(let e=0;e<z.length;e+=1)z[e].l(f);f.forEach(i),d.forEach(i),o.forEach(i),r=h(a),u=c(a,"DIV",{class:!0});var m=x(u);g=c(m,"H1",{class:!0});var p=x(g);b=v(p,"Documentation"),p.forEach(i),D=h(m),y=c(m,"DIV",{class:!0});var k=x(y);for(let e=0;e<P.length;e+=1)P[e].l(k);k.forEach(i),m.forEach(i),I=h(a),T=c(a,"BUTTON",{class:!0});var E=x(T);j=c(E,"svg",{width:!0,height:!0,fill:!0,class:!0},1);var w=x(j);L=c(w,"path",{d:!0,stroke:!0,"stroke-width":!0,"stroke-linecap":!0,"stroke-linejoin":!0},1),x(L).forEach(i),w.forEach(i),E.forEach(i),a.forEach(i),this.h()},h(){d(n,"class","m-2 p-6 bg-gray-200 rounded  max-h-screen list-reset lg:flex md:flex flex-column md:flex-col text-center md:text-left mt-20 svelte-1kgxi19"),d(s,"class","md:relative mx-auto lg:float-right lg:px-6"),d(l,"id","p-nav"),d(l,"class","hidden lg:flex lg:overflow-auto md:overflow-auto w-full md:w-1/5 bg-gray-900 px-2 text-center fixed md:bottom-10 md:pt-8 md:top-20 md:left-0 h-16 sm:h-full md:h-3/6 md:border-r-4 md:border-gray-600"),d(g,"class","z-0 sm:text-3xl text-2xl font-medium title-font text-gray-50 px-6 "),d(y,"class","container pt-12 px-6"),d(u,"class","w-full md:w-4/5"),d(L,"d","M4 8h16M4 16h16"),d(L,"stroke","currentColor"),d(L,"stroke-width","2"),d(L,"stroke-linecap","round"),d(L,"stroke-linejoin","round"),d(j,"width","24"),d(j,"height","24"),d(j,"fill","none"),d(j,"class","absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform"),d(T,"class","fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden"),d(e,"class","flex md:flex-row-reverse flex-wrap z-10 w-full max-w-8xl")},m(t,a){m(t,e,a),f(e,l),f(l,s),f(s,n);for(let e=0;e<z.length;e+=1)z[e].m(n,null);f(e,r),f(e,u),f(u,g),f(g,b),f(u,D),f(u,y);for(let e=0;e<P.length;e+=1)P[e].m(y,null);f(e,I),f(e,T),f(T,j),f(j,L),N||(B=k(T,"click",A),N=!0)},p(t,e){if(1&e){let l;for(C=t[0],l=0;l<C.length;l+=1){const s=V(t,C,l);z[l]?z[l].p(s,e):(z[l]=H(s),z[l].c(),z[l].m(n,null))}for(;l<z.length;l+=1)z[l].d(1);z.length=C.length}if(1&e){let l;for(O=t[0],l=0;l<O.length;l+=1){const s=S(t,O,l);P[l]?P[l].p(s,e):(P[l]=M(s),P[l].c(),P[l].m(y,null))}for(;l<P.length;l+=1)P[l].d(1);P.length=O.length}},d(t){t&&i(e),w(z,t),w(P,t),N=!1,B()}}}function H(t){let e,l,s,n,r,u,g,E,w,D=t[2].title+"";return{c(){e=a("div"),l=a("li"),s=a("p"),n=a("a"),r=p(D),g=o(),this.h()},l(t){e=c(t,"DIV",{class:!0});var a=x(e);l=c(a,"LI",{class:!0});var o=x(l);s=c(o,"P",{class:!0});var d=x(s);n=c(d,"A",{class:!0,rel:!0,href:!0});var f=x(n);r=v(f,D),f.forEach(i),d.forEach(i),o.forEach(i),g=h(a),a.forEach(i),this.h()},h(){d(n,"class","text-black"),d(n,"rel","prefetch"),d(n,"href",u="docs#"+t[2].Slug),d(s,"class","hover:bg-indigo-500 text-black"),d(l,"class","text-black pb-2"),d(e,"class","lg:flex-none flex w-full md:max-w-xs bg-purple text-black")},m(t,a){m(t,e,a),f(e,l),f(l,s),f(s,n),f(n,r),f(e,g),E||(w=k(n,"click",A),E=!0)},p(t,e){1&e&&D!==(D=t[2].title+"")&&b(r,D),1&e&&u!==(u="docs#"+t[2].Slug)&&d(n,"href",u)},d(t){t&&i(e),E=!1,w()}}}function M(t){let e,l,s,n,r,u,g,k=t[2].title+"",E=I(t[2].content)+"";return{c(){e=a("div"),l=a("h2"),s=p(k),n=o(),r=a("article"),u=o(),this.h()},l(t){e=c(t,"DIV",{id:!0,class:!0});var a=x(e);l=c(a,"H2",{class:!0});var o=x(l);s=v(o,k),o.forEach(i),n=h(a),r=c(a,"ARTICLE",{class:!0}),x(r).forEach(i),u=h(a),a.forEach(i),this.h()},h(){d(l,"class","pb-10 svelte-1kgxi19"),d(r,"class","prose prose-indigo lg:prose-xl"),d(e,"id",g=t[2].Slug),d(e,"class","mb-12 overflow-auto\r\n                    ")},m(t,a){m(t,e,a),f(e,l),f(l,s),f(e,n),f(e,r),r.innerHTML=E,f(e,u)},p(t,l){1&l&&k!==(k=t[2].title+"")&&b(s,k),1&l&&E!==(E=I(t[2].content)+"")&&(r.innerHTML=E),1&l&&g!==(g=t[2].Slug)&&d(e,"id",g)},d(t){t&&i(e)}}}function N(t){let e,l;return{c(){e=a("p"),l=p("...loading")},l(t){e=c(t,"P",{});var s=x(e);l=v(s,"...loading"),s.forEach(i)},m(t,s){m(t,e,s),f(e,l)},p:u,d(t){t&&i(e)}}}function B(t){let e,l,g,p={ctx:t,current:null,token:null,hasCatch:!1,pending:N,then:L,catch:j,value:1};return s(z,p),{c(){e=a("meta"),l=o(),g=n(),p.block.c(),this.h()},l(t){const s=r('[data-svelte="svelte-1bpcqul"]',T.head);e=c(s,"META",{name:!0,content:!0}),s.forEach(i),l=h(t),g=n(),p.block.l(t),this.h()},h(){T.title="Docs",d(e,"name","Description"),d(e,"content","Documentation for Digital Business Keys to explain core concepts like\r\n  DNS, Domain Names, Domain Hosts, Emails and more")},m(t,s){f(T.head,e),m(t,l,s),m(t,g,s),p.block.m(t,p.anchor=s),p.mount=()=>g.parentNode,p.anchor=g},p(e,[l]){{const s=(t=e).slice();s[1]=p.resolved,p.block.p(s,l)}},i:u,o:u,d(t){i(e),t&&i(l),t&&i(g),p.block.d(t),p.token=null,p=null}}}async function C(){let t;try{const e=await fetch(`${D}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:y})});t=await e.json(),t=t.data.documentations}catch(e){console.log(e.message)}return{props:{items:t}}}let z=C();function A(){document.getElementById("p-nav").classList.toggle("hidden")}function O(t,e,l){let{items:s}=e;return t.$$set=t=>{"items"in t&&l(0,s=t.items)},[s]}export default class extends t{constructor(t){super(),e(this,t,O,B,l,{items:0})}}export{C as load};

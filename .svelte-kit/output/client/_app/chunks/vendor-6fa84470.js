function t(){}function n(t,n){for(const e in n)t[e]=n[e];return t}function e(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(e)}function c(t){return"function"==typeof t}function s(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function u(n,e,o){n.$$.on_destroy.push(function(n,...e){if(null==n)return t;const o=n.subscribe(...e);return o.unsubscribe?()=>o.unsubscribe():o}(e,o))}function i(t,n,e,o){if(t){const r=a(t,n,e,o);return t[0](r)}}function a(t,e,o,r){return t[1]&&r?n(o.ctx.slice(),t[1](r(e))):o.ctx}function l(t,n,e,o,r,c,s){const u=function(t,n,e,o){if(t[2]&&o){const r=t[2](o(e));if(void 0===n.dirty)return r;if("object"==typeof r){const t=[],e=Math.max(n.dirty.length,r.length);for(let o=0;o<e;o+=1)t[o]=n.dirty[o]|r[o];return t}return n.dirty|r}return n.dirty}(n,o,r,c);if(u){const r=a(n,e,o,s);t.p(r,u)}}function f(t,n,e=n){return t.set(e),n}function d(t,n){t.appendChild(n)}function h(t,n,e){t.insertBefore(n,e||null)}function p(t){t.parentNode.removeChild(t)}function g(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function m(t){return document.createElement(t)}function $(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function b(t){return document.createTextNode(t)}function y(){return b(" ")}function v(){return b("")}function x(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function _(t){return function(n){return n.preventDefault(),t.call(this,n)}}function k(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function w(t){return Array.from(t.childNodes)}function E(t,n,e,o){for(let r=0;r<t.length;r+=1){const o=t[r];if(o.nodeName===n){let n=0;const c=[];for(;n<o.attributes.length;){const t=o.attributes[n++];e[t.name]||c.push(t.name)}for(let t=0;t<c.length;t++)o.removeAttribute(c[t]);return t.splice(r,1)[0]}}return o?$(n):m(n)}function A(t,n){for(let e=0;e<t.length;e+=1){const o=t[e];if(3===o.nodeType)return o.data=""+n,t.splice(e,1)[0]}return b(n)}function C(t){return A(t," ")}function L(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function j(t,n){t.value=null==n?"":n}function N(t,n,e){t.classList[e?"add":"remove"](n)}function S(t,n=document.body){return Array.from(n.querySelectorAll(t))}let q;function O(t){q=t}function T(){if(!q)throw new Error("Function called outside component initialization");return q}function M(t){T().$$.on_mount.push(t)}function z(t){T().$$.after_update.push(t)}function B(t,n){T().$$.context.set(t,n)}function D(t){return T().$$.context.get(t)}const F=[],I=[],P=[],R=[],G=Promise.resolve();let H=!1;function J(t){P.push(t)}let K=!1;const Q=new Set;function U(){if(!K){K=!0;do{for(let t=0;t<F.length;t+=1){const n=F[t];O(n),V(n.$$)}for(O(null),F.length=0;I.length;)I.pop()();for(let t=0;t<P.length;t+=1){const n=P[t];Q.has(n)||(Q.add(n),n())}P.length=0}while(F.length);for(;R.length;)R.pop()();H=!1,K=!1,Q.clear()}}function V(t){if(null!==t.fragment){t.update(),r(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(J)}}const W=new Set;let X;function Y(){X={r:0,c:[],p:X}}function Z(){X.r||r(X.c),X=X.p}function tt(t,n){t&&t.i&&(W.delete(t),t.i(n))}function nt(t,n,e,o){if(t&&t.o){if(W.has(t))return;W.add(t),X.c.push((()=>{W.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}}function et(t,n){const e=n.token={};function o(t,o,r,c){if(n.token!==e)return;n.resolved=c;let s=n.ctx;void 0!==r&&(s=s.slice(),s[r]=c);const u=t&&(n.current=t)(s);let i=!1;n.block&&(n.blocks?n.blocks.forEach(((t,e)=>{e!==o&&t&&(Y(),nt(t,1,1,(()=>{n.blocks[e]===t&&(n.blocks[e]=null)})),Z())})):n.block.d(1),u.c(),tt(u,1),u.m(n.mount(),n.anchor),i=!0),n.block=u,n.blocks&&(n.blocks[o]=u),i&&U()}if((r=t)&&"object"==typeof r&&"function"==typeof r.then){const e=T();if(t.then((t=>{O(e),o(n.then,1,n.value,t),O(null)}),(t=>{if(O(e),o(n.catch,2,n.error,t),O(null),!n.hasCatch)throw t})),n.current!==n.pending)return o(n.pending,0),!0}else{if(n.current!==n.then)return o(n.then,1,n.value,t),!0;n.resolved=t}var r}function ot(t,n,e){const o=n.slice(),{resolved:r}=t;t.current===t.then&&(o[t.value]=r),t.current===t.catch&&(o[t.error]=r),t.block.p(o,e)}function rt(t,n){const e={},o={},r={$$scope:1};let c=t.length;for(;c--;){const s=t[c],u=n[c];if(u){for(const t in s)t in u||(o[t]=1);for(const t in u)r[t]||(e[t]=u[t],r[t]=1);t[c]=u}else for(const t in s)r[t]=1}for(const s in o)s in e||(e[s]=void 0);return e}function ct(t){return"object"==typeof t&&null!==t?t:{}}function st(t){t&&t.c()}function ut(t,n){t&&t.l(n)}function it(t,n,o,s){const{fragment:u,on_mount:i,on_destroy:a,after_update:l}=t.$$;u&&u.m(n,o),s||J((()=>{const n=i.map(e).filter(c);a?a.push(...n):r(n),t.$$.on_mount=[]})),l.forEach(J)}function at(t,n){const e=t.$$;null!==e.fragment&&(r(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function lt(t,n){-1===t.$$.dirty[0]&&(F.push(t),H||(H=!0,G.then(U)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function ft(n,e,c,s,u,i,a=[-1]){const l=q;O(n);const f=n.$$={fragment:null,ctx:null,props:i,update:t,not_equal:u,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(l?l.$$.context:e.context||[]),callbacks:o(),dirty:a,skip_bound:!1};let d=!1;if(f.ctx=c?c(n,e.props||{},((t,e,...o)=>{const r=o.length?o[0]:e;return f.ctx&&u(f.ctx[t],f.ctx[t]=r)&&(!f.skip_bound&&f.bound[t]&&f.bound[t](r),d&&lt(n,t)),e})):[],f.update(),d=!0,r(f.before_update),f.fragment=!!s&&s(f.ctx),e.target){if(e.hydrate){const t=w(e.target);f.fragment&&f.fragment.l(t),t.forEach(p)}else f.fragment&&f.fragment.c();e.intro&&tt(n.$$.fragment),it(n,e.target,e.anchor,e.customElement),U()}O(l)}class dt{$destroy(){at(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const ht=[];function pt(n,e=t){let o;const r=[];function c(t){if(s(n,t)&&(n=t,o)){const t=!ht.length;for(let e=0;e<r.length;e+=1){const t=r[e];t[1](),ht.push(t,n)}if(t){for(let t=0;t<ht.length;t+=2)ht[t][0](ht[t+1]);ht.length=0}}}return{set:c,update:function(t){c(t(n))},subscribe:function(s,u=t){const i=[s,u];return r.push(i),1===r.length&&(o=e(c)||t),s(n),()=>{const t=r.indexOf(i);-1!==t&&r.splice(t,1),0===r.length&&(o(),o=null)}}}}var gt={"":["<em>","</em>"],_:["<strong>","</strong>"],"*":["<strong>","</strong>"],"~":["<s>","</s>"],"\n":["<br />"]," ":["<br />"],"-":["<hr />"]};function mt(t){return t.replace(RegExp("^"+(t.match(/^(\t| )+/)||"")[0],"gm"),"")}function $t(t){return(t+"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function bt(t,n){var e,o,r,c,s,u=/((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:!\[([^\]]*?)\]\(([^)]+?)\))|(\[)|(\](?:\(([^)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|__|\*\*|[_*]|~~)/gm,i=[],a="",l=n||{},f=0;function d(t){var n=gt[t[1]||""],e=i[i.length-1]==t;return n?n[1]?(e?i.pop():i.push(t),n[0|e]):n[0]:t}function h(){for(var t="";i.length;)t+=d(i[i.length-1]);return t}for(t=t.replace(/^\[(.+?)\]:\s*(.+)$/gm,(function(t,n,e){return l[n.toLowerCase()]=e,""})).replace(/^\n+|\n+$/g,"");r=u.exec(t);)o=t.substring(f,r.index),f=u.lastIndex,e=r[0],o.match(/[^\\](\\\\)*\\$/)||((s=r[3]||r[4])?e='<pre class="code '+(r[4]?"poetry":r[2].toLowerCase())+'"><code'+(r[2]?' class="language-'+r[2].toLowerCase()+'"':"")+">"+mt($t(s).replace(/^\n+|\n+$/g,""))+"</code></pre>":(s=r[6])?(s.match(/\./)&&(r[5]=r[5].replace(/^\d+/gm,"")),c=bt(mt(r[5].replace(/^\s*[>*+.-]/gm,""))),">"==s?s="blockquote":(s=s.match(/\./)?"ol":"ul",c=c.replace(/^(.*)(\n|$)/gm,"<li>$1</li>")),e="<"+s+">"+c+"</"+s+">"):r[8]?e='<img src="'+$t(r[8])+'" alt="'+$t(r[7])+'">':r[10]?(a=a.replace("<a>",'<a href="'+$t(r[11]||l[o.toLowerCase()])+'">'),e=h()+"</a>"):r[9]?e="<a>":r[12]||r[14]?e="<"+(s="h"+(r[14]?r[14].length:r[13]>"="?1:2))+">"+bt(r[12]||r[15],l)+"</"+s+">":r[16]?e="<code>"+$t(r[16])+"</code>":(r[17]||r[1])&&(e=d(r[17]||"--"))),a+=o,a+=e;return(a+t.substring(f)+h()).replace(/^\n+|\n+$/g,"")}export{n as A,Y as B,pt as C,$ as D,d as E,t as F,x as G,r as H,u as I,i as J,l as K,D as L,c as M,N,S as O,f as P,j as Q,_ as R,dt as S,et as T,ot as U,bt as V,g as W,w as a,k as b,E as c,p as d,m as e,h as f,A as g,L as h,ft as i,st as j,y as k,v as l,ut as m,C as n,it as o,rt as p,ct as q,nt as r,s,b as t,Z as u,tt as v,at as w,B as x,z as y,M as z};
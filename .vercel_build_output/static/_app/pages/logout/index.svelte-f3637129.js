import{S as s,i as t,s as o,v as r,K as e,P as n}from"../../chunks/vendor-e8dbe5d3.js";import{s as u}from"../../chunks/stores-e5507ca1.js";import{p as a}from"../../chunks/utils-cf215c6e.js";function c({session:s}){const{user:t}=s;return console.log(t),t?{props:{user:t}}:{status:302,redirect:"/login"}}function i(s,t,o){let c;return r(s,u,(s=>o(0,c=s))),e((async()=>{await a("auth/logout"),n(u,c.user=null,c)})),[]}export default class extends s{constructor(s){super(),t(this,s,i,null,o,{})}}export{c as load};

(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function a(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=a(r);fetch(r.href,o)}})();const x=5e3,D=1*60*1e3,s={api:"//api.github.com",cache:{index:x,article:D},name:"fisker's blog",owner:"fisker",repo:"blog",pageSize:30},H="modulepreload",U=function(e){return"/"+e},$={},R=function(t,a,n){let r=Promise.resolve();if(a&&a.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),c=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));r=Promise.allSettled(a.map(u=>{if(u=U(u),u in $)return;$[u]=!0;const m=u.endsWith(".css"),A=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${A}`))return;const d=document.createElement("link");if(d.rel=m?"stylesheet":H,m||(d.as="script"),d.crossOrigin="",d.href=u,c&&d.setAttribute("nonce",c),document.head.appendChild(d),m)return new Promise((C,O)=>{d.addEventListener("load",C),d.addEventListener("error",()=>O(new Error(`Unable to preload CSS for ${u}`)))})}))}function o(i){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=i,window.dispatchEvent(c),!c.defaultPrevented)throw i}return r.then(i=>{for(const c of i||[])c.status==="rejected"&&o(c.reason);return t().catch(o)})},z={"highlight.js":"11.11.1","json-with-padding":"0.0.2",localforage:"1.10.0",marked:"15.0.7","marked-highlight":"2.2.1","primer-markdown":"4.0.0"},q={dependencies:z},{dependencies:M}=q,L=e=>{const[t,...a]=e.split("/"),n=M[t];if(!n)throw new Error(`'${t}' not installed.`);const r=a.length===0?"":`/${a.join("/")}`;return`https://esm.sh/${t}@${n}${r}`},g=new Map,f=e=>{const t=L(e);return g.has(e)||g.set(e,R(()=>import(`${t}?bundle=true`),[])),g.get(e)},v=async e=>{const t=L(e);document.head.appendChild(Object.assign(document.createElement("link"),{href:t,rel:"stylesheet"}))};let p;function l(e){return p??(p=document.createElement("div")),p.textContent=e,p.textContent}function h(e){return new URLSearchParams(Object.entries(e||{}).filter(([,t])=>t!==void 0)).toString()}const N=function(){let e=[s.api];return s.repoId?e=[...e,"repositories",s.repoId]:e=[...e,"repos",s.owner,s.repo],e.push("issues"),e.join("/")}();async function B(e,t){const a=`${N+e}?${h({...t})}`,{default:n}=await f("json-with-padding");return await n(a)}async function T(e,t){return B(e,t)}let w;async function F(e){if(!w){const[{Marked:t},{markedHighlight:a},{HighlightJS:n}]=await Promise.all(["marked","marked-highlight","highlight.js"].map(r=>f(r)));w=new t(a({async:!0,emptyLangClass:"hljs",langPrefix:"hljs language-",async highlight(r,o,i){const c=n.getLanguage(o)?o:"plaintext";return n.highlight(r,{language:c}).value}}))}return w.parse(e)}const y="articles",G=s.cache.article*1e3,I=()=>f("localforage");async function J(e){const{default:t}=await I(),a=await t.getItem(y),n=a&&a[e];if(!(!n||!n.time||Date.now()-n.time>G))return n}async function K(e){const t=await T(`/${e}`);return P(t),t}async function P(e){const{default:t}=await I();let a=await t.getItem(y);if(a||(a={}),e.data.forEach)for(const n of e.data)a[n.number]={data:n,id:n.number,time:Date.now(),meta:{ETag:e.meta&&e.meta.ETag}};else a[e.data.number]={data:e.data,id:e.data.number,time:Date.now(),meta:{ETag:e.meta&&e.meta.ETag}};return await t.setItem(y,a),e}async function X(e){const t=await J(e)||await K(e);return document.title=t.data.title,Y(t.data)}async function Y(e){let t=`
    <h1 class="article__title">${l(e.title)}</h1>
    <header class="article__author">
      <!-- <img class="article__author-avatar" src="{{ article.user.avatar_url + '&s=40' }}"> -->
      <div>${l(e.created_at)}</div>
    </header>
    <hr />
    <div class="markdown-body">${await F(e.body)}</div>
  `;return e.labels.length!==0&&(t+=`
      <footer>
        ${e.labels.map(a=>`
              <a
                href="#${h({label:a.name})}"
                style="background:${a.color}"
              >
                ${l(a.name)}
              </a>
            `).join("")}
      </footer>
    `),`<article class="article">${t}</article>`}const E="index",V=s.cache.index*1e3,k=()=>f("localforage");async function W(e){const{default:t}=await k(),a=await t.getItem(E);if(!a||a.pageSize!==s.pageSize)return;const n=a.pages[e-1];if(!(!n||!n.time||Date.now()-n.time>V))return n}async function Q(e){const t=await T("",{page:e,per_page:s.pageSize,state:"open",creator:s.owner});return Z(t,e),t}async function Z(e,t){P({data:e.data});const{default:a}=await k();let n=await a.getItem(E);return(!n||n.pageSize!==s.pageSize)&&(n={pages:[],pageSize:s.pageSize}),n.pages[t-1]={meta:{Link:e.meta.Link,ETag:e.meta.ETag},time:Date.now(),data:[]},n.pages[t-1].data=e.data.map(r=>({created_at:r.created_at,title:r.title,number:r.number})),n.time=Date.now(),await a.setItem(E,n),e}async function ee(e){const t=await W(e)||await Q(e);return document.title=s.name,te(t)}function te({data:e,meta:t}){const a=[`<h1>${l(s.name)}</h1>`,"<hr>",`
      <ul class="list">
        ${e.map(n=>`
              <li class="list__item">
                <a class="list__title" href="#${h({id:n.number})}">
                  ${l(n.title)}
                </a>
                <div class="list__meta">
                  #${l(n.number)}
                  posted at
                  <time class="list__time" datetime="${l(n.created_at)}">
                  ${l(n.created_at)}
                  </time>
                </div>
              </li>
            `).join("")}
      </ul>
    `];return t.link&&a.push("<hr>",`
        <nav class="pagination">
          ${t.Link.map(n=>{const r=n[0].match(/[?&]page=(\d+)/)[1];return`
              <a
                href="#${h({page:r})})"
                title="
                ${l(n[1].rel)}"
              >
                ${l(n[1].rel)}
              </a>
            `}).join("")}
        </nav>
      `),a.join("")}const _=document.getElementById("js-app");function b(e){_.innerHTML=e}function S(e){console.error(e),_.innerHTML='error occurred <button onclick="location.reload()">retry</button>'}function ne(){_.innerHTML="loading..."}async function j(){const e=new URLSearchParams(globalThis.location.hash.slice(1));ne();const t=e.get("id");if(t){try{b(await X(t))}catch(r){S(r)}return}if(e.get("label")){window.alert("暂时不支持标签"),globalThis.history.go(-1);return}const n=e.get("page");try{b(await ee(n?Number(n):1))}catch(r){S(r)}}v("primer-markdown/build/build.css");v("highlight.js/styles/default.css");j();globalThis.addEventListener("hashchange",j,!1);

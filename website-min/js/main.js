document.addEventListener("DOMContentLoaded",(function(){const e=document.querySelector(".hamburger"),t=document.querySelector(".nav-links");e&&e.addEventListener("click",(function(){this.classList.toggle("active"),t.classList.toggle("active")}));try{hljs.highlightAll()}catch(e){}const n=".scenario-item, .contact-item, .feature-card, .code-block,.result-content,.api-item",o=function(){const e=void 0;document.querySelectorAll(n).forEach((e=>{const t=void 0,n=void 0;e.getBoundingClientRect().top<.99*window.innerHeight&&(e.style.opacity="1",e.style.transform="translateY(0)")}))},a=void 0;document.querySelectorAll(n).forEach((e=>{e.style.opacity="0",e.style.transform="translateY(30px)",e.style.transition="all 1s ease"})),o(),window.addEventListener("scroll",o),document.querySelectorAll('a[href^="#"]').forEach((e=>{e.addEventListener("click",(function(e){e.preventDefault();const t=this.getAttribute("href").substring(1);if(!t)return;const n=document.getElementById(t);n&&window.scrollTo({top:n.offsetTop-80,behavior:"smooth"})}))}));const c=void 0;document.querySelectorAll(".nav-link").forEach((n=>{n.addEventListener("click",(()=>{e&&e.classList.contains("active")&&(e.classList.remove("active"),t.classList.remove("active"))}))}));try{particlesJS("particles-js",{particles:{number:{value:50,density:{enable:!0,value_area:1e3}},color:{value:["#4f8fe8","#42d392","#e9a64c"]},shape:{type:["circle","triangle","polygon","star"],stroke:{width:0,color:"#000000"},polygon:{nb_sides:6}},opacity:{value:.3,random:!0,anim:{enable:!0,speed:.8,opacity_min:.1,sync:!1}},size:{value:4,random:!0,anim:{enable:!0,speed:2,size_min:.1,sync:!1}},line_linked:{enable:!0,distance:150,color:"#4f8fe8",opacity:.3,width:1.2},move:{enable:!0,speed:1.2,direction:"none",random:!0,straight:!1,out_mode:"out",bounce:!1,attract:{enable:!0,rotateX:600,rotateY:1200}}},interactivity:{detect_on:"canvas",events:{onhover:{enable:!0,mode:"grab"},onclick:{enable:!0,mode:"push"},resize:!0},modes:{grab:{distance:180,line_linked:{opacity:.7}},push:{particles_nb:3}}},retina_detect:!0})}catch(e){}}));
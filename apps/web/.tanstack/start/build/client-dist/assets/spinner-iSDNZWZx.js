import{j as e,a as t}from"./main-DGzO-aDm.js";import{c as r}from"./input-BzNKIY8f.js";import{L as n}from"./loader-circle-BZBrIjE_.js";/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["path",{d:"M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0",key:"1lzz15"}],["path",{d:"M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6",key:"1gnrpi"}],["path",{d:"M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6",key:"u9yy5q"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],c=r("LoaderPinwheel",l);/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]],d=r("Loader",o),h=({className:s,...i})=>e.jsx(d,{className:t("animate-spin",s),...i}),x=({className:s,...i})=>e.jsx(n,{className:t("animate-spin",s),...i}),p=({className:s,...i})=>e.jsx(c,{className:t("animate-spin",s),...i}),m=({className:s,size:i=24,...a})=>e.jsxs("div",{className:"relative",style:{width:i,height:i},children:[e.jsx("div",{className:"absolute inset-0 rotate-180",children:e.jsx(n,{className:t("animate-spin",s,"text-foreground opacity-20"),size:i,...a})}),e.jsx(n,{className:t("relative animate-spin",s),size:i,...a})]}),u=({size:s=28,...i})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",...i,children:[e.jsx("title",{children:"Loading..."}),e.jsx("circle",{cx:"4",cy:"12",r:"2",fill:"currentColor",children:e.jsx("animate",{id:"ellipsis1",begin:"0;ellipsis3.end+0.25s",attributeName:"cy",calcMode:"spline",dur:"0.6s",values:"12;6;12",keySplines:".33,.66,.66,1;.33,0,.66,.33"})}),e.jsx("circle",{cx:"12",cy:"12",r:"2",fill:"currentColor",children:e.jsx("animate",{begin:"ellipsis1.begin+0.1s",attributeName:"cy",calcMode:"spline",dur:"0.6s",values:"12;6;12",keySplines:".33,.66,.66,1;.33,0,.66,.33"})}),e.jsx("circle",{cx:"20",cy:"12",r:"2",fill:"currentColor",children:e.jsx("animate",{id:"ellipsis3",begin:"ellipsis1.begin+0.2s",attributeName:"cy",calcMode:"spline",dur:"0.6s",values:"12;6;12",keySplines:".33,.66,.66,1;.33,0,.66,.33"})})]}),y=({size:s=24,...i})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 44 44",stroke:"currentColor",...i,children:[e.jsx("title",{children:"Loading..."}),e.jsxs("g",{fill:"none",fillRule:"evenodd",strokeWidth:"2",children:[e.jsxs("circle",{cx:"22",cy:"22",r:"1",children:[e.jsx("animate",{attributeName:"r",begin:"0s",dur:"1.8s",values:"1; 20",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.165, 0.84, 0.44, 1",repeatCount:"indefinite"}),e.jsx("animate",{attributeName:"stroke-opacity",begin:"0s",dur:"1.8s",values:"1; 0",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.3, 0.61, 0.355, 1",repeatCount:"indefinite"})]}),e.jsxs("circle",{cx:"22",cy:"22",r:"1",children:[e.jsx("animate",{attributeName:"r",begin:"-0.9s",dur:"1.8s",values:"1; 20",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.165, 0.84, 0.44, 1",repeatCount:"indefinite"}),e.jsx("animate",{attributeName:"stroke-opacity",begin:"-0.9s",dur:"1.8s",values:"1; 0",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.3, 0.61, 0.355, 1",repeatCount:"indefinite"})]})]})]}),j=({size:s=24,...i})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",...i,children:[e.jsx("title",{children:"Loading..."}),e.jsx("style",{children:`
      .spinner-bar {
        animation: spinner-bars-animation .8s linear infinite;
        animation-delay: -.8s;
      }
      .spinner-bars-2 {
        animation-delay: -.65s;
      }
      .spinner-bars-3 {
        animation-delay: -0.5s;
      }
      @keyframes spinner-bars-animation {
        0% {
          y: 1px;
          height: 22px;
        }
        93.75% {
          y: 5px;
          height: 14px;
          opacity: 0.2;
        }
      }
    `}),e.jsx("rect",{className:"spinner-bar",x:"1",y:"1",width:"6",height:"22",fill:"currentColor"}),e.jsx("rect",{className:"spinner-bar spinner-bars-2",x:"9",y:"1",width:"6",height:"22",fill:"currentColor"}),e.jsx("rect",{className:"spinner-bar spinner-bars-3",x:"17",y:"1",width:"6",height:"22",fill:"currentColor"})]}),g=({size:s=24,...i})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 100 100",preserveAspectRatio:"xMidYMid",...i,children:[e.jsx("title",{children:"Loading..."}),e.jsx("path",{fill:"none",stroke:"currentColor",strokeWidth:"10",strokeDasharray:"205.271142578125 51.317785644531256",d:"M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z",strokeLinecap:"round",style:{transform:"scale(0.8)",transformOrigin:"50px 50px"},children:e.jsx("animate",{attributeName:"stroke-dashoffset",repeatCount:"indefinite",dur:"2s",keyTimes:"0;1",values:"0;256.58892822265625"})})]}),f=({variant:s,...i})=>{switch(s){case"circle":return e.jsx(x,{...i});case"pinwheel":return e.jsx(p,{...i});case"circle-filled":return e.jsx(m,{...i});case"ellipsis":return e.jsx(u,{...i});case"ring":return e.jsx(y,{...i});case"bars":return e.jsx(j,{...i});case"infinite":return e.jsx(g,{...i});default:return e.jsx(h,{...i})}};export{f as S};

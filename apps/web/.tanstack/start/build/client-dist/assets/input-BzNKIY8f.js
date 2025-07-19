import{r as s,j as m,a as p}from"./main-DGzO-aDm.js";/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),i=(...r)=>r.filter((e,t,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===t).join(" ").trim();/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var x={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=s.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:o,className:a="",children:n,iconNode:l,...u},d)=>s.createElement("svg",{ref:d,...x,width:e,height:e,stroke:r,strokeWidth:o?Number(t)*24/Number(e):t,className:i("lucide",a),...u},[...l.map(([c,f])=>s.createElement(c,f)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=(r,e)=>{const t=s.forwardRef(({className:o,...a},n)=>s.createElement(g,{ref:n,iconNode:e,className:i(`lucide-${b(r)}`,o),...a}));return t.displayName=`${r}`,t},w=s.forwardRef(({className:r,type:e,...t},o)=>m.jsx("input",{type:e,className:p("flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none  focus:-outline-offset-1 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",r),ref:o,...t}));w.displayName="Input";export{w as I,v as c};

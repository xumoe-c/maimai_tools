import{c,r as m,b as i,d as e,f as n,h as u,w as f,v as g,u as o,j as v,e as x,t as d,o as r}from"./index-D5L_NXMt.js";import{u as h}from"./user-ZINOK4f_.js";/**
 * @license lucide-vue-next v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=c("AlertCircleIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-vue-next v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=c("CheckCircle2Icon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-vue-next v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=c("Loader2Icon",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-vue-next v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=c("LogOutIcon",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]),z={class:"max-w-2xl mx-auto space-y-6"},V={class:"bg-white border-2 border-black shadow-hard rounded-xl p-6"},T={class:"space-y-4"},I={class:"space-y-2"},S={class:"flex gap-2"},B=["disabled"],D={key:1},M={key:0,class:"flex items-center gap-2 text-sm text-maimai-green font-bold p-2 bg-green-50 border-2 border-maimai-green rounded"},N={key:1,class:"flex items-center gap-2 text-sm text-maimai-red font-bold p-2 bg-red-50 border-2 border-maimai-red rounded"},j={key:0,class:"mt-6 pt-6 border-t-2 border-black/10 border-dashed"},A={class:"flex items-center justify-between bg-gray-50 p-3 border-2 border-black rounded"},U={class:"font-black text-lg"},O={class:"text-xs font-bold text-maimai-blue"},F={__name:"SettingsView",setup(R){const s=h(),a=m("idle"),l=m(""),b=async()=>{if(!s.token)return;a.value="idle",l.value="",await s.fetchProfile()?(a.value="success",l.value=`成功加载: ${s.profile.nickname}`):(a.value="error",l.value=s.error||"加载失败")},p=()=>{s.clearUser(),a.value="idle",l.value=""};return(k,t)=>(r(),i("div",z,[t[7]||(t[7]=e("h1",{class:"text-2xl font-black"},"设置 & 数据源",-1)),e("div",V,[t[6]||(t[6]=e("h2",{class:"font-bold text-xl mb-4 flex items-center gap-2"},[e("span",{class:"w-3 h-3 bg-maimai-purple border-2 border-black"}),n(" 数据源配置 (Diving Fish) ")],-1)),e("div",T,[t[5]||(t[5]=e("p",{class:"text-sm text-gray-600"}," 配置您的查分器 Token，以便在各个工具中自动获取您的玩家数据（昵称、Rating、成绩等）。 ",-1)),e("div",I,[t[1]||(t[1]=e("label",{class:"block text-xs font-bold text-gray-500"},"查分器 Token",-1)),e("div",S,[f(e("input",{"onUpdate:modelValue":t[0]||(t[0]=y=>o(s).token=y),type:"password",class:"input-base flex-1",placeholder:"请输入 Token"},null,512),[[g,o(s).token]]),e("button",{onClick:b,disabled:o(s).isLoading||!o(s).token,class:"btn-base bg-black text-white px-4 py-2 flex items-center justify-center min-w-[80px]"},[o(s).isLoading?(r(),v(o(C),{key:0,class:"animate-spin",size:20})):(r(),i("span",D,"验证并保存"))],8,B)]),a.value==="success"?(r(),i("div",M,[x(o(w),{size:16}),n(" "+d(l.value),1)])):u("",!0),a.value==="error"?(r(),i("div",N,[x(o(_),{size:16}),n(" "+d(l.value),1)])):u("",!0),t[2]||(t[2]=e("p",{class:"text-xs text-gray-400 mt-2"}," * Token 将加密存储在本地 Cookie 中，仅用于获取您的公开数据。 ",-1))]),o(s).isAuthenticated?(r(),i("div",j,[t[4]||(t[4]=e("h3",{class:"font-bold text-sm mb-3"},"当前已绑定用户",-1)),e("div",A,[e("div",null,[e("div",U,d(o(s).profile.nickname),1),e("div",O,"Rating: "+d(o(s).profile.rating),1)]),e("button",{onClick:p,class:"text-xs font-bold text-maimai-red hover:underline flex items-center gap-1"},[x(o(L),{size:14}),t[3]||(t[3]=n(" 清除数据 ",-1))])])])):u("",!0)])])]))}};export{F as default};

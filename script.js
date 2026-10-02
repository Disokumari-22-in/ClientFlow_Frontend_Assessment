const initialData=[
{id:1,company:"Nexa Solutions",contact:"Arun Kumar",email:"arun@nexa.example",phone:"+91 98765 12001",source:"Website",service:"Business Website",budget:85000,status:"Qualified",assigned:"Priya",followup:"2026-10-03",description:"Responsive company website with service pages and enquiry form.",notes:"Send portfolio examples."},
{id:2,company:"GreenLeaf Farms",contact:"Meena S",email:"meena@greenleaf.example",phone:"+91 98765 12002",source:"Referral",service:"Agri Dashboard",budget:120000,status:"Proposal Sent",assigned:"Rahul",followup:"2026-10-04",description:"Dashboard to monitor agricultural market information.",notes:"Proposal shared on email."},
{id:3,company:"Orbit Academy",contact:"Vijay R",email:"vijay@orbit.example",phone:"+91 98765 12003",source:"WhatsApp",service:"Learning Portal",budget:150000,status:"New",assigned:"Priya",followup:"2026-10-02",description:"Interactive online learning platform.",notes:"Initial call pending."},
{id:4,company:"BluePeak Retail",contact:"Divya P",email:"divya@bluepeak.example",phone:"+91 98765 12004",source:"Instagram",service:"E-commerce Website",budget:210000,status:"Negotiation",assigned:"Karthik",followup:"2026-10-05",description:"Online store with product catalogue and order management.",notes:"Discuss payment gateway."},
{id:5,company:"UrbanBuild",contact:"Sanjay M",email:"sanjay@urbanbuild.example",phone:"+91 98765 12005",source:"Email",service:"CRM UI",budget:95000,status:"Won",assigned:"Karthik",followup:"2026-10-10",description:"Internal CRM interface for a small operations team.",notes:"Project kickoff scheduled."},
{id:6,company:"PixelCraft Studio",contact:"Anitha K",email:"anitha@pixelcraft.example",phone:"+91 98765 12006",source:"Direct",service:"UI/UX Design",budget:60000,status:"Lost",assigned:"Rahul",followup:"2026-10-08",description:"Landing page redesign and design system.",notes:"Budget mismatch."}
];
let enquiries=JSON.parse(localStorage.getItem("clientflow_data"))||initialData;
let currentView="dashboard";

const $=id=>document.getElementById(id);
const slug=s=>s.toLowerCase().replaceAll(" ","-");
function save(){localStorage.setItem("clientflow_data",JSON.stringify(enquiries))}
function money(n){return n?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n):"—"}
function showToast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2400)}
function formatDate(d){if(!d)return"—";return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
function statusHTML(s){return `<span class="status ${slug(s)}">${s}</span>`}

function render(){
  const titles={dashboard:["Dashboard","Track your client enquiry pipeline."],enquiries:["Enquiries","Search, filter and manage client requests."],followups:["Follow-ups","See upcoming actions that need attention."],settings:["Settings","Manage your local prototype preferences."]};
  $("pageTitle").textContent=titles[currentView][0];$("pageSubtitle").textContent=titles[currentView][1];
  const views={dashboard:renderDashboard,enquiries:renderEnquiries,followups:renderFollowups,settings:renderSettings};
  $("appContent").innerHTML=views[currentView]();
  bindViewEvents();
}
function renderDashboard(){
 const total=enquiries.length,newCount=enquiries.filter(e=>e.status==="New").length,active=enquiries.filter(e=>!["Won","Lost"].includes(e.status)).length,won=enquiries.filter(e=>e.status==="Won").length;
 const due=enquiries.filter(e=>e.followup&&e.followup<=new Date().toISOString().slice(0,10)&&!["Won","Lost"].includes(e.status)).length;
 const statuses=["New","Contacted","Qualified","Proposal Sent","Negotiation","Won","Lost"];
 const counts=statuses.map(s=>enquiries.filter(e=>e.status===s).length),max=Math.max(...counts,1);
 return `<div class="stats-grid">
 <div class="stat-card"><span class="stat-label">Total Enquiries</span><div class="stat-value">${total}</div><div class="stat-note">All captured requests</div></div>
 <div class="stat-card"><span class="stat-label">New Enquiries</span><div class="stat-value">${newCount}</div><div class="stat-note">Need initial action</div></div>
 <div class="stat-card"><span class="stat-label">Active Pipeline</span><div class="stat-value">${active}</div><div class="stat-note">${due} follow-up(s) due</div></div>
 <div class="stat-card"><span class="stat-label">Won</span><div class="stat-value">${won}</div><div class="stat-note">Converted opportunities</div></div>
 </div>
 <div class="dashboard-grid">
  <div class="panel"><div class="panel-title"><h3>Enquiries by status</h3><span>Current pipeline</span></div>
   <div class="bars">${statuses.map((s,i)=>`<div class="bar-wrap"><div class="bar-number">${counts[i]}</div><div class="bar" style="height:${Math.max(counts[i]/max*145,5)}px"></div><div class="bar-label">${s.replace("Proposal Sent","Proposal")}</div></div>`).join("")}</div>
  </div>
  <div class="panel"><div class="panel-title"><h3>Recent enquiries</h3><span>${total} total</span></div>
   <div class="recent-list">${enquiries.slice().reverse().slice(0,5).map(e=>`<div class="recent-item clickable" data-detail="${e.id}"><div><b>${e.company}</b><small>${e.service} · ${e.source}</small></div>${statusHTML(e.status)}</div>`).join("")}</div>
  </div>
 </div>`;
}
function renderEnquiries(){
 return `<div class="panel">
  <div class="toolbar"><input class="search" id="searchInput" placeholder="Search company, contact or service...">
  <select id="statusFilter"><option value="">All Statuses</option>${["New","Contacted","Qualified","Proposal Sent","Negotiation","Won","Lost"].map(x=>`<option>${x}</option>`).join("")}</select>
  <select id="sourceFilter"><option value="">All Sources</option>${["Website","WhatsApp","Instagram","Email","Referral","Direct"].map(x=>`<option>${x}</option>`).join("")}</select>
  <select id="assignedFilter"><option value="">All Assignees</option>${[...new Set(enquiries.map(e=>e.assigned))].map(x=>`<option>${x}</option>`).join("")}</select></div>
  <div id="tableArea"></div>
 </div>`;
}
function renderTable(){
 const q=($("searchInput")?.value||"").toLowerCase(),sf=$("statusFilter")?.value||"",src=$("sourceFilter")?.value||"",as=$("assignedFilter")?.value||"";
 const data=enquiries.filter(e=>(!q||`${e.company} ${e.contact} ${e.service}`.toLowerCase().includes(q))&&(!sf||e.status===sf)&&(!src||e.source===src)&&(!as||e.assigned===as));
 $("tableArea").innerHTML=data.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Client</th><th>Requirement</th><th>Source</th><th>Budget</th><th>Status</th><th>Follow-up</th><th>Action</th></tr></thead><tbody>${data.map(e=>`<tr><td><div class="client-name">${e.company}</div><div class="muted">${e.contact}</div></td><td>${e.service}</td><td>${e.source}</td><td>${money(e.budget)}</td><td>${statusHTML(e.status)}</td><td>${formatDate(e.followup)}</td><td><div class="actions"><button class="icon-btn" data-detail="${e.id}">View</button><button class="icon-btn" data-edit="${e.id}">Edit</button></div></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty"><strong>No enquiries found</strong>Try changing your search or filters, or create a new enquiry.</div>`;
}
function renderFollowups(){
 const today=new Date().toISOString().slice(0,10),items=enquiries.filter(e=>e.followup&&!["Won","Lost"].includes(e.status)).sort((a,b)=>a.followup.localeCompare(b.followup));
 return `<div class="follow-grid">${items.length?items.map(e=>`<div class="follow-card clickable" data-detail="${e.id}"><div class="follow-date">${e.followup<today?"OVERDUE":"UPCOMING"} · ${formatDate(e.followup)}</div><h4>${e.company}</h4><p>${e.service} · ${e.assigned}</p><div style="margin-top:12px">${statusHTML(e.status)}</div></div>`).join(""):`<div class="empty panel" style="grid-column:1/-1">No follow-ups are currently scheduled.</div>`}</div>`;
}
function renderSettings(){
 return `<div class="panel settings-box"><div class="panel-title"><h3>Prototype settings</h3></div><p class="muted" style="font-size:12px;line-height:1.7">This frontend assessment prototype uses realistic mock data stored in your browser's localStorage. No backend or external database is required for Track B.</p><hr><p style="font-size:12px"><b>Data storage:</b> Local browser storage</p><p style="font-size:12px"><b>Responsive:</b> Desktop, tablet and mobile</p><button class="secondary-btn" id="resetData">Reset demo data</button></div>`;
}

function openModal(id=null){
 $("modal").classList.add("show");$("formError").textContent="";
 const e=id?enquiries.find(x=>x.id==id):null;$("modalTitle").textContent=e?"Edit Enquiry":"New Enquiry";$("editId").value=e?.id||"";
 ["company","contact","email","phone","service","budget","assigned","followup","description","notes"].forEach(k=>$(k).value=e?.[k]||"");
 $("source").value=e?.source||"Website";$("status").value=e?.status||"New";
}
function closeModal(){$("modal").classList.remove("show")}
function showDetail(id){
 const e=enquiries.find(x=>x.id==id);if(!e)return;
 $("appContent").innerHTML=`<div class="detail-card"><div class="detail-head"><div><h2>${e.company}</h2><div class="detail-meta">${e.contact} · ${e.email} · ${e.phone}</div></div><div class="page-actions"><button class="secondary-btn" id="backBtn">← Back</button><button class="primary-btn" id="detailEdit">Edit</button></div></div>
 <div style="margin-top:15px">${statusHTML(e.status)}</div>
 <div class="detail-grid"><div class="detail-item"><small>Service / Requirement</small><b>${e.service}</b></div><div class="detail-item"><small>Source</small><b>${e.source}</b></div><div class="detail-item"><small>Estimated Budget</small><b>${money(e.budget)}</b></div><div class="detail-item"><small>Assigned Person</small><b>${e.assigned}</b></div><div class="detail-item"><small>Next Follow-up</small><b>${formatDate(e.followup)}</b></div><div class="detail-item"><small>Contact</small><b>${e.phone}</b></div></div>
 <div class="description-box"><b>Requirement Description</b><br>${e.description||"No description provided."}<br><br><b>Additional Notes</b><br>${e.notes||"No additional notes."}</div></div>`;
 $("backBtn").onclick=render;$("detailEdit").onclick=()=>openModal(e.id);
}
function bindViewEvents(){
 if(currentView==="enquiries"){
  ["searchInput","statusFilter","sourceFilter","assignedFilter"].forEach(id=>$(id).addEventListener("input",renderTable));renderTable();
 }
 document.querySelectorAll("[data-detail]").forEach(b=>b.onclick=()=>showDetail(b.dataset.detail));
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openModal(b.dataset.edit));
 $("resetData")?.addEventListener("click",()=>{if(confirm("Reset all demo data?")){enquiries=initialData.map(x=>({...x}));save();render();showToast("Demo data reset");}});
}
document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>{currentView=b.dataset.view;document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("sidebar").classList.remove("open");render()});
$("addTopBtn").onclick=()=>openModal();
$("closeModal").onclick=closeModal;$("cancelBtn").onclick=closeModal;
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
$("mobileMenu").onclick=()=>$("sidebar").classList.toggle("open");
$("enquiryForm").onsubmit=e=>{
 e.preventDefault();const id=$("editId").value;
 const obj={id:id?Number(id):Date.now(),company:$("company").value.trim(),contact:$("contact").value.trim(),email:$("email").value.trim(),phone:$("phone").value.trim(),source:$("source").value,service:$("service").value.trim(),budget:Number($("budget").value)||0,status:$("status").value,assigned:$("assigned").value.trim(),followup:$("followup").value,description:$("description").value.trim(),notes:$("notes").value.trim()};
 if(!obj.company||!obj.contact||!obj.email||!obj.phone||!obj.service||!obj.assigned){$("formError").textContent="Please complete all required fields.";return}
 if(id){enquiries=enquiries.map(x=>x.id===Number(id)?obj:x);showToast("Enquiry updated successfully");}else{enquiries.push(obj);showToast("Enquiry created successfully");}
 save();closeModal();render();
};
render();
const NAMES = ["Aarav","Ishaan","Diya","Vivaan","Anaya","Kavya","Rohan","Sneha","Arjun","Riya"];
const STATUSES = ["present","absent","late","suspicious"];

function randomStatus() {
  return STATUSES[Math.floor(Math.random()*STATUSES.length)];
}

function makeUsers(n=24){
  return Array.from({length:n}).map((_,i)=>{
    const name = NAMES[i % NAMES.length] + " " + (100+i);
    return {
      id: "U" + (i+1),
      name,
      class: ["A","B","C"][i % 3],
      status: randomStatus(),
      trust: Math.floor(70 + Math.random()*30),
      avatar: `https://i.pravatar.cc/100?img=${(i%70)+1}`,
      history: [
        {t:"08:42", event:"in"},
        {t:"12:15", event:"break"},
        {t:"14:55", event:"out"}
      ]
    };
  });
}

let users = makeUsers();

function userCard(u){
  return `
  <div class="presence-card">
    <img src="${u.avatar}" alt="${u.name}">
    <div class="font-semibold">${u.name}</div>
    <div class="text-sm text-slate-500">${u.class}</div>
    <div class="status ${u.status}">${u.status}</div>
  </div>`;
}

function renderPresence(containerId, filter="all"){
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  users.filter(u=> filter==="all" || u.class===filter)
       .forEach(u=>{
         container.innerHTML += userCard(u);
       });
}

function renderDashboard(){
  document.getElementById("stat-present").innerText = users.filter(u=>u.status==="present").length;
  document.getElementById("stat-absent").innerText = users.filter(u=>u.status==="absent").length;
  document.getElementById("stat-late").innerText = users.filter(u=>u.status==="late").length;

  renderPresence("presencePreview");
  renderLeaderboard("leaderboard", users);
  renderTrustChart("trustChart");
}

function renderLeaderboard(id, list){
  const lb = document.getElementById(id);
  lb.innerHTML = "";
  list.sort((a,b)=>b.trust - a.trust).slice(0,8).forEach((u,i)=>{
    lb.innerHTML += `<div><span>${i+1}. ${u.name}</span><span>${u.trust}</span></div>`;
  });
}

function renderTrustChart(canvasId){
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["High","Medium","Low"],
      datasets: [{
        data: [
          users.filter(u=>u.trust>85).length,
          users.filter(u=>u.trust<=85 && u.trust>=70).length,
          users.filter(u=>u.trust<70).length
        ],
        backgroundColor: ["#16a34a","#f59e0b","#ef4444"]
      }]
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {legend: {position:"bottom"}}
    }
  });
}

function renderTimeline(){
  const t = document.getElementById("timeline");
  t.innerHTML = "";
  users.forEach(u=>{
    t.innerHTML += `
      <div class="timeline-entry">
        <strong>${u.name}</strong> (${u.class}) - ${u.status}<br>
        ${u.history.map(h=> `${h.t} ${h.event}`).join(" • ")}
      </div>`;
  });
}

function renderInsights(){
  const i = document.getElementById("insights");
  i.innerHTML = `
    <div class="card">Most Consistent: ${users.sort((a,b)=>b.trust-a.trust)[0].name}</div>
    <div class="card">Most Suspicious: ${users.find(u=>u.status==="suspicious")?.name || "None"}</div>
    <div class="card">Average Trust: ${Math.round(users.reduce((a,b)=>a+b.trust,0)/users.length)}</div>
  `;
}

/* Navigation */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("nav-dashboard").onclick=()=>{showPage("page-dashboard");renderDashboard();}
document.getElementById("nav-presence").onclick=()=>{showPage("page-presence");renderPresence("presenceMap");}
document.getElementById("nav-timeline").onclick=()=>{showPage("page-timeline");renderTimeline();}
document.getElementById("nav-trust").onclick=()=>{showPage("page-trust");renderTrustChart("trustChartFull");renderLeaderboard("leaderboardFull",users);}
document.getElementById("nav-insights").onclick=()=>{showPage("page-insights");renderInsights();}

/* Init */
renderDashboard();

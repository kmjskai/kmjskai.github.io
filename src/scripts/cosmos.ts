import * as THREE from 'three';
import { gsap } from 'gsap';

type NodeInfo = { id: string; name: string; en: string; type: string; description: string; warm?: boolean };
const data: NodeInfo[] = [
  {id:'ai', name:'人工智能', en:'ARTIFICIAL INTELLIGENCE', type:'研究领域', description:'研究如何让机器完成需要智能的任务。机器学习是其中一条路线，规则、搜索与规划等方法同样属于 AI。'},
  {id:'ml', name:'机器学习', en:'MACHINE LEARNING', type:'学习方法', description:'让模型从数据或经验中学习规律。它既包括神经网络方法，也包括决策树等其他方法。'},
  {id:'nn', name:'神经网络', en:'NEURAL NETWORKS', type:'模型家族', description:'由相互连接的计算单元组成。神经网络可以浅，也可以深；并非所有神经网络学习都称为深度学习。'},
  {id:'dl', name:'深度学习', en:'DEEP LEARNING', type:'学习方法', description:'通过多层表示学习复杂规律，现代实践主要围绕深层神经网络展开。“深”描述表示的多层组合。', warm:true},
  {id:'symbolic', name:'规则与搜索', en:'RULES & SEARCH', type:'其他 AI 方法', description:'利用明确规则、逻辑推理或搜索策略解决问题，是 AI 中常用的方法。'},
  {id:'transformer', name:'Transformer', en:'MODEL ARCHITECTURE', type:'神经网络架构', description:'一种以注意力机制为核心的神经网络架构。它可以用于语言、视觉等任务，并不是语言模型的同义词。', warm:true},
  {id:'llm', name:'大语言模型', en:'LARGE LANGUAGE MODEL', type:'模型', description:'大规模训练的语言模型。许多 LLM 采用 Transformer 架构；“采用一种架构”与“属于某个领域”是不同关系。', warm:true},
  {id:'agent', name:'智能体', en:'AGENT SYSTEM', type:'系统', description:'感知环境并采取行动的系统。它可以使用 LLM、工具和其他决策方法，不是 Transformer 的下一级类别。'},
  {id:'tools', name:'工具', en:'TOOLS', type:'系统能力', description:'搜索、计算、文件操作等外部能力。由系统根据任务调用，结果再反馈给决策过程。'},
  {id:'environment', name:'环境', en:'ENVIRONMENT', type:'行动与反馈发生的地方', description:'智能体在其中观察、行动并获得反馈。环境可以是网页、软件，也可以是物理世界。'},
];
const chapters = [
  {title:'人工智能', intro:'研究如何让机器完成需要智能的任务。', relation:'机器学习、规则、搜索与规划等都是 AI 的研究方法。'},
  {title:'机器学习', intro:'从数据或经验中学习规律，用于预测、分类或决策。', relation:'机器学习属于 AI。神经网络和决策树等是机器学习中使用的模型。'},
  {title:'深度学习', intro:'使用多层表示学习复杂规律，现代实践主要采用深层神经网络。', relation:'神经网络可以浅，也可以深。图中展示了多层神经网络的计算连接。'},
  {title:'Transformer 与 LLM', intro:'Transformer 是神经网络架构。LLM 是大规模训练的语言模型。', relation:'许多 LLM 采用 Transformer 架构；Transformer 也可用于视觉等任务。'},
  {title:'智能体', intro:'感知环境、作出决策并采取行动的系统。', relation:'智能体可以使用 LLM 和工具，也可以采用规则或搜索等方法。'},
];

const desktop = [
  {ai:[-.72,.68],ml:[-.25,.68],nn:[.23,.72],dl:[.70,.45],symbolic:[-.68,-.34],transformer:[-.12,-.27],llm:[.50,-.65],agent:[-.68,-.78]},
  {ai:[-.72,.65],ml:[-.10,.22],nn:[.66,.61],dl:[.68,-.57],symbolic:[-.66,-.62]},
  {nn:[-.65,.60],dl:[.62,-.72]},
  {dl:[-.70,.65],transformer:[-.28,.0],llm:[.65,-.45]},
  {agent:[-.09,.08],llm:[-.68,.69],tools:[.68,.57],environment:[.10,-.78]},
] as Record<string,number[]>[];
const mobile = [
  {ai:[-.52,.84],ml:[.51,.84],nn:[-.52,.27],dl:[.51,.27],symbolic:[-.52,-.32],transformer:[.51,-.32],agent:[-.52,-.92],llm:[.51,-.92]},
  {ai:[-.50,.83],ml:[.40,.26],nn:[-.48,-.32],dl:[.47,-.92],symbolic:[-.50,-.92]},
  {nn:[-.50,.72],dl:[.43,-.90]},
  {dl:[-.50,.80],transformer:[.12,.05],llm:[.48,-.85]},
  {agent:[-.05,.05],llm:[-.48,.80],tools:[.52,.63],environment:[.02,-.88]},
] as Record<string,number[]>[];
const edges = [
  [['ai','ml',0],['ai','symbolic',0],['ml','nn',0],['nn','dl',1],['transformer','llm',1],['agent','llm',1]],
  [['ai','ml',0],['ml','nn',0],['nn','dl',1]],
  [],
  [['dl','transformer',1],['transformer','llm',1]],
  [['agent','llm',1],['agent','tools',1],['agent','environment',1]],
];
const mount = document.querySelector<HTMLElement>('#cosmos')!;
const labels = document.querySelector<HTMLElement>('#labels')!;
const universe = document.querySelector<HTMLElement>('.universe')!;
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reducedQuery.matches;
let current=0, selected:string|null=null, width=0, height=0, frame=0, disposed=false;
let worldWidth=120, worldHeight=80;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-60,60,40,-40,.1,1000);
camera.position.set(0,0,180);
let renderer: THREE.WebGLRenderer | null=null;
try {
  renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
  renderer.setClearColor(0x080f1b,0); mount.appendChild(renderer.domElement);
} catch {
  document.body.classList.add('is-fallback'); document.getElementById('scene-error')!.hidden=false;
}
let seed=42;
function rand(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
const cloudGeometry = new THREE.BufferGeometry();
const starArray=new Float32Array(210*3);
for(let i=0;i<210;i++){starArray[i*3]=(rand()-.5)*185;starArray[i*3+1]=(rand()-.5)*150;starArray[i*3+2]=-30-rand()*100;}
cloudGeometry.setAttribute('position',new THREE.BufferAttribute(starArray,3));
const backgroundStars=new THREE.Points(cloudGeometry,new THREE.PointsMaterial({color:0x7899ae,size:1.0,transparent:true,opacity:.35,depthWrite:false}));
scene.add(backgroundStars);
const nodes = data.map((info,index)=>{
  const group=new THREE.Group(); scene.add(group);
  const geo=new THREE.BufferGeometry(); const vertices=[];
  for(let j=0;j<21;j++){const a=rand()*Math.PI*2,r=2.8+rand()*5.3;vertices.push(Math.cos(a)*r,Math.sin(a)*r*.62,(rand()-.5)*12);}
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  const material=new THREE.PointsMaterial({color:info.warm?0xcab28a:0x9cb9c9,size:1.65,transparent:true,opacity:.52,depthWrite:false});
  group.add(new THREE.Points(geo,material));
  const positions=[];for(let j=0;j<100;j++){const a=j/99*Math.PI*2;positions.push(Math.cos(a)*9,Math.sin(a)*5,-3);}
  const ringMaterial=new THREE.LineBasicMaterial({color:info.warm?0xba9870:0x678ca6,transparent:true,opacity:.13});
  const ring=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(positions,3)),ringMaterial);
  ring.rotation.z=index%2?.4:-.3;group.add(ring);
  const button=document.createElement('button');button.className='node-label'+(info.warm?' warm':'');
  button.setAttribute('aria-pressed','false'); button.setAttribute('aria-label',`${info.name}：${info.type}`);
  const dot=document.createElement('span');dot.className='node-dot';const name=document.createElement('strong');name.textContent=info.name;const en=document.createElement('small');en.textContent=info.en;
  button.append(dot,name,en);labels.appendChild(button);
  button.addEventListener('click',()=>selectNode(info.id));
  return {info,group,button,material,ringMaterial,alpha:0,targetAlpha:0};
});
const edgeGroup=new THREE.Group();scene.add(edgeGroup);
const networkGroup=new THREE.Group();scene.add(networkGroup);
const networkMat=new THREE.LineBasicMaterial({color:0xa7c3d1,transparent:true,opacity:0});
const neuronMat=new THREE.PointsMaterial({color:0xddc39a,size:3.2,transparent:true,opacity:0,depthWrite:false});
let networkLines:THREE.LineSegments|null=null;
let neuronPoints:THREE.Points|null=null;
const edgeMaterials:(THREE.LineBasicMaterial|THREE.LineDashedMaterial)[]=[];

function selectNode(id:string){
  selected=selected===id?null:id;
  const info=data.find(n=>n.id===selected);
  const note=document.getElementById('selected-note')!;note.hidden=!info;
  if(info){document.getElementById('selected-type')!.textContent=info.type;document.getElementById('selected-name')!.textContent=info.name;document.getElementById('selected-description')!.textContent=info.description;if(width<760)note.scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest'});}
  for(const node of nodes){node.button.classList.toggle('selected',node.info.id===selected);node.button.setAttribute('aria-pressed',String(node.info.id===selected));}
}
function clearEdges(){
  while(edgeGroup.children.length){const child=edgeGroup.children[0] as THREE.Line;child.geometry.dispose();(child.material as THREE.Material).dispose();edgeGroup.remove(child);}edgeMaterials.length=0;
}
function drawEdges(){
  clearEdges();
  for(const edge of edges[current]){
    const [from,to,dashed]=edge as [string,string,number];
    const a=nodes.find(n=>n.info.id===from)!,b=nodes.find(n=>n.info.id===to)!;
    const mat=dashed?new THREE.LineDashedMaterial({color:0xc3a77d,transparent:true,opacity:.28,dashSize:.7,gapSize:.6}):new THREE.LineBasicMaterial({color:0x8aabbe,transparent:true,opacity:.24});
    const points=[];
    for(let j=0;j<35;j++){const t=j/34;const point=a.group.position.clone().lerp(b.group.position,t);point.z-=Math.sin(t*Math.PI)*8;points.push(point);}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),mat);line.computeLineDistances();edgeGroup.add(line);edgeMaterials.push(mat);
  }
}
function positionFor(x:number,y:number){return new THREE.Vector3(x*worldWidth*.40,y*worldHeight*.29,-1);}
function buildNetwork(){
  if(networkLines){networkLines.geometry.dispose();networkGroup.remove(networkLines);}
  if(neuronPoints){neuronPoints.geometry.dispose();networkGroup.remove(neuronPoints);}
  const vertices:THREE.Vector3[][]=[];const small=width<760;
  for(let layer=0;layer<5;layer++){
    const column=[];const count=layer===0||layer===4?3:4;
    for(let n=0;n<count;n++){column.push(new THREE.Vector3((layer-2)*worldWidth*(small?.13:.095),(n-(count-1)/2)*worldHeight*.085,-1));}vertices.push(column);
  }
  const segments=[];
  for(let layer=0;layer<4;layer++)for(const a of vertices[layer])for(const b of vertices[layer+1])segments.push(a,b);
  networkLines=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segments),networkMat);networkGroup.add(networkLines);
  neuronPoints=new THREE.Points(new THREE.BufferGeometry().setFromPoints(vertices.flat()),neuronMat);networkGroup.add(neuronPoints);
}
function changeStage(index:number, immediate=false){
  current=Math.max(0,Math.min(4,index));selected=null;document.getElementById('selected-note')!.hidden=true;
  const chapter=chapters[current];
  const pairs:Record<string,string>={'chapter-title':chapter.title,'chapter-intro':chapter.intro,'chapter-relation':chapter.relation,'chapter-counter':`${String(current+1).padStart(2,'0')} / 05`};
  for(const [id,value] of Object.entries(pairs))document.getElementById(id)!.textContent=value;
  document.getElementById('chapter-progress')!.style.width=`${(current+1)*20}%`;
  document.querySelectorAll<HTMLButtonElement>('.step').forEach((button,i)=>{button.classList.toggle('active',i===current);button.setAttribute('aria-pressed',String(i===current));});
  (document.getElementById('prev') as HTMLButtonElement).disabled=current===0;
  document.getElementById('next')!.innerHTML=current===4?'回到全景 <span>↖</span>':'下一步 <span>→</span>';
  const layout=(width<760?mobile:desktop)[current];
  nodes.forEach((node,i)=>{
    gsap.killTweensOf(node.group.position);gsap.killTweensOf(node);
    const coordinates=layout[node.info.id];node.targetAlpha=coordinates?1:0;
    node.button.classList.remove('selected');node.button.setAttribute('aria-pressed','false');node.button.classList.toggle('dimmed',!coordinates);node.button.tabIndex=coordinates?0:-1;node.button.setAttribute('aria-hidden',String(!coordinates));
    node.button.classList.toggle('main-node',current===0?node.info.id==='ai':current===1?node.info.id==='ml':current===2?node.info.id==='dl':current===3?node.info.id==='transformer':node.info.id==='agent');
    if(coordinates){const p=positionFor(coordinates[0],coordinates[1]);
      if(immediate||reduced){node.group.position.copy(p);node.alpha=node.targetAlpha;}
      else{gsap.to(node.group.position,{x:p.x,y:p.y,z:p.z,duration:.32,delay:0,ease:'power2.out',onUpdate:drawEdges});gsap.to(node,{alpha:1,duration:.18,delay:0});}
    } else if(immediate||reduced)node.alpha=0;else gsap.to(node,{alpha:0,duration:.12});
  });
  gsap.killTweensOf(networkMat);gsap.killTweensOf(neuronMat);
  gsap.to(networkMat,{opacity:current===2?.19:0,duration:immediate||reduced?0:.22,delay:0});
  gsap.to(neuronMat,{opacity:current===2?.8:0,duration:immediate||reduced?0:.22,delay:0});
  drawEdges();document.getElementById('announcer')!.textContent=`第 ${current+1} 步，${chapter.title}`;
}
function resize(){
  const box=mount.getBoundingClientRect();width=box.width;height=box.height;
  worldHeight=120*height/width;camera.left=-60;camera.right=60;camera.top=worldHeight/2;camera.bottom=-worldHeight/2;camera.updateProjectionMatrix();
  renderer?.setSize(width,height);buildNetwork();changeStage(current,true);
}
const pointer={x:0,y:0},look={x:0,y:0};
function onPointer(event:PointerEvent){if(event.pointerType==='touch')return;const rect=universe.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/width-.5);pointer.y=((event.clientY-rect.top)/height-.5);}
universe.addEventListener('pointermove',onPointer);universe.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});
const temp=new THREE.Vector3();
let lastTime=0;
function render(time=0){
  if(disposed)return;frame=requestAnimationFrame(render);
  if(time-lastTime<30)return;lastTime=time;
  if(!reduced){look.x+=(pointer.x-look.x)*.025;look.y+=(pointer.y-look.y)*.025;camera.position.x=look.x*1.8;camera.position.y=-look.y*1.2;camera.lookAt(0,0,0);backgroundStars.rotation.z=Math.sin(time*.000018)*.018;}
  for(const node of nodes){
    temp.copy(node.group.position);temp.y-=worldHeight*(width<760?.045:.085);temp.project(camera);
    node.button.style.left=`${(temp.x*.5+.5)*width}px`;node.button.style.top=`${(-temp.y*.5+.5)*height}px`;
    node.button.style.opacity=String(node.alpha);node.button.style.visibility=node.alpha<.02?'hidden':'visible';
    node.material.opacity=node.alpha*.5;node.ringMaterial.opacity=node.alpha*(node.info.id===selected?.27:.12);node.group.visible=node.alpha>.01;
    node.group.position.z=node.targetAlpha&&!reduced?Math.sin(time*.00014+data.indexOf(node.info))*.7:0;
  }
  // Match the node label field's vertical offset while keeping every object together.
  scene.position.y=-worldHeight*(width<760?.045:.085);
  // Scene translation affects world coordinates during rendering; labels use the same offset above.
  renderer?.render(scene,camera);
}
document.querySelectorAll<HTMLButtonElement>('.step').forEach(button=>button.addEventListener('click',()=>changeStage(Number(button.dataset.step))));
document.getElementById('prev')!.addEventListener('click',()=>changeStage(current-1));
document.getElementById('next')!.addEventListener('click',()=>changeStage(current===4?0:current+1));
document.getElementById('overview')!.addEventListener('click',()=>changeStage(0));
document.getElementById('replay')!.addEventListener('click',()=>{
  if(reduced){changeStage(current,true);return;}
  nodes.forEach(node=>{node.group.position.multiplyScalar(.45);node.alpha=0;});changeStage(current);
});
window.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement)?.tagName))return;if(event.key==='ArrowRight'){event.preventDefault();changeStage(Math.min(current+1,4));}if(event.key==='ArrowLeft'){event.preventDefault();changeStage(current-1);}});
const observer=new ResizeObserver(resize);observer.observe(mount);
reducedQuery.addEventListener('change',()=>{reduced=reducedQuery.matches;if(reduced){camera.position.set(0,0,180);camera.lookAt(0,0,0);}changeStage(current,true);});
resize();render();
window.addEventListener('pagehide',(event:PageTransitionEvent)=>{if(event.persisted)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();gsap.killTweensOf(nodes);nodes.forEach(node=>gsap.killTweensOf(node.group.position));gsap.killTweensOf([networkMat,neuronMat]);scene.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();const material=mesh.material;if(Array.isArray(material))material.forEach(m=>m.dispose());else material?.dispose();});renderer?.dispose();});

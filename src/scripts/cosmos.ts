import * as THREE from 'three';
import { gsap } from 'gsap';

import { data, chapters, desktop, mobile, relations, stageRelations, sources } from '../data/ai-map';
import type { Relation } from '../data/ai-map';

const mount = document.querySelector<HTMLElement>('#cosmos')!;
const labels = document.querySelector<HTMLElement>('#labels')!;
const edgeLabels = document.querySelector<HTMLElement>('#edge-labels')!;
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
  button.dataset.concept=info.id;button.setAttribute('aria-pressed','false'); button.setAttribute('aria-label',`${info.name}：${info.type}`);
  const dot=document.createElement('span');dot.className='node-dot';const name=document.createElement('strong');name.textContent=info.name;const en=document.createElement('small');en.textContent=info.type;
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
type ActiveEdge = {relation:Relation; line:THREE.Line; arrow:THREE.LineSegments; label:HTMLSpanElement; midpoint:THREE.Vector3};
const activeEdges:ActiveEdge[]=[];
const nameOf=(id:string)=>data.find(node=>node.id===id)!.name;
function showPanel(){
  const info=data.find(node=>node.id===selected);
  const chapter=chapters[current];
  document.getElementById('concept-type')!.textContent=info?.type||chapter.type;
  document.getElementById('chapter-title')!.textContent=info?.name||chapter.title;
  document.getElementById('chapter-intro')!.textContent=info?.description||chapter.intro;
  document.getElementById('chapter-example')!.textContent=info?.example||chapter.example;
  const list=document.getElementById('chapter-relations')!;list.replaceChildren();
  const related=info?relations.filter(edge=>edge.from===info.id||edge.to===info.id):chapter.summary.map(id=>relations.find(edge=>edge.id===id)!);
  for(const edge of related){
    const item=document.createElement('li');
    const sentence=document.createElement('span');sentence.textContent=`${nameOf(edge.from)} → ${nameOf(edge.to)}`;
    const kind=document.createElement('small');kind.textContent=edge.label;
    item.append(sentence,kind);list.appendChild(item);
  }
  const references=document.getElementById('chapter-sources')!;references.replaceChildren();
  for(const id of info?.sources||chapter.sources){const item=document.createElement('li');const link=document.createElement('a');link.href=sources[id].url;link.textContent=sources[id].title;link.target='_blank';link.rel='noreferrer';item.appendChild(link);references.appendChild(item);}
  (document.getElementById('chapter-reset') as HTMLButtonElement).hidden=!info;
  document.querySelector<HTMLElement>('.source-box')!.removeAttribute('open');
}
function selectNode(id:string){
  selected=selected===id?null:id;
  for(const node of nodes){node.button.classList.toggle('selected',node.info.id===selected);node.button.setAttribute('aria-pressed',String(node.info.id===selected));}
  showPanel();
  document.getElementById('announcer')!.textContent=selected?`${nameOf(selected)}，${data.find(node=>node.id===selected)!.type}`:`第 ${current+1} 步，${chapters[current].title}`;
  if(width<760)document.querySelector('.reading-panel')!.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
}
function clearEdges(){
  for(const edge of activeEdges){for(const line of [edge.line,edge.arrow]){line.geometry.dispose();(line.material as THREE.Material).dispose();edgeGroup.remove(line);}edge.label.remove();}
  activeEdges.length=0;
}
function drawEdges(){
  clearEdges();
  for(const id of stageRelations[current]){
    const relation=relations.find(edge=>edge.id===id)!;
    const color=relation.kind==='class'?0x8aabbe:relation.kind==='flow'?0x94b9ae:0xc3a77d;
    const material=relation.kind==='use'?new THREE.LineDashedMaterial({color,transparent:true,opacity:.40,dashSize:.7,gapSize:.6}):new THREE.LineBasicMaterial({color,transparent:true,opacity:.34});
    const line=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(35*3),3)),material);
    const arrow=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(4*3),3)),new THREE.LineBasicMaterial({color,transparent:true,opacity:.65}));
    line.frustumCulled=false;arrow.frustumCulled=false;
    const label=document.createElement('span');label.className=`edge-label ${relation.kind}`;label.textContent=relation.label;label.title=`${nameOf(relation.from)} → ${nameOf(relation.to)}：${relation.label}`;edgeLabels.appendChild(label);
    edgeGroup.add(line,arrow);activeEdges.push({relation,line,arrow,label,midpoint:new THREE.Vector3()});
  }
  updateEdges();
}
function updateEdges(){
  for(const edge of activeEdges){
    const a=nodes.find(node=>node.info.id===edge.relation.from)!.group.position;
    const b=nodes.find(node=>node.info.id===edge.relation.to)!.group.position;
    const dx=b.x-a.x,dy=b.y-a.y,distance=Math.hypot(dx,dy)||1;
    const bend=edge.relation.bend||0;
    const pointAt=(t:number)=>new THREE.Vector3(a.x+dx*t-dy/distance*Math.sin(Math.PI*t)*bend,a.y+dy*t+dx/distance*Math.sin(Math.PI*t)*bend,-2);
    const points=edge.line.geometry.getAttribute('position') as THREE.BufferAttribute;
    for(let j=0;j<35;j++){const point=pointAt(.16+j/34*.68);points.setXYZ(j,point.x,point.y,point.z);}
    points.needsUpdate=true;edge.line.computeLineDistances();
    const tip=pointAt(.80),tangent=tip.clone().sub(pointAt(.77)).normalize();
    const side=new THREE.Vector3(-tangent.y,tangent.x,0);
    const left=tip.clone().addScaledVector(tangent,-1.4).addScaledVector(side,.65),right=tip.clone().addScaledVector(tangent,-1.4).addScaledVector(side,-.65);
    const arrows=edge.arrow.geometry.getAttribute('position') as THREE.BufferAttribute;
    [left,tip,right,tip].forEach((point,i)=>arrows.setXYZ(i,point.x,point.y,point.z));arrows.needsUpdate=true;
    edge.midpoint.copy(pointAt(.5));edge.midpoint.y-=worldHeight*(width<760?.045:.085);edge.midpoint.project(camera);
    edge.label.style.left=`${(edge.midpoint.x*.5+.5)*width}px`;edge.label.style.top=`${(-edge.midpoint.y*.5+.5)*height}px`;
    const relevant=!selected||edge.relation.from===selected||edge.relation.to===selected;
    edge.label.hidden=current===0?!selected||!relevant:!relevant;
    (edge.line.material as THREE.Material).opacity=relevant?.42:.10;
    (edge.arrow.material as THREE.Material).opacity=relevant?.72:.15;
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
  current=Math.max(0,Math.min(4,index));selected=null;
  const chapter=chapters[current];
  document.getElementById('chapter-counter')!.textContent=`${String(current+1).padStart(2,'0')} / 05`;showPanel();
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
      else{gsap.to(node.group.position,{x:p.x,y:p.y,z:p.z,duration:.32,delay:0,ease:'power2.out'});gsap.to(node,{alpha:1,duration:.18,delay:0});}
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
  updateEdges();renderer?.render(scene,camera);
}
document.querySelectorAll<HTMLButtonElement>('.step').forEach(button=>button.addEventListener('click',()=>changeStage(Number(button.dataset.step))));
document.getElementById('prev')!.addEventListener('click',()=>changeStage(current-1));
document.getElementById('next')!.addEventListener('click',()=>changeStage(current===4?0:current+1));
document.getElementById('chapter-reset')!.addEventListener('click',()=>{if(selected)selectNode(selected);});
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

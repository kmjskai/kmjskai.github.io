const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const hero=document.querySelector<HTMLElement>('.hero');
if(hero){
 hero.addEventListener('pointermove',(event:PointerEvent)=>{if(reducedMotion.matches||event.pointerType==='touch')return;const rect=hero.getBoundingClientRect();hero.style.setProperty('--hero-x',`${((event.clientX-rect.left)/rect.width-.5)*28}px`);hero.style.setProperty('--hero-y',`${((event.clientY-rect.top)/rect.height-.5)*20}px`);});
 hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--hero-x','0px');hero.style.setProperty('--hero-y','0px');});
}
for(const section of document.querySelectorAll<HTMLElement>('.gallery-section')){
 const stage=section.querySelector<HTMLElement>('[data-gallery]')!;
 const source=section.querySelector<HTMLElement>('.gallery-source')!;
 const plane=section.querySelector<HTMLElement>('.gallery-plane')!;
 const entries=[...source.querySelectorAll<HTMLAnchorElement>('a')];
 const orders=[[0,1,2,3],[2,0,3,1],[1,3,0,2]];
 for(const order of orders){
  const row=document.createElement('div');row.className='gallery-row';
  for(let copy=0;copy<3;copy++){
   const set=document.createElement('div');set.className='gallery-set';
   for(const index of order){const original=entries[index];const link=document.createElement('a');link.className='gallery-tile';link.href=original.href;link.tabIndex=-1;
    if(original.target){link.target=original.target;link.rel='noreferrer';}
    const image=document.createElement('img');image.src=original.dataset.cover!;image.alt='';image.width=780;image.height=500;image.draggable=false;
    const arrow=document.createElement('span');arrow.className='tile-arrow';arrow.textContent='↗';
    const card=document.createElement('span');card.className='gallery-card';card.append(image,arrow);link.appendChild(card);set.appendChild(link);
   }row.appendChild(set);
  }plane.appendChild(row);
 }
 const pause=section.querySelector<HTMLButtonElement>('.gallery-pause')!;
 pause.addEventListener('click',()=>{const paused=section.classList.toggle('is-paused');pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'播放画廊动画':'暂停画廊动画');pause.textContent=paused?'▷':'Ⅱ';});
 section.querySelector('[data-gallery-prev]')!.addEventListener('click',()=>source.scrollBy({left:-source.clientWidth*.9,behavior:reducedMotion.matches?'instant':'smooth'}));
 section.querySelector('[data-gallery-next]')!.addEventListener('click',()=>source.scrollBy({left:source.clientWidth*.9,behavior:reducedMotion.matches?'instant':'smooth'}));
 const observer=new IntersectionObserver(([entry])=>{section.classList.toggle('is-offscreen',!entry.isIntersecting);});observer.observe(stage);
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

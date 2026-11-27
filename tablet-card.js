/* Small copy stays vector-sharp in previews and is redrawn at 3× for exports. */
let tabletFlowerCardSerial=0;
window.createTabletFlowerCardSVG = (src, capturedStage) => {
 const ns = 'http://www.w3.org/2000/svg';
 // A captured card has a data URL, so its stage must come from the capture,
 // never from accidental text inside a base64 image.
 const stage = Math.max(0, Math.min(5, Number.isInteger(capturedStage) ? capturedStage : Number(src.match(/card0?([1-6])\.png/i)?.[1] || 1) - 1));
 const copy = [
  ['새로운 감정과 설렘이 조금씩 피어나는 하루였어요.', ['감정이 지쳐 잠시 멈춰 있는 상태', '회복과 휴식이 필요한 조용한 순간']],
  ['새로운 감정과 설렘이 조금씩 피어나는 하루였어요.', ['설렘이나 기대처럼 작은 변화가', '피어나기 시작한 순간']],
  ['기분과 에너지가 자연스럽게 퍼져나간 하루였어요.', ['기분과 활력이 일상 속으로 퍼져나가는 순간']],
  ['평소보다 기분이 좋은 하루였어요.', ['에너지가 가장 높고', '감정이 풍성하게 피어난 상태']],
  ['감정의 에너지가 조금씩 지쳐가던 하루였어요.', ['감정의 에너지가 서서히 내려오는 상태', '피로와 감정 소모가 천천히 쌓여가는 순간']],
  ['혼자만의 회복과 휴식이 필요했던 하루였어요.', ['감정의 에너지가 서서히 내려오는 상태', '피로와 감정 소모가 천천히 쌓여가는 순간']]
 ][stage];
 const svg = document.createElementNS(ns, 'svg');
 svg.setAttribute('viewBox', '0 0 558 766');
 svg.setAttribute('width', '558');
 svg.setAttribute('height', '766');
 svg.setAttribute('role', 'img');
 svg.setAttribute('aria-label', '사진에 담긴 표정의 꽃 카드');
 const id = `card-small-copy-mask-${++tabletFlowerCardSerial}`;
 const descriptionX = stage === 0 ? 184 : 140;
 svg.innerHTML = `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="558" height="766"><rect width="558" height="766" fill="white"/><rect x="400" y="421" width="115" height="22" fill="black"/><rect x="326" y="451" width="215" height="21" fill="black"/><rect x="${descriptionX - 4}" y="577" width="${399 - descriptionX}" height="42" fill="black"/><rect x="408" y="577" width="117" height="33" fill="black"/><rect x="30" y="708" width="500" height="26" fill="black"/></mask></defs>`;
 const art = document.createElementNS(ns, 'image');
 art.setAttribute('href', src);
 art.setAttribute('width', '558');
 art.setAttribute('height', '766');
 art.setAttribute('mask', `url(#${id})`);
 svg.append(art);
 const label = (value, x, y, size, anchor = 'start', active = false) => {
  const text = document.createElementNS(ns, 'text');
  Object.entries({x, y, fill: active ? '#c49ce8' : '#f4f2f7', 'font-family': 'Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif', 'font-size': size, 'font-weight': active ? 600 : 400, 'text-anchor': anchor}).forEach(([key, value]) => text.setAttribute(key, String(value)));
  text.textContent = value;
  svg.append(text);
  return text;
 };
 // Keep the flower icon and pill geometry; replace its baked-in mood label.
 const moodBackground=document.createElementNS(ns,'rect');
 Object.entries({x:400,y:421,width:115,height:22,fill:'#14151b'}).forEach(([key,value])=>moodBackground.setAttribute(key,String(value)));
 svg.append(moodBackground);
 const moods=['EXCITED DAY','EXCITED DAY','BRIGHT DAY','GOOD DAY','LOW DAY','QUIET DAY'];
 const mood=label(moods[stage],404,438,16);
 mood.setAttribute('fill','#c4b2e8');
 mood.setAttribute('font-weight','500');
 const measure=document.createElement('canvas').getContext('2d');
 measure.font='12px Arial, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
 const captionSize=Math.min(12,12*206/measure.measureText(copy[0]).width);
 label(copy[0], 430, 465, captionSize, 'middle');
 copy[1].forEach((line, index) => label(line, descriptionX, (copy[1].length === 1 ? 597 : 590) + index * 15, 12));
 const detailOutline = document.createElementNS(ns, 'rect');
 Object.entries({x: 411, y: 580, width: 111, height: 27, rx: 13.5, fill: '#14151b', stroke: '#d9d9df', 'stroke-width': 1}).forEach(([key, value]) => detailOutline.setAttribute(key, String(value)));
 svg.append(detailOutline);
 label('자세히 보기', 466.5, 598, 12, 'middle');
 ['봉오리', '발아', '개화', '만개', '낙화', '시듦'].forEach((name, index) => label(name, 58 + index * 88, 725, 13, 'middle', index === stage));
 return svg;
};
window.renderTabletFlowerCard = (host, src, stage) => {
 const svg=window.createTabletFlowerCardSVG(src,stage);
 host.replaceChildren(svg);
 return svg;
};
window.exportTabletFlowerCard = async (src, stage) => {
 // The artwork is already an embedded PNG; no external resources in this SVG.
 const svg=window.createTabletFlowerCardSVG(src,stage);
 svg.setAttribute('width','1674');svg.setAttribute('height','2298');
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
 try {
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=1674;canvas.height=2298;
  canvas.getContext('2d').drawImage(image,0,0);
  return canvas.toDataURL('image/png');
 } finally {URL.revokeObjectURL(url);}
};

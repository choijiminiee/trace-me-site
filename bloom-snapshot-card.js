/* Keep the Daily Emotion Card layout, with the exact flower frozen at capture. */
window.createBloomSnapshotCard = async moment => {
 const frame=Math.max(1,Math.min(351,Math.round(Number(moment.flowerFrame)||1)));
 const stage=[25,60,115,195,300].filter(boundary=>frame>=boundary).length;
 const names=['봉오리','발아','개화','만개','낙화','시듦'];
 const descriptions=['꽃잎이 오므려진 봉오리의 모습이에요. 작은 표정 변화부터 꽃이 천천히 움직이기 시작해요.','봉오리가 조금씩 열리고 있어요. 표정의 변화가 꽃잎의 움직임으로 드러나는 단계예요.','꽃잎이 펼쳐지는 개화 단계예요. 표정의 변화에 따라 꽃의 형태가 더 풍성해져요.','꽃잎이 활짝 펼쳐진 순간이에요. 개화 과정에서 가장 풍성한 꽃의 모습을 담았어요.','활짝 핀 꽃잎이 아래로 흐르는 단계예요. 꽃이 피고 지는 과정의 다음 모습을 보여줘요.','꽃이 피고 지는 과정의 마지막 모습이에요. 표정을 바꾸면 다시 다른 단계의 꽃을 만나볼 수 있어요.'];
 const card=new Image();
 card.src=`public/flower-cards/card${String(stage+1).padStart(2,'0')}.png`;
 const flower=new Image();
 flower.src=moment.flowerSnapshot || moment.flowerSrc || (frame===351?'public/flower-videos/hero-final-frame.png':`public/hero-sequence/frame-${String(frame).padStart(3,'0')}.jpg`);
 await Promise.all([card.decode(),flower.decode()]);
 // Measure the flower without its black margins, then fit the frozen pose
 // into the existing artwork window without changing its proportions.
 const measure=document.createElement('canvas');
 measure.width=flower.naturalWidth;measure.height=flower.naturalHeight;
 const measureContext=measure.getContext('2d',{willReadFrequently:true});
 measureContext.drawImage(flower,0,0);
 const pixels=measureContext.getImageData(0,0,measure.width,measure.height);
 const {data}=pixels;
 let left=measure.width,top=measure.height,right=-1,bottom=-1;
 for(let y=0;y<measure.height;y++)for(let x=0;x<measure.width;x++){
  const i=(y*measure.width+x)*4;
  if(data[i+3]>128 && Math.max(data[i],data[i+1],data[i+2])>32){
   left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  // The sequence has a black matte, while the card artwork is transparent.
  // Remove the matte without changing the flower's appearance over black.
  const alpha=Math.max(data[i],data[i+1],data[i+2])/255;
  if(alpha){data[i]/=alpha;data[i+1]/=alpha;data[i+2]/=alpha;}
  data[i+3]*=alpha;
 }
 if(right<left || bottom<top)throw new Error('Captured flower is empty');
 measureContext.putImageData(pixels,0,0);
 const padding=Math.ceil(Math.max(right-left+1,bottom-top+1)*.04);
 left=Math.max(0,left-padding);top=Math.max(0,top-padding);
 right=Math.min(measure.width-1,right+padding);bottom=Math.min(measure.height-1,bottom+padding);
 const canvas=document.createElement('canvas');
 canvas.width=card.naturalWidth;canvas.height=card.naturalHeight;
 const ctx=canvas.getContext('2d');
 ctx.drawImage(card,0,0);
 // All six originals share this 558 × 766 layout. Preserve the title, frame,
 // score and spectrum; remove the preset flower before placing the snapshot.
 ctx.save();ctx.scale(canvas.width/558,canvas.height/766);
 ctx.clearRect(8,64,542,324);
 const width=right-left+1,height=bottom-top+1;
 const scale=Math.min(438/width,292/height);
 ctx.drawImage(measure,left,top,width,height,279-width*scale/2,226-height*scale/2,width*scale,height*scale);
 ctx.restore();
 const image=await window.exportTabletFlowerCard(canvas.toDataURL('image/png'),stage);
 return {image,stage,name:names[stage],description:descriptions[stage]};
};

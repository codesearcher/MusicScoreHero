 //import {Vex} from './vexflow-min.js'
 //$.getScript("vexflow-min.js");
 //$.holdReady(true);
 //$.getScript("vexflow-min.js", function() {
 //    $.holdReady(false);
 //});
  
 var context;
 var stave;
 var VF = Vex.Flow;
 var msize=400; //measure size
 let canvasH=200;//measure height
 
 //setTimeout("console.log('iniciando carregamento do mostrador de partituras');", 1500); //pausa 1 seg
 function desenhaPartLinhas(x,y,width){ //desenha linhas na partitura
  /** Creating a new stave of width 400 at position x10, y40 on the canvas. **/
  stave = new VF.Stave(x, y, width);
  stave.addClef("treble").addTimeSignature("4/4");  // Add a clef and time signature.
  stave.addKeySignature('C');
  //Set the context of the stave our previous exposed context and execute the method draw !
  stave.setContext(context).draw(); 
 }
 
 function desenhaPart(divname){
  // We created an object to store the information about the workspace
  var WorkspaceInformation = {
    div: document.getElementById(divname), // The <div> where you'll work
    canvasWidth: msize+100, canvasHeight: canvasH  }; // Vex creates a canvas with these dimensions
  
  var renderer = new VF.Renderer( // Create a renderer with Canvas
    WorkspaceInformation.div,    VF.Renderer.Backends.SVG );

  // Use the renderer to give the dimensions to the canvas
  renderer.resize(WorkspaceInformation.canvasWidth, WorkspaceInformation.canvasHeight);
  window.context = renderer.getContext();  // Expose the context of the renderer
  window.context.setFont("Arial", 10, "").setBackgroundFillStyle("#dfFFcf");// font and background color
  desenhaPartLinhas(10,40,msize);
 }
 
 function fgcolor(){ //changes
  fgcolor=document.getElementById('fgcolor').value;
  console.log('cor escolhida',fgcolor);
  document.getElementById('configs').style.background=fgcolor;
  document.getElementById('statusbar').style.background=fgcolor;
 }
 
 //let voice = []; //needs to be created at midi-parser module time
 VF.setIgnoreTicks=true;
 VF.shouldIgnoreTicks=true;
 
 function desenhaNota(clef,k,n,Voice){  //desenha as primeiras notas clef,[[keys],dur]
  //desenhaNota('treble',[ ['D#/4'],'q'],[['c/4','e/4','g/4'],'q'],[['b/4'],'qr'],[['c/4", "e/4", "g/4'],'h'] ]);
  console.log('keys:'+ k[0][0]+', duration: '+k[0][1]);
  dot=k[0][1].substring(k[0][1].length-1); //has the note a 'd' t extend its duration?
  var notes=[];
  for(i=0;i<n;i++){
   dot=k[i][1].substring(k[i][1].length-1);
   if(dot=='d'){ 
    notes.push( new VF.StaveNote({clef: clef,keys:k[i][0],duration: k[i][1] }).addDotToAll() ); 
   }else{
     notes.push( new VF.StaveNote({clef: clef,keys:k[i][0],duration: k[i][1] }));
    }   
  }
  Voice.setStrict(false); //disable tick count
  Voice.addTickables(notes);  // add above notes
  VF.Accidental.applyAccidentals([Voice],'C'); //adds # and flat sign
  // Format and justify the notes to 400 pixels.
  var formatter = new VF.Formatter().joinVoices([Voice]).format([Voice], msize);
  Voice.draw(context, stave); // Render voice
 }
 
 function proxNota(clef,keys,duration,divname){ //apaga a primeira nota e adiciona a nota indicada no final do compasso
  $('#'+divname).empty(); //the only line that requires jquery lib
  desenhaPart(divname);
  notes=voice.getTickables();//pega lista de notas
  notes.shift(); //remove o primeiro elemento
  notes.push(new VF.StaveNote({clef: clef, keys: keys, duration: duration }));
  console.log(notes); 
  voice = new VF.Voice({num_beats: 4,  beat_value: 4});  //Create a voice in 4/4
  console.log(VF.shouldIgnoreTicks);
  voice.setStrict(false);
  voice.addTickables(notes); // a nova matriz esta certa
  var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);
  voice.draw(context, stave); // Render voice
 }
 function PrimNota(div_elem){
  div=document.getElementById(div_elem);
  n=window.voice[0].getTickables()[0];
  let pol=document.getElementById('polyphony').value; //pega polifonia
  nota=vexnote2webmidi(maisAguda(n.keys,pol)[0]);// n.keys[maisAguda(n.keys)]);
  tipo=n.noteType;
  if (tipo=='n'){  div.innerHTML='<br>A primeira nota é '+nota;}
  else if(tipo=='r'){div.innerHTML='<br>pausa com duração de '+vexduration2str(n.duration);}
 }
 function vexnote2webmidi(s){  // c#/4 -> C#4
  return s.toUpperCase().replaceAll('/','');
 }
 function vexduration2str(s){
  r='';
  if (s=='w'){ r='semibreve';} else
  if (s=='h'){ r='mínima';} else
  if (s=='q'){ r='seminima';} else
  if (s=='8'){ r='colcheia';} else
  if (s=='16'){ r='semicolcheia';} else
  if (s=='32'){ r='fusa';} else
  if (s=='64'){ r='semifusa';} else
  if (s=='128'){ r='quartifusa';}
  return r;
 }
 function maisAguda(arr,v){  //retona a nota mais aguda de um array de notas
  a=0;
  oldmidival=0;
  r=[];
  notes=['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
  quant=arr.length; //quantidade de notas
  if(v>quant){v=quant;}
  tmp3=[];//array com os valores midi/numericos
  for(var i=0;i<quant;i++){//percorre todas as notas
   n_=arr[i].toLowerCase();
   slp=n_.lastIndexOf('/');//slash position
   octave=(parseInt(n_.substring(slp+1))+1);
   noteval=notes.indexOf(n_.substring(0,slp));
   midival=octave*12+noteval;
   tmp3.push([midival,n_]);
   //if (midival>=oldmidival){r=i;oldmidival=midival;} //selects the major value
  }
  tmp4=tmp3.sort(sortFunction);
  //console.table(tmp.sort(sortFunction));
  for(var i=0;i< v;i++){//percorre todas as notas
	r.push(tmp4[i][1]);
  }
  //if (r.length==1){ r=r[0];}//se tiver uma nota so, retorna valor e nao uma matriz
  console.log('valor de r: ',r);
  return r; 
 }

 function sortFunction(a, b) { //ordena de forma decrescente um array 2d pela 1a coluna
  if (a[0] === b[0]) {
    return 0;
  }else {
    return (a[0] > b[0]) ? -1 : 1; //se quisermos crescente é so mudar para '<'
  }
}

//  end of vexFlow interface
//----------------------------------------------------------------------
// start of this module own code:
 function test(){   alert('test from msh-lib');  }
 function Create2DArray(rows) {
  var arr = [];               
  for (var i=0;i<rows;i++) {  
     arr[i] = [];// The number of columns is not important, 'cause it is
  }              //not required to specify the size of an array before using it.
  return arr;
 } 
 
 function searchInArrayCol(arr,col,s){ //retorna um array com todos
  tmp=[];    //os indices das ocorrencias de s em arr na coluna col
  for(i=0;i<arr.length;i++){
   if(arr[i][col]==s){  tmp.push(i);  }
  }
  return(tmp);
 }

  function midi2notation(m){ //converts midi # to vexflow music notation
   notes=['c','c#','d','d#','e','f','f#','g','g#','a','a#','b'];
   n=notes[m % 12]; //note
   o=Math.floor(m/12);//octave
   return n+'/'+o;
  }

  function ticks2duration(time,ticks){ //convert midi-parser ticks into vexflow duration: 360=>qd, when ticks=480
   mintb=[6,4,3,2,1.5,1,0.75,0.5,0.375,0.25,0.1875,0.125];
   tb=[[6,'wd',''],[4,'w','whole/semibreve'],[3,'hd',''],[2,'h','half/minima'],[1.5,'qd',''],[1,'q','quarter/seminima'],[0.75,'8d',''],[0.5,'8','eight/colcheia'],[0.375,'16d',''],[0.25,'16','sixteenth/semicolcheia'],[0.1875,'32d',''],[0.125,'32','thirty-second/fusa'],[0.09375,'64d',''],[0.0625,'64','sixty-fourth/semifusa'],[0.046875,'128d',''],[0.03125,'128','128th/quartifusa']]
   tableit=ticks/32;
   r=closest(time/ticks,mintb);
   r=tb[r][1];
   return r
  }
  
  function closest (num, arr) {  //returns the position of 
   var curr = arr[0]; //nearest number to num in an array
   var diff = Math.abs (num - curr);
   for (var val = 0; val < arr.length; val++) {
    var newdiff = Math.abs (num - arr[val]);
    if (newdiff < diff) {
     diff = newdiff;
     curr = arr[val];
    }
   }
   return arr.indexOf(curr,1);
  }

  function json2array(m){  //converts json output from midi-parser into an array
   // most simplified [time,clef,keys,duration(in ticks)]
   myms   =Create2DArray(m.tracks);
   for(tr=0;tr<m.tracks;tr++){
    let time=0;
    let seq=-1;
    let delta_used=false;
    for(ev=0;ev<m.track[tr].event.length;ev++){
     n=m.track[tr].event[ev];    
     delta=n.deltaTime;
     if(delta>0){  time+=delta;delta_used=false; }    //aumenta tempo/time
     if (n.type=='9' && n.data[1]>'0'){
      //mynotes[tr].push(m.track[tr].event[ev]);
      if(delta>0 || delta_used==false){seq+=1;delta_used=true;}
      myms[tr].push([time,'treble',n.data[0],0,seq]);
     }else if ((n.type=='9' && n.data[1]=='0') || (n.type=='8')){//ver se eh fim da nota
      //if(delta>0){time+=delta;}
      //if(delta>0 || delta_used==false){seq+=1;delta_used=true;}
      pos=searchInArrayCol(myms[tr],2,n.data[0]).at(-1);  //last item
      myms[tr][pos][3]=time-myms[tr][pos][0]; //calculates the time of note (duration) in ticks
      //console.log('o evento '+mn+' em [mynotes] fecha o evento '+pos+' em [myms].');
     }else{//console.log('evento desconsiderado '+ev);
     }
    } //end for ev
   } //end for tr
   //clean/ eliminate 'empty' tracks - that which originally contains only metadata
   console.log(myms[0].length);
   const arr = ['one', null, 'two', null, 'three', null];
   let results = [];
   myms.forEach(element => {
    if ((element !== null) &&(element.length>0)) {
     results.push(element);
    }
   });
   return results;
  }

  function findNoteBySequence(ar_,seq){
   r=ar_.length-1;//result
   for(i=0;i<ar_.length;i++){  //selecionar todas as notas...
    if(ar_[i][4]>=seq){   //com o valor sequencial de 0 a seq
     r=i;
     break;
    }
   }    
   return r;
  }
  
  function scoreSeqStartEnd(ar,sta,end,ticks){ //selects part of the score array
   ant=-1;  //(ar from json2array function) from an initial sequence (start)
   tmp=[];  // to a final sequence (end)
   tmp.push();   
   tmp2=[];
   tmp2.push();//cria uma posicao vazia
   let c2=-1;
   for(j=sta;j<=end;j++){
    notedur =ticks2duration(ar[j][3], ticks); //deltatimes em duração do VexFlow
    if(ar[j][4]==ant){
     tmp2[c2].push( midi2notation(ar[j][2]) ) ; //grava da 2a a n notas
    }else{
      ant=ar[j][4];
      c2+=1;
      tmp2.push( [ midi2notation(ar[j][2]) ]); //grava a 1a nota
      tmp.push(notedur);
    }
   }   
   partial_score=[];partial_score.push();
   
   for(j=0;j<tmp.length;j++){
    //partial_score.push([ tmp2[j],tmp[j] ]);
    let pol=document.getElementById('polyphony').value; //pega polifonia
    //console.log('+agudas',maisAguda(tmp2[j],pol));
    partial_score.push([ maisAguda(tmp2[j],pol) ,tmp[j] ]);
    //nota=vexnote2webmidi(maisAguda(n.keys,pol)[0]);// n.keys[maisAguda(n.keys)]);
   }  
   return partial_score; //read to draw in VexFlow
  }
  
  function showElement(elem) { //show and hide configs div
   var el = document.getElementById(elem);
   if (el.style.display === "none") {
    el.style.display = "block";
   } else {
    el.style.display = "none";
   }
  }
  
  function listStaves(m,sel_el){
   let el = document.getElementById(sel_el);
   let def='';
   el.innerHTML='';//clear all options listed before - when you are choosing the 2nd music
   for(ii=0;ii<m.length;ii++){
     if(ii==0){def='selected';} //default value is the first
     else{def='';}
     el.innerHTML+='<option '+def+' value='+ii+'>'+ii+'</option>';
   }
  }

  function selectValues(se){ //HTML select id, returns selected values
   var options = document.getElementById(se).selectedOptions;
   var values = Array.from(options).map(({ value }) => value);  
   return values;
  }
  
  function changeCanvasH(){
    let el = document.getElementById('canvasH');
    window.canvasH=el.value;
    console.log('espaço entre claves mudou para ',window.canvasH);
  }
  
  let winIni =0;
  let winFin =0;
  let winSize=4;
  
  function start(ini,fin){ //starts to show score based on initial and final notes
   values=selectValues('staves');
   console.log(values);
   $('#div-part').empty(); //the only line that requires jquery lib: clear previous drawings
   window.voice=new Array();
   for(idx=0; idx<values.length; idx++){ // 0 to n selected staves
    tr=parseInt(values[idx]);
    window.voice.push( new VF.Voice({num_beats: 4,  beat_value: 4}) );  //Create a voice in 4/4
    let vc=window.voice[idx];
    desenhaPart('div-part');//draws stave lines   
    seqstart=findNoteBySequence(window.myms[tr],	ini	);
    seqend	=findNoteBySequence(window.myms[tr],	fin	);
    console.log('Start,end: '+seqstart+','+seqend);   

    myms_part=scoreSeqStartEnd(window.myms[tr],seqstart,seqend,ticks);
    console.log( tmp2 );console.log( tmp ); console.table( myms_part );
    //console.log( tmp2[0]);console.log( tmp[0]);console.log( myms_part[0]);
    desenhaNota('treble',myms_part,myms_part.length,vc); //tr here acts an index of voice array
    if(ini==0){ MIDIConnect(); }//ta temporario aqui, ate ter botao especifico
   }
   //window.voice =vc;
   window.winIni=ini;
   window.winFin=fin;
  }
  

//  end of vexFlow interface
//---------------------------------------------------------------------- 

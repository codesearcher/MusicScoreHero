//  start of midi-parser interface
//  as a module, it should be implemented at html file
//  end of midi-parser interface
//----------------------------------------------------------------------
// start of WebMidi interface  
//navigator.requestMIDIAccess().then((access) => {
// console.log(access.outputs);
//});  
 WebMidi   // Enable WebMidi.js and trigger the onEnabled() function when ready.
  .enable()
//  .then(onEnabled)
  .catch(err => alert(err));
  var mySynth;
  
 function OnEnabled() {
  let el=document.getElementById('configs');
  let b =document.body;//getElementById('body');
  if (WebMidi.inputs.length < 1) {
   b.innerHTML+= "No device detected.";
  } else {
   b.innerHTML+='<select id=\'device\'>';
   WebMidi.inputs.forEach((device, index) => {
    document.getElementById('device').innerHTML+= `<option value=${index}>\'${index}: ${device.name} </option>`;
   });
   b.innerHTML+='</select>';
  }
 }
 
 let playnow=[];//an array of notes being played now
 let steps=0;//steps succesfully played
 let points=0;
 let errors=0;
 
 function MIDIConnect(){ //starts to show score based on initial and final notes
 //dev=document.getElementById('device').value;
 dev=1;//so pra facilitar os testes, conecta auto no disp 2
 console.log('connecting to midi device #'+dev);
 mySynth = WebMidi.inputs[dev];  //dispositivo: 0-N
 // const mySynth = WebMidi.getInputByName("TYPE NAME HERE!")
 chn=document.getElementById('channel').value;
 console.log('MIDI channel:',chn);
 
 mySynth.channels[chn].addListener("noteon", e => {  //[canal midi: 1-16]
  console.log(midi2notation(e.note.number),myms_part[0][0][0]);
  simnotes=myms_part[0][0].length; //# of 'simultaneous' notes
  let prev_status=playnow.length;
  for(i=0; i<simnotes; i++){ 	   //lista de notas que DEVEM ser tocadas
   console.log('.', myms_part[0][0][i],',',(midi2notation(e.note.number)),'.' );
   if(myms_part[0][0][i]==(midi2notation(e.note.number))){ //the note was played right
    console.log('comparacao ',i,'/',simnotes,' bem sucedida');
    points++;
    playnow.push(midi2notation(e.note.number));//adiciona a lista de notas tocadas certas
    if (playnow.length==myms_part[0][0].length){//todas as notas certas ja foram tocadas}
     playnow=[];
     window.winIni++;
     window.winFin++;
     console.log('a nova janela será de ',window.winIni,' a ',window.winFin);
     start(window.winIni,window.winFin);//carregar as proximas notas
     console.log('acertei todas as notas da fase ');
     //eh a ultima nota musical?
     //mostra estatisticas do jogo
    }
    
   }else{ //one of the notes was played wrong
	   //mostrar marca vermelha na partitura pra indicar onde tocou
   }
   if (prev_status==playnow.length){  errors++; } //all notes played was wrong
  }
  let status = document.getElementById('statusbar');
  status.innerHTML= e.note.identifier+' [dicas] Pontos:'+points+' Erros: '+errors;//insira var com ${var}
  });   
 }
//  end of webMidi.js interface
//----------------------------------------------------------------------
//  start of vexFlow interface

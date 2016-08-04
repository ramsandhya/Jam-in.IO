var socket = io();
var keyboard = new QwertyHancock({
  id: 'keyboard',
  width: 600,
  height: 150,
  octaves: 2
});

var context = new AudioContext(),
masterVolume = context.createGain(),
oscillators = {};

masterVolume.gain.value = 0.2;

masterVolume.connect(context.destination);

keyboard.keyDown = function (note, frequency) {
  socket.emit('noteOn', {
    note: note,
    frequency: frequency
  });
};

keyboard.keyUp = function(note, frequency) {
  socket.emit('noteOff', {
    note: note,
    frequency: frequency
  });
};

socket.on('noteOff', function(data){
  console.log(data);
  noteOff(data.note, data.frequency);
});

socket.on('noteOn',  function(data){
  console.log(data);
  noteOn(data.note, data.frequency);
});


function noteOn(note, frequency) {
  var osc = context.createOscillator(),
  osc2 = context.createOscillator();

  osc.frequency.value = frequency;
  osc.type = 'sawtooth';
  osc.detune.value = -10;

  osc2.frequency.value = frequency;
  osc2.type = 'triangle';
  osc2.detune.value = 10;

  osc.connect(masterVolume);
  osc2.connect(masterVolume);

  masterVolume.connect(context.destination);

  oscillators[frequency] = [osc, osc2];

  osc.start(context.currentTime);
  osc2.start(context.currentTime);
}



function noteOff(note, frequency) {
  oscillators[frequency].forEach(function (oscillator) {
    oscillator.stop(context.currentTime);
  });
}

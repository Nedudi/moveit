


var core = {
  init:function(){
    var that = this;

    $('.save').on('click',function(){
      var req = $.post("/json/save",CURRENT_DATA).error(function() { alert("error"); });
      req.success(function(obj){
        //console.log(obj);
        history.pushState(null,null,"/"+obj.enjoyid+window.location.hash);
      });
    });


    that.spectrumCanvas = document.getElementById('spectrum_canvas');
    that.spectrumCtx = that.spectrumCanvas.getContext('2d');

    this.scene = $('<div>').addClass('scene').appendTo('body article');

    scene.init(this.scene);

    player.init(this.scene);
    if(!CURRENT_DATA.url){
      tap.init(this.scene);
    } else {
      scene.addImage(CURRENT_DATA.url);
    }


   //that.initAudioStuff();

    $(".c").slider({
      from: 0,
      to: 512,
      //heterogeneity: ['50/100', '75/250'],
      scale: [0, '|', 128, '|' , '256', '|', 372, '|', 512],
      limits: false,
      step: 1,
      dimension: '&nbsp;',
      onstatechange : function(v){
        if(!CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')]){CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')] = {};}
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].from      = this.inputNode[0].value.split(';')[0];
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].to        = this.inputNode[0].value.split(';')[1];
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].color     = $(this.domNode[0]).find('i.v').css('backgroundColor');
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].channel   = $(this.inputNode[0]).data('channel');
        console.log(CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].channel);
      }

    });

    function calcSpectrum(source, channel){

      var data = new Uint8Array(source.frequencyBinCount);
      source.getByteFrequencyData(data);

      var sounds = {};

      var oSpectrum = [];

      for(var l in CURRENT_DATA.letters){
        var letter = CURRENT_DATA.letters[l];
        if(letter.channel == channel){
          sounds[l] = 0;
        }
      }

      for (var i = 0; i < data.length; i++) {
        for(var l in CURRENT_DATA.letters){
          var letter = CURRENT_DATA.letters[l];
          if(letter.channel == channel && i>letter.from && i<letter.to){
            sounds[l] += data[i];
          }
        }

        var ls = 0;
        var ln = 0;
        for(var j = -10; j <= 10; j++){
          if(data[i+j]){
            ls += data[i+j];
            ln++;
          }
        }
        oSpectrum[i] = Math.round(ls/ln);
      }

      for(var s in sounds){
        var letter = CURRENT_DATA.letters[s];
        //if(letter.channel == channel){
        sounds[s]= sounds[s] / (letter.to - letter.from) / 256;
        //}
      }
      return {data:data, oData:oSpectrum, sounds: sounds, letters: CURRENT_DATA.letters};
    }

    function clearDataCanvases(){
      that.spectrumCtx.clearRect(0, 0, that.spectrumCanvas.width, that.spectrumCanvas.height);
    }


    function drawSpectrum(spectrum, color){
      that.spectrumCtx.lineCap = 'round';
      for (var i = 0; i < that.spectrumCanvas.width; ++i) {
        var magnitude = spectrum.oData[i];

        that.spectrumCtx.globalAlpha = 1;
        that.spectrumCtx.fillStyle = color;
        that.spectrumCtx.fillRect(i, that.spectrumCanvas.height, 1, -magnitude);

        that.spectrumCtx.globalAlpha = 0.5;
        for(var l in spectrum.sounds){
          var letter = spectrum.letters[l];
          if(i>letter.from && i<letter.to){
            that.spectrumCtx.fillStyle = letter.color;
            that.spectrumCtx.fillRect(i, that.spectrumCanvas.height, 1, -magnitude);
          }
        }
        that.spectrumCtx.fillStyle = 'rgba(0,0,0,0.2)';
        that.spectrumCtx.fillRect(i, that.spectrumCanvas.height, 1, -magnitude+3);
      }
    }


    that.updateSpectrum = function(time) {

      window.webkitRequestAnimationFrame(core.updateSpectrum);

      clearDataCanvases();


      var soundSpectrum = calcSpectrum(player.channels[1].audioAnalyser,1);
      drawSpectrum(soundSpectrum, '#aaaaaa');

      var voiceSpectrum = calcSpectrum(player.channels[0].audioAnalyser,0);
      drawSpectrum(voiceSpectrum, '#ffffff');

      scene.update(voiceSpectrum,soundSpectrum);

    }
  }
}





    window.onload = function() {
      core.init();
    };




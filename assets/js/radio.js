var a = new UAParser();
var browserName = a.getResult().browser.name;
document.documentElement.setAttribute('data-useragent', browserName);

LoginPage = function(){
	this.main = function(){
		resizeProps();
		$(window).resize(function(){resizeProps();});
		new ParticleNetwork(document.getElementById('particle-canvas'), {particleColor: '#888',background: 'assets/img/crystal-cave-dark.png',interactive: true,speed: 'medium',density: 'high'});
		this.captionHoverEffect();
		
		$(document).bind('keyup', 'return', function(){resizePlay();});
		$("#play").click(function(){resizePlay()});
	}
	
	this.resizeProps = function(){
		var wHeight = $(window).height();
		var wWidth = $(window).width();
		$("#particle-canvas").css('height', wHeight + "px");
		$(".flip-container, .front, .back").css({height: wHeight + "px", width: wWidth + "px"});
		$("#play").css('margin-top', Math.floor((wHeight / 2) - ($("#play").height() / 2)) + "px");
		$("#play").css('margin-left', Math.floor((wWidth / 2) - ($("#play").width() / 2)) + "px");
	}
	
	this.resizePlay = function(){
		if($('#play').hasClass('resized'))
			return null;
		var width = 185;
		var height = 76;
		var duration = 500;
		var wHeight = $(window).height();
		var wWidth = $(window).width();
		var mTop = Math.floor((wHeight / 2) - (height / 2)) + "px";
		var mLeft = Math.floor((wWidth / 2) - (width / 2)) + "px";
		
		this.stopAnimation('#play');
		$('#rotate-bg').remove();
		$('#play').css({'background-image': "url('assets/img/parts/gradient-login-bg.png')",
						'background-position': 'left center',
						'box-shadow': '0 0 7px #6f7ff2', '-webkit-box-shadow': '0 0 7px #6f7ff2'});
		$('#play').animate({borderRadius: 2, width: width, height: height, marginTop: mTop, marginLeft: mLeft, opacity: 0.9}, {duration: duration, queue: false});
		$('#arrow').animate({marginTop: 5, marginLeft: 95, opacity: 0}, {duration: duration, queue: false, complete: function(){
			$(this).remove();
			$('#play').append('<form method="POST" id="loginform"><input type="text" id="uname" class="inp" name="uname" maxlength="20" autocomplete="off" placeholder="Pirátské jméno"><div id="pass-cont"><input type="password" name="pass" maxlength="20" autocomplete="new-password" id="pass" class="inp" placeholder="Heslo"><input type="submit" id="submit" value=""></div></form>');
			$("html[data-useragent!='IE'] input#uname").focus(); /*without ie -> in ie placeholder disappearing*/
			$('#loginform').animate({opacity: 1}, {duration: 300}).submit(function(event){
				event.preventDefault();
				
				/*validation effect*/
				var uname = $('input#uname').val();
				var pass = $('input#pass').val();
				if(loginValidation(uname, pass)){
					flipEffect();
					destroy();
					/* start RadioPage with walidated user data */
					RadioPage(uname, pass);
				}else{
					$('#play').effect('shake').animate({boxShadow: '0 0 30px #d95181'}, {duration: 250, queue: false});
				}
			});
			
			/*outside click effect*/
			$('html').click(function() {
				resizePlayBack(duration);
				$(this).unbind('click');
			});
			$('#play').click(function(event){event.stopPropagation();});
		}});
		
		$('#play').addClass('resized');
	}
	
	this.resizePlayBack = function(){
		if(!$('#play').hasClass('resized'))
			return null;
	
		var duration = 500;
		var wHeight = $(window).height();
		var wWidth = $(window).width();
		var mTop = Math.floor((wHeight / 2) - (86 / 2)) + "px";
		var mLeft = Math.floor((wWidth / 2) - (86 / 2)) + "px";
		
		$('#loginform').animate({opacity: 0}, {duration: 300, queue: false, complete: function(){$(this).remove();}});
		$('#play').append('<div id="rotate-bg"></div><div id="arrow" style="opacity: 0"></div>')
				  .animate({width: '86px', height: '86px', marginTop: mTop, marginLeft: mLeft, borderRadius: '45px'}, {duration: duration, queue: false})
				  .css({'-webkit-animation-name': 'bluePulse', '-webkit-animation-duration': '3s', '-webkit-animation-iteration-count': 'infinite', 'cursor': 'hand'})
				  .removeClass('resized');
		$('#arrow').animate({opacity: 1}, {duration: 300, queue: false});	
	}
	
	this.loginValidation = function(uname, pass){
		var logged = false;
		var respond = $.ajax({
			method: 'POST',
			url: 'auth/listener_joined.php',
			data: {user: uname, pass: pass},
			async: false,
			success: function(data, textStatus, request){
				var res = request.getResponseHeader('icecast-auth-user');
				logged = (res == 0)? false : true;
				console.log("iside: " + logged);
				console.log(res);
			}
		});
		return logged;
	}

	this.captionHoverEffect = function(){
		$('#header h1 span').hover(function(){
		var back = ["#f37a8f", "#bd49c2", "#a258d1", "#2f8a9b", "#3d6671"];
		var rand = back[Math.floor(Math.random() * back.length)];
		$(this).animate({color: rand}, 300);
		}, function(){
			$(this).animate({color: 'white'}, 300);
		});
	}
	
	this.flipEffect = function(){
		$('.flip-container .flipper').css({'transform': 'rotateY(180deg)'});
		$("html[data-useragent*='IE'] .flip-container .back").css({transform: 'rotateY(0deg)'});
		$("html[data-useragent*='IE'] .flip-container .front").css({transform: 'rotateY(180deg)'});
		setTimeout(function(){
			$(".front *").remove();
		},1000);				
	}
	
	this.stopAnimation = function(element){
		$(element).css("-webkit-animation", "none");
		$(element).css("-moz-animation", "none");
		$(element).css("-ms-animation", "none");
		$(element).css("animation", "none");
	}
	
	this.destroy = function(){
		$(window).unbind();
		$(document).unbind();
		delete this;
	}
	
	this.main();
}

/*null RadioPage(string uname, string pass)*/
RadioPage = function(){
	this.args = arguments;
	this.libs = ['assets/js/jquery.easing.min.js',
				 'assets/js/supersized.js', 
				 'assets/js/supersized-conf.js', 
				 'assets/js/jquery.kontrol.js'];
	this.lastVolume = 0.65;
	this.uname = "";
	this.pass = "";

	this.main = function(uname, pass){
		this.uname = uname;
		this.pass = pass;
		
		this.resizePage();
		$(window).resize(function(){this.resizePage();});
		$('input#dial').dial({min: 0,max: 100,width: 150,height: 150,thickness: 0.08,displayInput: true,bgColor: 'rgba(128,128,128,0.2)',fgColor: 'rgba(74,74,74,0.8)'});
		this.connect();
		$(document).bind('keydown', 'space', function(){ playStopSwitch(); });
	}
	
	this.resizePage = function(){
		var wHeight = $(window).height();
		var wWidth = $(window).width();
		
		$(".flip-container, .front, .back").css({height: wHeight + "px", width: wWidth + "px"});
		$('.page').css({width: wWidth + "px", height: wHeight + "px"});
		$('#playpage #control').css({marginLeft: Math.floor((wWidth / 2) - 75) + "px"});
		$('#playpage #control').css({marginTop: Math.floor((wHeight / 2) - 75) + "px"});
	}
	
	this.connect = function(){
		$('body').append('<iframe id="if-auth" style="display: none" src="http://'+ this.uname +':'+ this.pass +'@sorfa.sh.cvut.cz:8000/radio"></iframe>');
		$('#if-auth').on('load', function(){
			$(this).remove();
		});
		
		$('#control').append('<audio autoplay id="audio-controll" style="display: none" src="http://sorfa.sh.cvut.cz:8000/radio">');
		$('audio#audio-controll').bind('canplay', function(){
			$('#loader').remove();
			$('#play-but').css('visibility', 'visible').click(function(){
				playStopSwitch();
			});
			
			$(this).prop('volume', 0).trigger('play');
			$({volume:0}).animate({volume: lastVolume}, {easing: 'easeOutCubic', duration: 2000, step: function(step){
				$('audio#audio-controll').prop('volume', step);
				$('input#dial').val(step * 100).trigger('change');
			}, complete: function(){						
				/*audio volume manipulation*/
				$('input#dial').trigger('configure',{'change': function(){
					console.log($('input#dial').val());
					$('audio#audio-controll').prop('volume', $('input#dial').val() / 100);
				}});
			}});
		});
	}
	
	this.playStopSwitch = function(){
		var audioControll = $('audio#audio-controll');
		var inputDial = $('input#dial'); 
		var playBut = $('#play-but');
		var duration = 1000;
		
		if(playBut.hasClass('playing')){
			this.lastVolume = audioControll.prop('volume');
			playBut.removeClass('playing').addClass('stopped');
			
			$({volume: this.lastVolume}).animate({volume: 0}, {easing: 'easeOutCubic', duration: duration, step: function(step){
				audioControll.prop('volume', step);
				inputDial.val(step * 100).trigger('change');
			}, complete: function(){						
				$('audio#audio-controll').trigger('pause');
			}});					
		}else{
			audioControll.trigger('play');
			playBut.removeClass('stopped').addClass('playing');
			
			$({volume: 0}).animate({volume: this.lastVolume}, {easing: 'easeOutCubic', duration: duration, step: function(step){
				audioControll.prop('volume', step);
				inputDial.val(step * 100).trigger('change');
			}});
		}
	}
	
	this.loadScripts = function(scripts, after){
		if(scripts.length <= 0){
			if(typeof after === "function")
				after();
			return null;
		}	

		var script = document.createElement('script');
		script.src = scripts[0];
		script.onload = function () {
			scripts.splice(0,1);
			loadScripts(scripts, after);
		};
		document.head.appendChild(script);
	}
	
	this.loadScripts(this.libs, function(){main(this.args[0], this.args[1]);});
}

$(document).ready(function(){
	LoginPage();
});
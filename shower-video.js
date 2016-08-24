/*!
	Video plugin for Shower, HTML presentation engine (github.com/shower/shower)

	Browser support: latest versions of all major browsers

	@url github.com/operatino/shower-video
	@author Robert Haritonov <r@rhr.me>
	@twitter @operatino
*/

/*
	TODO:
	* rerun video if it finished playback or next slide tick
	* check preload on android mobile devices
	* mark videos as played for turning off autoplay on iphone

 */

 shower.modules.define('shower-video', [
     'util.extend'
 ], function (provide, extend) {

     function Main (shower, options) {
			 options = options || {};
			 this._shower = shower;
			 this._playerListeners = null;

			 this.showerCssInit = 0;
			 this.debug = options.debug || false;

			 this.isMobile = false;
			 this.isIPhone = false;
			 this.isIPad = false;

			 this._setupListeners();
			 this._prepareEnv();
     }

     extend(Main.prototype, {

         destroy: function () {
             this._clearListeners();
             this._shower = null;
         },

         _setupListeners: function () {
             var shower = this._shower;

             this._showerListeners = shower.events.group()
                 .on('destroy', this.destroy, this);

             this._playerListeners = shower.player.events.group()
                 .on('activate', this._onActivate, this)
         },

         _clearListeners: function () {
             if (this._showerListeners) {
                 this._showerListeners.offAll();
             }
             if (this._playerListeners) {
                 this._playerListeners.offAll();
             }
         },

       	_forEach: function (array, callback) {
       		Array.prototype.forEach.call(array, function (item) {
       			callback(item);
       		});
       	},

         _prepareEnv: function(){
           var html = document.getElementsByTagName('html')[0];
       		if (navigator.userAgent.match(/Android/i)
       		|| navigator.userAgent.match(/webOS/i)
       		|| navigator.userAgent.match(/iPhone/i)
       		|| navigator.userAgent.match(/iPad/i)
       		|| navigator.userAgent.match(/iPod/i)
       		|| navigator.userAgent.match(/BlackBerry/i)
       		|| navigator.userAgent.match(/Windows Phone/i)
       		) {
       			this.isMobile = true;
       			html.classList.add('mobile');
       		}

       		if ( navigator.userAgent.match(/iPhone/i) ) {
       			this.isIPhone = true;
       			html.classList.add('iphone');
       		}

       		if ( navigator.userAgent.match(/iPad/i) ) {
       			this.isIPad = true;
       			html.classList.add('ipad');
       		}
       	},

         _onActivate: function () {
           this.startVideo();
           this.startGif();
       	},

         startVideo: function () {
       		// pause all videos first
       		var allVideos = document.querySelectorAll('video');

           console.log(allVideos);

       		this._forEach(allVideos, function (el) {
       			el.pause();
       			if (this.isMobile) { el.parentNode.style.display = 'none';}
       		}.bind(this));

       		// Fetch all videos on current slide
       		var activeVideos = document.querySelectorAll('.slide.active video');
       		this._forEach(activeVideos, function(el){
       			var play = function() {
       				// Reset video
       				el.currentTime = 0;
       				el.play();
       			};

       			var prepareForPlaying = function () {
       				// For triggering video load on iPad
       				el.load();
       				el.play();

       				// And then pause till video fully downloaded
       				el.pause();

       				//TODO: add loader

       				// Waiting till video fully loads
       				el.addEventListener('canplaythrough', play, false);
       			};

       			if(el && el.currentTime !== undefined) {
       				if (el.readyState !== 4) { // HAVE_ENOUGH_DATA

       					if (this.debug) console.log('Video not ready');

       					if(this.isMobile && this.showerCssInit === 0) {
       						//TODO: add loader
       						//TODO: on first page visit with video, add play button

       						//initing video after first Shower CSS init, to avoid CPU load bottleneck
       						setTimeout(function(){
       							//TODO: move this init to Full mode check
       							this.showerCssInit = 1;

       							el.parentNode.style.display = 'block';

       							prepareForPlaying();
       						}.bind(this), 700);

       					} else {

       						// Init video for mobile devices
       						if (this.isMobile) { el.parentNode.style.display = 'block';}

       						prepareForPlaying();
       					}

       				} else {
       					if (this.debug) console.log('Video is ready');

       					if (this.isMobile) { el.parentNode.style.display = 'block';}

       					play();
       				}
       			}
       		}.bind(this));
       	},

         startGif: function () {
       		var activeSlideGifs = document.querySelectorAll('.slide.active .gif');
       		var allGifs = document.querySelectorAll('.slide .gif');

       		if( activeSlideGifs.length !== 0) {

       			this._forEach(activeSlideGifs, function (item) {
       				if (item.classList.contains('real')) {
       					item.style.display = 'block';
       				} else {
       					item.style.display  = 'none';
       				}
       			});

       		} else {

       			this._forEach(allGifs, function (item) {
       				if (item.classList.contains('real')) {
       					item.style.display  = 'none';
       				} else {
       					item.style.display  = 'block';
       				}
       			});
       		}
       	}

     });

     provide(Main);
 });

 shower.modules.require(['shower'], function (sh) {
     sh.plugins.add('shower-video');
 });

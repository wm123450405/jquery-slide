// JavaScript Document
;(function(){
	var inFunction=function(method,target,parameters){
		return function(){
			if(parameters){
				method.apply(target,parameters);
			}else{
				method.call(target);
			}
		};
	};
	var setTask=function(method,delay,target,parameters){
		return setTimeout(inFunction(method,target,parameters),delay);
	};

    var getTouch = function(event, target) {
        if (event.targetTouches) {
            for (var i = 0; i < event.targetTouches.length; i++) {
            	var touch = event.targetTouches[i];
            	if (jQuery(target).closest(touch.target).length > 0 || jQuery(touch.target).closest(target).length > 0) {
            		return touch;
				}
            }
        }
        if (event.changedTouches) {
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                if (jQuery(target).closest(touch.target).length > 0 || jQuery(touch.target).closest(target).length > 0) {
                    return touch;
                }
            }
        }
        return event;
    };

	jQuery.graphics=document.createElement('canvas').getContext?'html5':jQuery.browser.msie?'vml':'svg';
	jQuery.fn.unSlide=function(){
		if(this.length>1){
			return this.each(function(){
				jQuery(this).unSlide();
			});
		}
		if(this.length===0){
			return this;
		}
		if(this.data('slide')){
			this.empty().append(this.data('slideElement').children().clone());
			clearTimeout(this.data('slideOption').interval);
			this.data('slideOption').delay=0;
			this.data('slide',false).data('slideOption', null).data('slideElement', null);
		}
		return this;
	};
	jQuery.fn.slide=function(option){
		if(this.length>1){
			return this.each(function(){
				jQuery(this).slide(option);
			});
		}
		if(this.length===0){
			return this;
		}
		if(this.data('slide')){
			return this;
		}
		if(this.children().length<=2){
			return this;
		}
		option=jQuery.extend({},jQuery.fn.slide.defaultOption,option);
		this.data('slide',true);
		this.data('slideOption',option);
		this.data('slideElement',this.clone());
		//create player
		option.target=this;
		option.list=this.children().css({
			position:'absolute'
		});
		option.list.css('textAlign',option.list.css('textAlign'));
		option.width=this.width();
		option.height=this.height();
		option.content=jQuery('<div></div>').css({
			position:'absolute',
			width:option.width*5,
			height:option.height*5,
			marginLeft:-option.width*2,
			marginTop:-option.height*2,
			textAlign:'left'
		});
		var content=jQuery('<div></div>').css({
			position:'relative',
			overflow:'hidden',
			width:'100%',
			height:'100%',
			textAlign:'left'
		}).appendTo(this).append(option.content);
		option.buffer=jQuery('<div></div>');
		option.buffer.append(option.list);
		option.queue=[-1,0,-1,0];
		option.playing=false;
		option.changed=false;
		option.stoped=false;
		option.paused=false;
		option.playEnd=[];
		option.play=function(index,change,stoped){
			clearTimeout(this.interval);
			if(typeof index!=='undefined'){
				if(this.queue[2]!==index&&(this.queue[0]===this.queue[1]||this.queue[1]!==index)){
					this.queue[3]=index;
				}else{
					return;
				}
			}else{
				index=this.changed||change?this.queue[3]:this.queue[2]===-1?this.queue[1]:this.queue[2];
			}
			this.changed=change?true:false;
			this.stoped=stoped?true:false;
			if(this.pageList){
				for(var i=0;i<this.pageList.length;i++){
					var pageItem=this.pageList.eq(i);
					if(i!==index){
						pageItem.children('.background__').draw(this.page.shape,this.page.width,this.page.height,this.page.bgcolor,this.page.borderWidth,this.page.borderColor);
						pageItem.children('.label__').css('color',this.page.color);
					}else{
						pageItem.children('.background__').draw(this.page.shape,this.page.width,this.page.height,this.page.bgcolorHover||this.page.bgcolor,this.page.borderWidth,this.page.borderHover||this.page.borderColor);
						pageItem.children('.label__').css('color',this.page.colorHover||this.page.color);
					}
				}
			}
			if(this.playing){
				if(this.queue[0]===-1&&this.queue[2]===-1&&this.queue[1]===this.queue[3]){
					this.playing=false;
				}
				return;
			}
			this.target.trigger('slidePlay', [this.queue[1], this.list.length]);
			//in
			var actionIn=this.actionIn;
			var endIn={
				marginTop:this.height*2,
				marginLeft:this.width*2,
				opacity:1,
				width:this.width,
				height:this.height
			};
			var startIn=jQuery.extend({},endIn);
			if(actionIn){
				if(actionIn==='random'){
					actionIn='up,down,left,right,alpha,zoom'.split(',')[parseInt(Math.random()*6)];
				}
				if(actionIn instanceof String || typeof(actionIn) === 'string'){
					actionIn=actionIn.split(/\s+/ig);
				}
				for(var i=0;i<actionIn.length;i++){
					var action=actionIn[i];
					if(action==='up'){
						startIn.marginTop=this.height*3;
					}else if(action==='down'){
						startIn.marginTop=this.height*1;
					}else if(action==='left'){
						startIn.marginLeft=this.width*3;
					}else if(action==='right'){
						startIn.marginLeft=this.width*1;
					}else if(action==='zoomBig'){
						startIn.width=0;
						startIn.height=0;
						startIn.marginLeft=this.width*2.5;
						startIn.marginTop=this.height*2.5;
					}else if(action==='zoomSmall'){
						startIn.width=this.width*2;
						startIn.height=this.height*2;
						startIn.marginLeft=this.width*1.5;
						startIn.marginTop=this.height*1.5;
					}else if(action==='opacity'){
						startIn.opacity=0;
					}
				}
			}
			//out
			var actionOut=this.actionOut;
			var startOut={
				marginTop:this.height*2,
				marginLeft:this.width*2,
				opacity:1,
				width:this.width,
				height:this.height
			};
			var endOut=jQuery.extend({},startOut);
			if(actionOut){
				if(actionOut==='random'){
					actionOut='up,down,left,right,alpha,zoom'.split(',')[parseInt(Math.random()*6)];
				}
				if(actionOut instanceof String || typeof(actionOut) === 'string'){
					actionOut=actionOut.split(/\s+/ig);
				}
				for(var i=0;i<actionOut.length;i++){
					var action=actionOut[i];
					if(action==='up'){
						endOut.marginTop=this.height*1;
					}else if(action==='down'){
						endOut.marginTop=this.height*3;
					}else if(action==='left'){
						endOut.marginLeft=this.width*1;
					}else if(action==='right'){
						endOut.marginLeft=this.width*3;
					}else if(action==='zoomBig'){
						endOut.width=this.width*2;
						endOut.height=this.height*2;
						endOut.marginLeft=this.width*1.5;
						endOut.marginTop=this.height*1.5;
					}else if(action==='zoomSmall'){
						endOut.width=0;
						endOut.height=0;
						endOut.marginLeft=this.width*2.5;
						endOut.marginTop=this.height*2.5;
					}else if(action==='opacity'){
						endOut.opacity=0;
					}
				}
			}
			//animate
			if(this.queue[1]===this.queue[3]){
				jQuery(this.list.get(this.queue[3])).appendTo(this.content).css(endIn);
				this.queue[3]=this.changed?this.queue[3]:(this.queue[3]+1)%this.list.length;
				if(this.changed){
					this.play(undefined,false,this.stoped);
				}else if(!this.stoped&&this.delay!==0){
					this.playing=false;
					this.interval=setTask(this.play,this.delay,this);
				}else{
					this.playing=false;
				}
			}else{
				jQuery(this.list.get(this.queue[3])).appendTo(this.content).css(startIn).animate(endIn,this.speed,this.easing,inFunction(this.playInEnd,this));
				jQuery(this.list.get(this.queue[1])).appendTo(this.content).css(startOut).animate(endOut,this.speed,this.easing,inFunction(this.playOutEnd,this));
				this.queue[2]=this.queue[3];
				this.queue[3]=this.changed?this.queue[3]:(this.queue[2]+1)%this.list.length;
				this.queue[0]=this.queue[1];
				this.playing=true;
			}
		};
		option.pause=function(index){
			if(!this.paused){
				if(this.playing){
					if(typeof index!=='undefined'){
						this.playEnd.push(inFunction(this.play,this,[index,false,true]));
					}else{
						this.play(undefined,false,true);
					}
				}else{
					if(typeof index!=='undefined'&&index!==this.queue[1]){
						this.play(index,false,true);
					}else{
						clearTimeout(this.interval);
					}
				}
				this.paused=true;
			}
		};
		option.resume=function(){
			if(this.paused){
				this.playEnd=[];
				this.paused=false;
				if(this.delay!==0&&!this.playing){
					this.interval=setTask(this.play,this.delay,this);
				}
			}
		};
		option.playInEnd=function(){
			this.queue[1]=this.queue[2];
			this.queue[2]=-1;
			this.target.trigger('slidePlay', [this.queue[1], this.list.length]);
			if(this.pageList){
				for(var i=0;i<this.pageList.length;i++){
					var pageItem=this.pageList.eq(i);
					if(i!==(this.changed?this.queue[3]:this.queue[1])){
						pageItem.children('.background__').draw(this.page.shape,this.page.width,this.page.height,this.page.bgcolor,this.page.borderWidth,this.page.borderColor);
						pageItem.children('.label__').css('color',this.page.color);
					}else{
						pageItem.children('.background__').draw(this.page.shape,this.page.width,this.page.height,this.page.bgcolorHover||this.page.bgcolor,this.page.borderWidth,this.page.borderHover||this.page.borderColor);
						pageItem.children('.label__').css('color',this.page.colorHover||this.page.color);
					}
				}
			}
			if(this.delay!==0&&this.queue[0]===-1){
				this.playing=false;
				if(this.changed){
					this.play(undefined,false,this.stoped);
				}else if(!this.stoped){
					this.interval=setTask(this.play,this.delay,this);
				}
				var playEnd; while(playEnd=this.playEnd.shift()) { playEnd(); }
			}else if(this.delay===0&&this.queue[0]===-1){
				if(this.changed){
					this.play(undefined,false,this.stoped);
				}
			}
		};
		option.playOutEnd=function(){
			jQuery(this.list.get(this.queue[0])).appendTo(this.buffer);
			this.queue[0]=-1;
			if(this.delay!==0&&this.queue[2]===-1){
				this.playing=false;
				if(this.changed){
					this.play(undefined,false,this.stoped);
				}else if(!this.stoped){
					this.interval=setTask(this.play,this.delay,this);
				}
				var playEnd; while(playEnd=this.playEnd.shift()) { playEnd(); }
			}else if(this.delay===0&&this.queue[2]===-1){
				if(this.changed){
					this.play(undefined,false,this.stoped);
				}
			}
		};
		option.playNext=function(direction){
			if(this.playing){
				return;
			}
			var actionIn=option.actionIn;
			var actionOut=option.actionOut;
			if(direction){
				option.actionIn=direction;
				option.actionOut=direction;
			}
			this.play((this.queue[1]+1)%this.list.length,true);
			if(direction){
				option.actionIn=actionIn;
				option.actionOut=actionOut;
			}
		};
		option.playPrev=function(direction){
			if(this.playing){
				return;
			}
			var actionIn=option.actionIn;
			var actionOut=option.actionOut;
			if(direction){
				option.actionIn=direction;
				option.actionOut=direction;
			}
			this.play((this.queue[1]+this.list.length-1)%this.list.length,true);
			if(direction){
				option.actionIn=actionIn;
				option.actionOut=actionOut;
			}
		};
		if(option.page){
			option.page=jQuery.extend({},option.pageDefault,option.page);
			var pageList=jQuery('<div></div>').css({
				position:'absolute',
				width:option.page.direction==='hor'?option.page.width*option.list.length+option.page.space*(option.list.length-1):option.page.width,
				height:option.page.direction==='ver'?option.page.height*option.list.length+option.page.space*(option.list.length-1):option.page.height,
				zIndex:option.list.length+2
			});
			for(var i=0;i<option.list.length;i++){
				var pageItem=jQuery('<div></div>').css({
					float:'left',
					width:option.page.width,
					height:option.page.height,
					overflow:'hidden',
					textAlign:'left',
					//backgroundColor:option.page.backgroundColor,
					cursor:'pointer',
					marginLeft:i===0?0:option.page.direction==='ver'?0:option.page.space,
					marginTop:i===0?0:option.page.direction==='hor'?0:option.page.space
				}).appendTo(pageList);
				var background=(jQuery.graphics==='html5'?jQuery('<canvas></canvas>'):jQuery('<div></div>')).css({
					position:'absolute',
					overflow:'hidden',
					width:option.page.width,
					height:option.page.height,
					zIndex:1
				}).attr('width',option.page.width).attr('height',option.page.height).addClass('background__').appendTo(pageItem)
					.draw(option.page.shape,option.page.width,option.page.height,
						option.page.bgcolor,option.page.borderWidth,option.page.borderColor);
				/*
				 if(jQuery.graphics==='vml'){
				 background.css({
				 paddingLeft:1,
				 paddingTop:1
				 });
				 }
				 */
				if(option.page.hover){
					pageItem.mouseenter(inFunction(option.play,option,[i,true,true]));
					pageItem.mouseleave(inFunction(function(){
						this.stoped=false;
						this.interval=setTask(this.play,this.delay,this);
					},option));
				}else{
					pageItem.click(inFunction(option.play,option,[i,true]));
				}
				pageItem.append(jQuery('<div></div>').css({
					position:'absolute',
					overflow:'hidden',
					width:option.page.width,
					height:option.page.height,
					lineHeight:option.page.height+'px',
					color:option.page.color,
					textAlign:'center',
					zIndex:2
				}).addClass('label__').html(option.page.no?i+1:''));
			}
			option.pageList=pageList.children();
			var pageWidth=pageList.width();
			var pageHeight=pageList.height();
			var margin=option.page.margin.split(/\s+/ig);
			for(var i=0;i<margin.length;i++){
				margin[i]=margin[i]==='auto'?'auto':parseFloat(margin[i]);
			}
			if(margin.length===1){
				margin=[margin[0],margin[0],margin[0],margin[0]];
			}else if(margin.length===2){
				margin=[margin[0],margin[1],margin[0],margin[1]];
			}else if(margin.length===3){
				margin=[margin[0],margin[1],margin[2],margin[1]];
			}
			if(margin[0]==='auto'||margin[0]<0){
				if(margin[2]==='auto'||margin[2]<0){
					margin[0]=Math.floor((option.height-pageHeight)/2);
					margin[2]=Math.ceil((option.height-pageHeight)/2);
				}else{
					margin[0]=option.height-pageHeight-margin[2];
				}
			}else{
				if(margin[2]==='auto'||margin[2]<0){
					margin[2]=option.height-pageHeight-margin[0];
				}else{
					pageList.height(option.height-margin[0]-margin[2]);
				}
			}
			if(margin[1]==='auto'||margin[1]<0){
				if(margin[3]==='auto'||margin[3]<0){
					margin[1]=Math.floor((option.width-pageWidth)/2);
					margin[3]=Math.ceil((option.width-pageWidth)/2);
				}else{
					margin[1]=option.width-pageWidth-margin[2];
				}
			}else{
				if(margin[3]==='auto'||margin[3]<0){
					margin[3]=option.width-pageWidth-margin[1];
				}else{
					pageList.width(option.width-margin[1]-margin[3]);
				}
			}
			for(var i=0;i<margin.length;i++){
				margin[i]=parseFloat(margin[i]);
			}
			pageList.css({
				marginLeft:margin[3],
				marginTop:margin[0]
			});
			content.append(pageList);
		}
		this.on('swiperight', inFunction(option.playPrev,option,['right']));
		this.on('swipeleft', inFunction(option.playNext,option,['left']));
		this.on('mousedown', function(event) {
			jQuery(this).data('location', {
				x: event.pageX,
				y: event.pageY
			});
		});
		this.on('mouseup', function(event) {
			var location = jQuery(this).data('location');
			if (location) {
				var x = event.pageX - location.x;
				var y = event.pageY - location.y;
				if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 5) {
					if (x > 0) {
	                    jQuery(this).trigger('swiperight');
					} else {
	                    jQuery(this).trigger('swipeleft');
					}
				}
	            jQuery(this).data('location', 0);
			}
		});
        if (!jQuery.mobile) {
            this.on('touchstart', function(event) {
                var touch = getTouch(event, this);
                jQuery(this).data('location', {
                    x: touch.pageX,
                    y: touch.pageY
                });
            });
            this.on('touchend', function(event) {
                var location = jQuery(this).data('location');
                if (location) {
                	var touch = getTouch(event, this);
                    var x = touch.pageX - location.x;
                    var y = touch.pageY - location.y;
                    if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 5) {
                        if (x > 0) {
                            jQuery(this).trigger('swiperight');
                        } else {
                            jQuery(this).trigger('swipeleft');
                        }
                    }
                    jQuery(this).data('location', 0);
                }
            });
        }
		if(option.hoverStop){
			this.on('mouseenter mousemove', inFunction(option.pause,option));
			this.on('mouseleave', inFunction(option.resume,option));
		}
		if(option.flip){
			option.flip=jQuery.extend({},option.flipDefault,option.flip);
			if(option.flip.next){
				option.next=jQuery('<div></div>').append(option.flip.next).css({
					position:'absolute',
					cursor:'pointer',
					zIndex:option.list.length+2
				}).click(inFunction(option.playNext,option)).appendTo(content);
				var buttonHeight=option.next.height();
				var buttonWidth=option.next.width();
				var margin=option.flip.margin.split(/\s+/ig);
				for(var i=0;i<margin.length;i++){
					margin[i]=margin[i]==='auto'?'auto':parseFloat(margin[i]);
				}
				if(margin.length===1){
					margin=[margin[0],margin[0],margin[0],margin[0]];
				}else if(margin.length===2){
					margin=[margin[0],margin[1],margin[0],margin[1]];
				}else if(margin.length===3){
					margin=[margin[0],margin[1],margin[2],margin[1]];
				}
				if(margin[0]==='auto'||margin[0]<0){
					if(margin[2]==='auto'||margin[2]<0){
						if(option.flip.direction==='lr'||option.flip.direction==='rl'){
							margin[0]=Math.floor((option.height-buttonHeight)/2);
							margin[2]=Math.ceil((option.height-buttonHeight)/2);
						}else if(option.flip.direction==='bt'){
							margin[0]=Math.floor(option.height/2)-buttonHeight;
							margin[2]=Math.ceil(option.height/2);
						}else{
							margin[0]=Math.floor(option.height/2);
							margin[2]=Math.ceil(option.height/2)+buttonHeight;
						}
					}else{
						margin[0]=option.height-buttonHeight-margin[2];
					}
				}else{
					if(margin[2]==='auto'||margin[2]<0){
						margin[2]=option.height-buttonHeight-margin[0];
					}else{
						if(option.flip.direction==='lr'||option.flip.direction==='bt'){
							margin[2]=option.height-buttonHeight-margin[0];
						}else{
							margin[0]=option.height-buttonHeight-margin[2];
						}
					}
				}
				if(margin[1]==='auto'||margin[1]<0){
					if(margin[3]==='auto'||margin[3]<0){
						if(option.flip.direction==='rl'||option.flip.direction==='bt'){
							margin[3]=Math.floor(option.width/2)-buttonWidth;
							margin[1]=Math.ceil(option.width/2);
						}else{
							margin[3]=Math.floor(option.width/2);
							margin[1]=Math.ceil(option.width/2)+buttonWidth;
						}
					}else{
						margin[1]=option.width-buttonWidth-margin[2];
					}
				}else{
					if(margin[3]==='auto'||margin[3]<0){
						margin[3]=option.width-buttonWidth-margin[1];
					}else{
						if(option.flip.direction==='lr'||option.flip.direction==='tb'){
							margin[3]=option.width-buttonWidth-margin[1];
						}else{
							margin[1]=option.width-buttonWidth-margin[3];
						}
					}
				}
				for(var i=0;i<margin.length;i++){
					margin[i]=parseFloat(margin[i]);
				}
				option.next.css({
					marginTop:margin[0],
					marginLeft:margin[3]
				});
			}
			if(option.flip.prev){
				option.prev=jQuery('<div></div>').append(option.flip.prev).css({
					position:'absolute',
					cursor:'pointer',
					zIndex:option.list.length+2
				}).click(inFunction(option.playPrev,option)).appendTo(content);
				var buttonHeight=option.prev.height();
				var buttonWidth=option.prev.width();
				var margin=option.flip.margin.split(/\s+/ig);
				for(var i=0;i<margin.length;i++){
					margin[i]=margin[i]==='auto'?'auto':parseFloat(margin[i]);
				}
				if(margin.length===1){
					margin=[margin[0],margin[0],margin[0],margin[0]];
				}else if(margin.length===2){
					margin=[margin[0],margin[1],margin[0],margin[1]];
				}else if(margin.length===3){
					margin=[margin[0],margin[1],margin[2],margin[1]];
				}
				if(margin[0]==='auto'||margin[0]<0){
					if(margin[2]==='auto'||margin[2]<0){
						if(option.flip.direction==='rl'||option.flip.direction==='tb'){
							margin[0]=Math.floor(option.height/2)-buttonHeight;
							margin[2]=Math.ceil(option.height/2);
						}else{
							margin[0]=Math.floor(option.height/2);
							margin[2]=Math.ceil(option.height/2)+buttonHeight;
						}
						margin[0]=Math.floor((option.height-buttonHeight)/2);
						margin[2]=Math.ceil((option.height-buttonHeight)/2);
					}else{
						margin[0]=option.height-buttonHeight-margin[2];
					}
				}else{
					if(margin[2]==='auto'||margin[2]<0){
						margin[2]=option.height-buttonHeight-margin[0];
					}else{
						if(option.flip.direction==='rl'||option.flip.direction==='tb'){
							margin[2]=option.height-buttonHeight-margin[0];
						}else{
							margin[0]=option.height-buttonHeight-margin[2];
						}
					}
				}
				if(margin[1]==='auto'||margin[1]<0){
					if(margin[3]==='auto'||margin[3]<0){
						if(option.flip.direction==='bt'||option.flip.direction==='tb'){
							margin[3]=Math.floor((option.width-buttonWidth)/2);
							margin[1]=Math.ceil((option.width-buttonWidth)/2);
						}else if(option.flip.direction==='lr'){
							margin[3]=Math.floor(option.width/2)-buttonWidth;
							margin[1]=Math.ceil(option.width/2);
						}else{
							margin[3]=Math.floor(option.width/2);
							margin[1]=Math.ceil(option.width/2)+buttonWidth;
						}
					}else{
						margin[1]=option.width-buttonWidth-margin[2];
					}
				}else{
					if(margin[3]==='auto'||margin[3]<0){
						margin[3]=option.width-buttonWidth-margin[1];
					}else{
						if(option.flip.direction==='rl'||option.flip.direction==='bt'){
							margin[3]=option.width-buttonWidth-margin[1];
						}else{
							margin[1]=option.width-buttonWidth-margin[3];
						}
					}
				}
				for(var i=0;i<margin.length;i++){
					margin[i]=parseFloat(margin[i]);
				}
				option.prev.css({
					marginTop:margin[0],
					marginLeft:margin[3]
				});
			}
		}
		option.play();
		this.trigger('slideCompleted', [option.list.length]);
		this.trigger('slidePlay', [0, option.list.length]);
		return this;
	};
	jQuery.fn.slide.defaultOption={
		//enum:[random,up,down,left,right,opacity,zoomBig,zoomSmall],default:random
		actionIn:'random',
		//enum:[random,up,down,left,right,opacity,zoomBig,zoomSmall],default:random
		actionOut:'random',
		//enum:[normal,fast,slow,(Number)],default:normal
		speed:'normal',
		//easing,default:linear
		easing:'linear',
		//Number,default:0
		delay:0,
		//Boolean,default:false
		hoverStop:false,

		page:null,
		pageDefault:{
			//enum[hor,ver],default:hor
			direction:'hor',
			hover:true,
			no:true,
			borderWidth:0,
			borderColor:undefined,
			borderHover:undefined,
			bgcolor:undefined,
			bgcolorHover:undefined,
			color:undefined,
			colorHover:undefined,
			//enum[rect,oval,rhomb]
			shape:'rect',
			width:16,
			height:16,
			space:2,
			margin:'auto'
		},
		flip:null,
		flipDefault:{
			//enum[lr,rl,tb,bt]
			direction:'lr',
			next:undefined,
			prev:undefined,
			margin:'auto'
		}
	};
	jQuery.fn.play=function(index){
		if(this.data('slide')){
			this.data('slideOption').play.apply(this.data('slideOption'), arguments);
		}
		return this;
	};
	jQuery.fn.pause=function(index){
		if(this.data('slide')){
			this.data('slideOption').pause.apply(this.data('slideOption'), arguments);
		}
		return this;
	};
	jQuery.fn.resume=function(){
		if(this.data('slide')){
			this.data('slideOption').resume.apply(this.data('slideOption'));
		}
		return this;
	};
	jQuery.fn.playNext=function(){
		if(this.data('slide')){
			this.data('slideOption').playNext.apply(this.data('slideOption'), arguments);
		}
		return this;
	};
	jQuery.fn.playPrev=function(){
		if(this.data('slide')){
			this.data('slideOption').playPrev.apply(this.data('slideOption'), arguments);
		}
		return this;
	};
	jQuery.fn.draw=function(shape,width,height,bgcolor,borderWidth,borderColor){
		if(jQuery.graphics==='html5'){
			var context=this.get(0).getContext('2d');
			context.clearRect(0,0,width,height);
			if(shape==='rect'){
				if(bgcolor){
					context.rect(0,0,width,height);
					context.fillStyle=bgcolor;
					context.fill();
				}
				if(borderWidth>0&&borderColor){
					context.rect(borderWidth*0.5,borderWidth*0.5,width-borderWidth,height-borderWidth);
					context.strokeStyle=borderColor;
					context.lineWidth=borderWidth;
					context.stroke();
				}
			}else if(shape==='oval'){
				if(bgcolor){
					context.save();
					context.translate(width*0.5,height*0.5);
					context.scale(width,height);
					context.beginPath();
					context.arc(0,0,0.5,0,2*Math.PI,false);
					context.closePath();
					context.fillStyle=bgcolor;
					context.fill();
					context.restore();
				}
				if(borderWidth>0&&borderColor){
					context.save();
					context.translate(width*0.5,height*0.5);
					context.scale(width-borderWidth,height-borderWidth);
					context.beginPath();
					context.arc(0,0,0.5,0,2*Math.PI,false);
					context.closePath();
					context.strokeStyle=borderColor;
					context.lineWidth=borderWidth/(Math.max(width,height)-borderWidth);
					context.stroke();
					context.restore();
				}
			}else if(shape==='rhomb'){
				if(bgcolor){
					context.beginPath();
					context.moveTo(width*0.5,0);
					context.lineTo(width,height*0.5);
					context.lineTo(width*0.5,height);
					context.lineTo(0,height*0.5);
					context.closePath();
					context.fillStyle=bgcolor;
					context.fill();
				}
				if(borderWidth>0&&borderColor){
					context.beginPath();
					context.moveTo(width*0.5,borderWidth*0.5);
					context.lineTo(width-borderWidth*0.5,height*0.5);
					context.lineTo(width*0.5,height-borderWidth*0.5);
					context.lineTo(borderWidth*0.5,height*0.5);
					context.closePath();
					context.strokeStyle=borderColor;
					context.lineWidth=borderWidth;
					context.stroke();
					context.restore();
				}
			}
		}else if(jQuery.graphics==='vml'){
			this.html('');
			if(shape==='rect'){
				this.append(jQuery('<v:rect></v:rect>').attr({
					stroked:(borderWidth>0&&borderColor?true:false),
					strokeColor:borderColor,
					strokeWeight:(borderWidth||0)+'px',
					filled:(bgcolor?true:false),
					fillColor:bgcolor
				}).css({
					width:width-borderWidth,
					height:height-borderWidth
				}));
			}else if(shape==='oval'){
				this.append(jQuery('<v:oval></v:oval>').attr({
					stroked:(borderWidth>0&&borderColor?true:false),
					strokeColor:borderColor,
					strokeWeight:(borderWidth||0)+'px',
					filled:(bgcolor?true:false),
					fillColor:bgcolor,
				}).css({
					width:width-borderWidth,
					height:height-borderWidth
				}))
			}else if(shape==='rhomb'){
				var position=borderWidth*1.414;
				this.append(jQuery('<v:polyline></v:polyline>').attr({
					stroked:(borderWidth>0&&borderColor?true:false),
					strokeColor:borderColor,
					strokeWeight:(borderWidth||0)+'px',
					filled:(bgcolor?true:false),
					fillColor:bgcolor,
					points:(width-position)*0.5+','+0+' '+
					(width-position)+','+(height-position)*0.5+' '+
					(width-position)*0.5+','+(height-position)+' '+
					0+','+(height-position)*0.5+' '+
					(width-position)*0.5+','+0+' '+
					(width-position)+','+(height-position)*0.5
				}).css({
					width:width,
					height:height,
					marginLeft:position*0.5,
					marginTop:position*0.5
				}).append('<v:stroke jointype="bevel"></v:stroke>'))
			}
		}
		return this;
	};
})();
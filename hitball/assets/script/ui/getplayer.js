var storage = require("storage");
var res = require("res");

cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    onLoad: function()
    {

        
    },
    initUI: function()
    {
        this.mask = cc.find("mask",this.node);
        this.playerbg = cc.find("playerbg",this.node);
        this.label_coin = cc.find("coinbg/num",this.node).getComponent(cc.Label);
   
        this.btn_close = cc.find("close",this.node);
        this.xiangzi = cc.find("xiangzi",this.node);
        this.label_desc = cc.find("xiangzi/desc",this.node).getComponent(cc.Label);
        this.icon_vedio = cc.find("xiangzi/icon/video",this.node);
        this.icon_share = cc.find("xiangzi/icon/share",this.node);
        this.icon = cc.find("xiangzi/icon",this.node);

        this.playerbg.active = false;

        this.useShare = false;
        this.useCoin = true;

        if(this.game.coin<10)
        {
            this.useCoin = false;
            var videoPath = storage.getVideoPath();
            if(Math.random()>0.5 && videoPath) this.useShare = true;
        }
        else
        {
            if(Math.random()>0.5)
            {
                this.useCoin = false;
                var videoPath = storage.getVideoPath();
                if(Math.random()>0.5 && videoPath) this.useShare = true;
            }
        }

        if(this.useCoin) this.icon.active = false;
        else{
            this.icon.active = true;
            this.icon_vedio.active = !this.useShare;
            this.icon_share.active = this.useShare;
        }
    },

    updateUI: function()
    {
        this.label_coin.string = "x "+this.game.coin;
    },

    openXiangzi: function()
    {
        this.btn_close.active = false;
        this.xiangzi.getComponent(cc.Button).interactable = false;

        var balls = cc.find("balls",this.xiangzi).children;
        var desc = cc.find("desc",this.xiangzi);
        var ball = cc.find("ball",this.xiangzi);
        var ball1 = cc.find("1",ball);
        var ball2 = cc.find("2",ball);
        var ball3 = cc.find("3",ball);
        desc.active = false;
        this.icon.active = false;

        var self = this;

        var openAni = function(){
            ball.parent = self.node;
            ball.position = self.xiangzi.position.add(ball.position);
            ball.runAction(cc.sequence(
                    cc.spawn(
                        cc.moveTo(0.6,cc.v2(0,100)).easing(cc.easeSineIn()),
                        cc.scaleTo(0.6,4),
                        cc.rotateTo(0.6,140)
                        ),
                    cc.callFunc(function(){
                        ball3.active = false;
                        ball1.active = true;
                        ball2.active = true;
                        ball.angle = 0;
                        ball1.runAction(cc.moveBy(0.6,cc.v2(0,400)).easing(cc.easeSineOut()));
                        ball2.runAction(cc.sequence(
                                cc.moveBy(0.6,cc.v2(0,-400)).easing(cc.easeSineOut()),
                                cc.callFunc(function(){
                                    self.randPlayer();
                                })
                            ));
                    })
                ));
        };

        var ballsAni = function(){
            ball.active = true;
            ball.opacity = 0;

            for(var i=0;i<balls.length;i++)
            {
                var r = Math.random();
                if(r>0.5) r = 1;
                else r = -1;
                var ac = cc.repeat(cc.sequence(
                        cc.moveBy(0.1,6*r,6*r).easing(cc.easeSineIn()),
                        cc.moveBy(0.1,-6*r,-6*r).easing(cc.easeSineIn())
                    ),5);
                balls[i].runAction(ac);
            }
            self.xiangzi.runAction(cc.sequence(
                    cc.repeat(cc.sequence(
                        cc.moveBy(0.15,10,10).easing(cc.easeSineIn()),
                        cc.moveBy(0.15,-10,-10).easing(cc.easeSineIn())
                    ),4),
                        cc.callFunc(function(){
                            ball.opacity = 255;
                            ball.runAction(cc.sequence(
                                cc.moveBy(0,0,30),
                                cc.moveBy(0.5,0,-30).easing(cc.easeSineOut()),
                                cc.callFunc(function(){
                                    openAni();
                                })
                            ));   
                    })   
                ));
        };
        this.xiangzi.runAction(cc.sequence(
                cc.moveBy(0.2,0,30).easing(cc.easeSineIn()),
                cc.moveBy(0.2,0,-30).easing(cc.easeSineIn()),
                cc.callFunc(function(){
                    ballsAni();
                })
            ));

       
    },

    randPlayer: function()
    {
        
        this.btn_close.active = true;
        this.mask.active = true;
        this.updateUI();

        var pls = storage.getHasPlayer();

        //判断随机哪一页
        var rands = [];
        for(var i=0;i<cc.config.pagesPlayerIds.length;i++)
        {
            var ids = cc.config.pagesPlayerIds[i];
            for(var j=0;j<ids.length;j++)
            {
                var id = ids[j];

                if(!storage.isHasPlayer(id))
                {
                    rands.push(id);
                }
                if(rands.length>=2)
                    break;
            }
            if(rands.length>=2)
                    break;
        }
        if(pls.length>0)
            rands.push(pls[Math.floor(Math.random()*pls.length)]);

        var playerId = rands[Math.floor(Math.random()*rands.length)];
        var player = cc.instantiate(res["player_player"+playerId]);
        var maxh = player.height;
        for(var i=0;i<player.childrenCount;i++)
        {
            var h = player.children[i].height;
            if(h>maxh) maxh = h;
        }
        player.position = cc.v2(0,-maxh/4);
        this.playerbg.addChild(player);

        this.playerAni = player.getComponent(cc.Animation);
        var animState = this.playerAni.play("player"+playerId);
        animState.repeatCount = 3;

        storage.playSound("audio/player"+playerId);

        storage.addHasPlayer(playerId);
        storage.uploadHasPlayer();
        this.playerId = playerId;

        this.playerbg.active = true;
    },

    sel: function()
    {
        if(this.playerId)
        {
            storage.setPlayer(this.playerId);
            this.game.updatePlayer();

            this.hide();
        }
    },

    show: function()
    {
        this.game = cc.find("Canvas").getComponent("main");

        this.node.sc = this;
        this.initUI();
        this.updateUI();

        var self = this;
        if(cc.gelPlayer)
        {

        }
        else
        {
            this.node.x = -cc.winSize.width;
            this.node.active = true;
            this.node.opacity = 0;
            this.node.runAction(cc.sequence(
                cc.moveBy(0,cc.v2(-cc.winSize.width,0)),
                cc.fadeIn(0),
                cc.moveBy(0.5,cc.winSize.width,0).easing(cc.easeSineIn()),
                cc.callFunc(function(){

                })
            ));

            this.game.node_main.runAction(
                cc.moveBy(0.5,cc.winSize.width,0).easing(cc.easeSineIn())
            );
        }

        //storage.playSound(res.audio_win);
        // cc.sdk.hideBanner();
        cc.sdk.showBanner(false,true);
    },


    hide: function()
    {
        var self = this;
        if(this.playerId || cc.gelPlayer)
        {
            cc.gelPlayer = false;
            this.game.node_main.x = 0;
            this.node.destroy();
            cc.sdk.showBanner(true);
        }
        else
        {
            this.node.runAction(cc.sequence(
                cc.moveBy(0.5,-cc.winSize.width,0).easing(cc.easeSineIn()),
                cc.callFunc(function(){
                    self.node.destroy();
                    cc.sdk.showBanner(true);
                })
            ));
            this.game.node_main.runAction(
                cc.moveBy(0.5,-cc.winSize.width,0).easing(cc.easeSineIn())
            );

        }
    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "xiangzi")
        {
            if(this.useCoin)
            {
                if(this.game.coin>=10)
                {
                    this.game.addCoin(-10);
                    this.openXiangzi();
                }
                else
                {
                    res.showToast("奖牌不足！");
                }
            }
            else
            {
                var self = this;
                if(this.useShare)
                {
                    cc.sdk.share(function(r){
                        if(r) self.openXiangzi();
                    });
                }
                else
                {
                    cc.sdk.showVedio(function(r){
                        if(r) self.openXiangzi();
                    });
                }
            }
           
        }
        else if(data == "sel")
        {
            this.sel();
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});

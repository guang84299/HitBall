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
    },

    updateUI: function()
    {
        this.label_coin.string = "x "+this.game.coin;
    },

    xiangzi: function()
    {
        if(this.game.coin>=10)
        {
            this.game.addCoin(-10);

            this.mask.active = true;
            this.updateUI();

            //var pls = storage.getHasPlayer();
            var playerId = 2;
            var player = cc.instantiate(res["player_player"+playerId]);
            player.position = cc.v2(0,30);
            this.playerbg.addChild(player);

            this.playerAni = player.getComponent(cc.Animation);
            this.playerAni.play("player"+playerId);

            storage.playSound("audio/player"+playerId);

            storage.addHasPlayer(playerId);
        }
    },

    show: function()
    {
        this.game = cc.find("Canvas").getComponent("main");
        this.node.sc = this;
        this.initUI();
        this.updateUI();

        var self = this;
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
        //storage.playSound(res.audio_win);
    },


    hide: function()
    {
        var self = this;
        this.node.runAction(cc.sequence(
                cc.moveBy(0.5,-cc.winSize.width,0).easing(cc.easeSineIn()),
                cc.callFunc(function(){
                    self.node.destroy();
                })
            ));
        this.game.node_main.runAction(
            cc.moveBy(0.5,-cc.winSize.width,0).easing(cc.easeSineIn())
        );

    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "xiangzi")
        {
            this.xiangzi();
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});

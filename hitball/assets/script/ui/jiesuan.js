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
        this.playerbg = cc.find("playerbg",this.node);
        this.label_coin = cc.find("coinbg/num",this.node).getComponent(cc.Label);
        this.label_getcoin = cc.find("getcoinbg/num",this.node).getComponent(cc.Label);
        this.label_hit = cc.find("hitbg/hit",this.node).getComponent(cc.Label);
        this.label_hr = cc.find("hrbg/hr",this.node).getComponent(cc.Label);
        this.label_combo = cc.find("combobg/combo",this.node).getComponent(cc.Label);
        this.label_score = cc.find("scorebg/score",this.node).getComponent(cc.Label);


        var playerId = storage.getPlayer();
        var player = cc.instantiate(res["player_player"+playerId]);
        player.position = cc.v2(0,30);
        this.playerbg.addChild(player);


        this.score = this.game.hitNum*20 + this.game.hrNum*30;
        if(this.game.comboNum>=3) this.score += (this.game.comboNum-2)*10;

        this.getcoin = 0;
        if(this.score<=20)
            this.getcoin = 1;
        else if(this.score>20 && this.score<=100)
            this.getcoin = 2;
        else if(this.score>100 && this.score<=140)
            this.getcoin = 3;
        else if(this.score>140 && this.score<=180)
            this.getcoin = 4;
        else if(this.score>180)
            this.getcoin = 5;

        if(this.getcoin>0)
        {
            this.coin = storage.getCoin();
            this.coin += this.getcoin;
            storage.setCoin(this.coin);

            storage.uploadCoin();
        }


        var highScore = storage.getHighScore();
        if(this.score>highScore)
        {
            storage.setHighScore(this.score);
            storage.uploadHighScore();
        }

        var totalScore = storage.getTotalScore();
        storage.setTotalScore(totalScore+this.score);

        var score = storage.getTotalScore();
        cc.sdk.uploadScore(score);

        var xiangzi = cc.find("gelPlayer/xiangzi",this.node);
        xiangzi.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.5,0.4,0.35).easing(cc.easeSineIn()),
            cc.spawn(
                cc.scaleTo(0.2,0.4,0.4).easing(cc.easeSineIn()),
                cc.moveBy(0.1,0,10).easing(cc.easeSineIn())
            ),
            cc.moveBy(0.1,0,-10).easing(cc.easeSineIn()),
            cc.delayTime(2)
        )));


        storage.uploadTotalScore();

        storage.setGameNum(storage.getGameNum()+1);
        storage.uploadGameNum();
    },

    updateUI: function()
    {
        this.label_hit.string = "好球:"+this.game.hitNum;
        this.label_hr.string = "超级好球:"+this.game.hrNum;
        this.label_combo.string = "连击COMBO:"+this.game.comboNum;
        this.label_score.string = "本局得分:"+this.score;
        this.label_getcoin.string = "+ "+this.getcoin;

        this.label_coin.string = "x "+this.coin;
    },

    again: function()
    {
        this.game.againGame();
        this.hide();
    },

    show: function()
    {
        this.game = cc.find("Canvas").getComponent("game");
        this.node.sc = this;
        this.initUI();
        this.updateUI();

        this.node.active = true;

        //storage.playSound(res.audio_win);
    },


    hide: function()
    {
        this.node.destroy();

    },

    click: function(event,data)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "again")
        {
            this.again();
        }
        else if(data == "home")
        {
            cc.director.loadScene("main");
        }
        else if(data == "share")
        {
            cc.sdk.share(null,"jiesuan");
        }
        else if(data == "gelPlayer")
        {
            cc.gelPlayer = true;
            cc.director.loadScene("main");
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});

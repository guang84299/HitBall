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
        this.label_hit = cc.find("hit",this.node).getComponent(cc.Label);
        this.label_hr = cc.find("hr",this.node).getComponent(cc.Label);
        this.label_combo = cc.find("combo",this.node).getComponent(cc.Label);
        this.label_score = cc.find("score",this.node).getComponent(cc.Label);


        var playerId = storage.getPlayer();
        var player = cc.instantiate(res["player_player"+playerId]);
        player.position = cc.v2(0,30);
        this.playerbg.addChild(player);


        this.score = this.game.hitNum*20 + this.game.hrNum*50;
        this.getcoin = Math.floor(this.score/20);

        this.coin = storage.getCoin();
        this.coin += this.getcoin;
        storage.setCoin(this.coin);

        var highScore = storage.getHighScore();
        if(this.score>highScore)
        {
            storage.setHighScore(this.score);
        }

        var totalScore = storage.getTotalScore();
        storage.setTotalScore(totalScore+this.score);
    },

    updateUI: function()
    {
        this.label_hit.string = "HIT:"+this.game.hitNum;
        this.label_hr.string = "HR:"+this.game.hrNum;
        this.label_combo.string = "Combo:"+this.game.comboNum;
        this.label_score.string = "Score:"+this.score;
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

        storage.playSound(res.audio_button);
        cc.log(data);
    }

    
});

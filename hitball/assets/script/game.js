/**
 * Created by guang on 18/7/18.
 */
var config = require("config");
var storage = require("storage");
var qianqista = require("qianqista");
var sdk = require("sdk");
var res = require("res");


cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function() {
        cc.ginvitelist = [];
        cc.myscene = "game";

        //storage.playMusic(res.audio_music);

        this.initPhysics();
        this.initData();

        this.initUI();
        this.updateUI();

        this.addListener();

        this.startGame();
    },

    initPhysics: function()
    {
        cc.director.getPhysicsManager().enabled = true;
        //cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //cc.PhysicsManager.DrawBits.e_pairBit |
        //cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        //cc.PhysicsManager.DrawBits.e_jointBit |
        //cc.PhysicsManager.DrawBits.e_shapeBit;
        cc.director.getPhysicsManager().debugDrawFlags = 0;
        //cc.PhysicsManager.FIXED_TIME_STEP = 1/30;
        cc.PhysicsManager.VELOCITY_ITERATIONS = 1;
        cc.PhysicsManager.POSITION_ITERATIONS = 1;
        //cc.PhysicsManager.MAX_ACCUMULATOR = cc.PhysicsManager.FIXED_TIME_STEP*2;
        cc.director.getPhysicsManager().enabledAccumulator = false;
        cc.director.getPhysicsManager().gravity = cc.v2(0,-640);

        //cc.director.getPhysicsManager()._debugDrawer.node.group = "game";


        //cc.director.getPhysicsManager().attachDebugDrawToCamera(this.gameCamera);
        //var manager = cc.director.getCollisionManager();
        //manager.enabled = true;
        //manager.enabledDebugDraw = true;
        //manager.enabledDrawBoundingBox = true;

    },


    initData: function()
    {
        this.ballNum = 10;
        this.hitNum = 0;
        this.hrNum = 0;
    },

    initUI: function()
    {
        this.node_game = cc.find("node_game",this.node);
        this.node_ui = cc.find("node_ui",this.node);
        this.playerbg = cc.find("playerbg",this.node_game);

        this.label_ballnum = cc.find("top/ballnum",this.node_ui).getComponent(cc.Label);
        this.label_hitnum = cc.find("top/hitnum",this.node_ui).getComponent(cc.Label);
        this.label_hrnum = cc.find("top/hrnum",this.node_ui).getComponent(cc.Label);
    },

    initPlayer: function()
    {
        this.player = cc.instantiate(res["player_player"+this.playerId]);
        this.player.position = cc.v2(0,30);
        this.playerbg.addChild(this.player);

        this.playerAni = this.player.getComponent(cc.Animation);
    },

    startGame: function()
    {
        this.playerId = storage.getPlayer();
        this.ballNum = 10;
        this.hitNum = 0;
        this.hrNum = 0;
        this.combo = 0;
        this.comboNum = 0;

        this.tarpos = cc.v2(0,0);
        this.state = "stop";

        this.initPlayer();
        this.startPostBall();
    },

    againGame: function()
    {
        this.ballNum = 10;
        this.hitNum = 0;
        this.hrNum = 0;
        this.combo = 0;
        this.comboNum = 0;

        this.state = "stop";
        this.startPostBall();
    },

    startPostBall: function()
    {
        this.schedule(this.postBall.bind(this),3,10);
    },

    postBall: function()
    {
        if(this.ballNum<=0)
        {
            res.openUI("jiesuan");
            return;
        }
        this.ballNum -= 1;

        this.ball = cc.instantiate(res.prefab_ball);
        this.ball.parent = this.node_game;

        var pos = this.player.getChildByName("pos").position;
        pos = this.player.convertToWorldSpaceAR(pos).sub(cc.v2(cc.winSize.width/2,cc.winSize.height/2));
        this.tarpos = pos;
        this.ball.x = -cc.winSize.width/2;
        this.ball.y = 0;
        var body = this.ball.getComponent(cc.RigidBody);

        var disX = Math.abs(this.ball.x-pos.x);
        var disY = pos.y - this.ball.y;

        var speed = (Math.random()-0.5) + 1;

        var x = disX*speed;
        var y = disY/(1/speed)+320*(1/speed);

        body.linearVelocity = cc.v2(x,y);

        this.ball.runAction(cc.sequence(
            cc.delayTime(8),
            cc.fadeOut(1),
            cc.removeSelf()
        ));

        this.state = "start";
        this.updateUI();
    },


    updateUI: function()
    {
        this.label_ballnum.string = "x "+this.ballNum;
        this.label_hitnum.string = "HIT:"+this.hitNum;
        this.label_hrnum.string = "HR:"+this.hrNum;
    },


    addCoin: function(coin,rate)
    {

    },

    showHit: function(type)
    {
        if(type == 1 || type == 2)
        {
            var node = new cc.Node();
            node.addComponent(cc.Sprite);
            node.position = this.tarpos;
            this.node_game.addChild(node);
            res.setSpriteFrame("images/game/hitFire"+type,node);

            node.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.removeSelf()
            ));

            node = new cc.Node();
            node.addComponent(cc.Sprite);
            node.anchorY = 0;
            node.position = cc.v2(-cc.winSize.width/2+150,-cc.winSize.height/2+30);
            this.node_game.addChild(node);
            res.setSpriteFrame("images/game/hit"+type,node);

            node.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.removeSelf()
            ));

            if(type == 1)
            {
                this.hrNum += 1;
            }
            else if(type == 2)
            {
                this.hitNum += 1;
            }

            this.combo ++;

            this.updateUI();

            storage.playSound(config.hitAudio.hit+type);
        }
        else if(type == 3)
        {
            storage.playSound(config.hitAudio.hit+type);

            if(this.combo >=2 && this.combo>this.comboNum)
                this.comboNum = this.combo;
            this.combo = 0;
        }
        else
        {
            if(this.combo >=2 && this.combo>this.comboNum)
                this.comboNum = this.combo;
            this.combo = 0;
        }
    },


    click: function(event,data)
    {
        var self = this;
        if(data == "game1")
        {
        }
        storage.playSound(res.audio_button);
        cc.log(data);
    },


    addListener: function()
    {
        var s = cc.winSize;
        var self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if(this.player.state != "play" && this.state == "start")
            {
                this.player.state = "play";
                var animState = this.playerAni.play("player"+this.playerId);
                //animState.speed = 2;
                storage.playSound("audio/player"+this.playerId);
            }

        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {

        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {

        }, this);
    },


    update: function(dt) {
        cc.director.getPhysicsManager().update(dt);


    }
});
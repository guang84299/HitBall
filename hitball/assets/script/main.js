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
        cc.myscene = "main";

        storage.playMusic(res.audio_music);

        this.initData();

        this.initUI();
        this.updateUI();
        this.updateRed();

        if(cc.gelPlayer)
        {
            res.openUI("getplayer");
        }
        else
        {
            cc.sdk.showBanner(true);
        }
    },


    initData: function()
    {
        this.playerId = storage.getPlayer();
        this.totalScore = storage.getTotalScore();
        this.highScore = storage.getHighScore();
        this.coin = storage.getCoin();
    },

    initUI: function()
    {
        this.node_main = cc.find("node_main",this.node);
        this.display = cc.find("display",this.node);
        this.playerbg = cc.find("playerbg",this.node_main);

        this.label_coin = cc.find("coinbg/num",this.node_main).getComponent(cc.Label);
        this.label_score = cc.find("scorebg/score",this.node_main).getComponent(cc.Label);

        var player = cc.instantiate(res["player_player"+this.playerId]);
        player.position = cc.v2(0,30);
        this.playerbg.addChild(player);

        this.display.active = false;
        //if(sdk.is_iphonex())
        //{
        //    var topNode = cc.find("top",this.node_main);
        //    topNode.runAction(cc.sequence(
        //        cc.delayTime(0.1),
        //        cc.callFunc(function(){
        //            var s = cc.view.getFrameSize();
        //            var dpi = cc.winSize.width/s.width;
        //            topNode.y -= dpi*30;
        //
        //        })
        //    ));
        //}

        this.updateUIControl();

    },


    updateUI: function()
    {
        this.label_coin.string = "x "+this.coin;
        this.label_score.string = "单局最高分/总分："+this.highScore+"/"+this.totalScore;
    },

    updatePlayer: function()
    {
        var playerId = storage.getPlayer();
        if(this.playerId != playerId)
        {
            this.playerId = playerId;

            this.playerbg.destroyAllChildren();
            var player = cc.instantiate(res["player_player"+this.playerId]);
            player.position = cc.v2(0,30);
            this.playerbg.addChild(player);

            storage.uploadPlayer();
        }
    },


    addCoin: function(coin)
    {
        this.coin += coin;
        storage.setCoin(this.coin);
        storage.uploadCoin();
        this.updateUI();
    },


    updateUIControl: function()
    {
        cc.GAME.skipgame = null;
        cc.GAME.share = false;
        cc.GAME.lixianswitch = false;
        cc.GAME.shares = [];
        if(cc.GAME.control.length>0)
        {
            for(var i=0;i<cc.GAME.control.length;i++)
            {
                var con = cc.GAME.control[i];
                if(con.id == "skipgame")
                {
                    if(con.value)
                    {
                        var s = con.value.replace(/\'/g,"\"");
                        cc.GAME.skipgame = JSON.parse(s);
                    }
                }
                else if(con.id.indexOf("share") != -1)
                {
                    if(con.id == "share")
                    {
                        cc.GAME.share = con.value == 1 ? true : false;
                    }
                    else
                    {
                        if(con.value)
                        {
                            var s = con.value.replace(/\'/g,"\"");
                            cc.GAME.shares.push(JSON.parse(s));
                        }
                    }

                }
                else if(con.id == "lixian")
                {
                    cc.GAME.lixianswitch = con.value == 1 ? true : false;
                }
            }

        }

        //this.share_btn.active = cc.GAME.share;
    },

    updateRed: function()
    {
        //签到
        var showQiandao = false;
        var loginDay = storage.getLoginDay();
        var qiandaoNum = storage.getQianDaoNum();
        if(loginDay>qiandaoNum && qiandaoNum<4 && loginDay != 4)
            showQiandao = true;


        cc.find("btns/qiandao/red",this.node_main).active = showQiandao;
    },


    click: function(event,data)
    {
        var self = this;
        if(data == "start")
        {
            cc.sdk.hideBanner();
            cc.director.loadScene("game");
        }
        else if(data == "setting")
        {
            res.openUI("setting");
        }
        else if(data == "choujiang")
        {
            res.openUI("choujiang");
        }
        else if(data == "qiandao")
        {
            res.openUI("qiandao");
        }
        else if(data == "rank")
        {
            if(sdk.judgePower())
                res.openUI("rank");
            else
            {
                res.openUI("power");
                sdk.openSetting(function(r){
                    res.closeUI("power");
                    if(r){
                        res.showToast("成功获取权限！");
                        cc.qianqista.event("授权_允许");
                    }
                    else
                    {
                        res.showToast("请允许授权！");
                        cc.qianqista.event("授权_拒绝");
                    }
                });
            }
        }
        else if(data == "share")
        {
            sdk.share(null,"main");
            cc.qianqista.event("分享有礼_打开");
        }
        else if(data == "selPlayer")
        {
            res.openUI("selplayer");
        }
        else if(data == "getPlayer")
        {
            res.openUI("getplayer");
        }

        storage.playSound(res.audio_button);
        cc.log(data);
    }
});
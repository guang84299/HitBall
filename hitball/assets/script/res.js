/**
 * Created by guang on 19/4/9.
 */

module.exports = {
    coinAniPools:null,
    //proadPools:[],

    audio_music:"audio/music",
    audio_button:"audio/button",
    audio_win:"audio/win",
    audio_baozha:"audio/baozha",



    initPools: function()
    {
        //for (var i = 0; i < 11; i++)
        //{
        //    var pool = new cc.NodePool();
        //    this.proadPools.push(pool);
        //}

        this.coinAniPools = new cc.NodePool();

    },

    getCoinAni: function()
    {
        var coin = null;
        if (this.coinAniPools.size() > 0) {
            coin = this.coinAniPools.get();
        } else {
            coin = cc.instantiate(this["prefab_ui_coinAni"]);
        }
        return coin;
    },

    putCoinAni: function(coin)
    {
        this.coinAniPools.put(coin);
    },

    getToastCoin: function()
    {
        var coin = null;
        if (this.ptoastcoinPools.size() > 0) {
            coin = this.ptoastcoinPools.get();
        } else {
            coin = cc.instantiate(this.ptoastcoin);
        }
        return coin;
    },

    putToastCoin: function(coin)
    {
        this.ptoastcoinPools.put(coin);
    },

    playPlistAnim: function(node,atlas,name,frameNum,time,loop,callback,isRemove,isFlip)
    {
        var frames = [];
        for(var i=0;i<=frameNum;i++)
        {
            var frame = atlas.getSpriteFrame(name+'_'+i);
            frames.push(frame);
        }

        if(loop == -1) loop = 999999999;

        var sp = node.getComponent(cc.Sprite);
        sp.trim = false;
        sp.sizeMode = cc.Sprite.SizeMode.RAW;
        sp.unscheduleAllCallbacks();

        var play = function(){
            var i = 0;
            if(isFlip) i = frameNum;
            sp.schedule(function(){
                sp.spriteFrame = frames[i];
                if(isFlip) i--;
                else i++;
            },time,frameNum);
        };

        var num = 1;
        if(loop>0)
        {
            play();
        }
        sp.schedule(function(){
            if(num>loop)
            {
                if(callback) callback();
                if(isRemove) node.destroy();
            }
            else if(num>1)
                play();
            num ++;
        },time*(frameNum+2),loop);

        return node;
    },

    playPlistAnim2: function(atlas,name,frameNum,time,loop,callback,isRemove,isFlip)
    {
        var node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);

        return this.playPlistAnim(node,atlas,name,frameNum,time,loop,callback,isRemove,isFlip);
    },

    playAnim: function(path,frameNum,time,loop,callback,isRemove,isFlip)
    {
        if(loop == -1) loop = 999999999;

        var node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);
        sp.trim = false;
        sp.sizeMode = cc.Sprite.SizeMode.RAW;
        var self = this;

        var play = function(){
            var i = 0;
            if(isFlip) i = frameNum;
            sp.schedule(function(){
               self.setSpriteFrame(path+"/"+i,sp);
                if(isFlip) i--;
                else i++;
            },time,frameNum-1);
        };

        var num = 1;
        if(loop>0)
        {
            play();
        }
        sp.schedule(function(){
            if(num>loop)
            {
                if(callback) callback();
                if(isRemove) node.destroy();
            }
            else if(num>1)
                play();
            num ++;
        },time*(frameNum+2),loop);

        return node;
    },


    setSpriteFrame: function(url,sp)
    {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if(!err && sp && cc.isValid(sp))
            {
                sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
            }
        });
    },

    loadPic: function(url,sp)
    {
        cc.loader.load({url: url, type: 'png'}, function (err, tex) {
            if(err)
            {
                cc.log(err);
            }
            else
            {
                if(cc.isValid(sp))
                {
                    var spriteFrame = new cc.SpriteFrame(tex);
                    sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
                }
            }
        });
    },

    showToast: function(str)
    {
        var toast = cc.instantiate(this["prefab_ui_toast"]);
        cc.find("label",toast).getComponent("cc.Label").string = str;
        cc.find("Canvas").addChild(toast,10000);
        toast.opacity = 0;
        toast.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(2),
            cc.fadeOut(0.3),
            cc.removeSelf()
        ));
    },

    showCoin: function(coin,pos,parent)
    {
        var self = this;
        var node = this.getCoinAni();
        var label = node.getComponent("cc.Label");
        label.fontSize = 30;
        label.string = coin;
        //var outline = node.addComponent(cc.LabelOutline);
        if(pos)
            node.position = cc.v2(200,pos.y-200);
        if(!parent)parent = cc.find("Canvas");
        parent.addChild(node,10000);

        //if(Math.random()>0.5) node.x = 200;
        //else node.x = -200;

        node.opacity = 255;
        node.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.7,pos).easing(cc.easeSineOut()),
                cc.scaleTo(0.2,1.2).easing(cc.easeSineIn())
            ),
            cc.spawn(
                cc.scaleTo(0.2,0.2).easing(cc.easeSineIn()),
                cc.fadeOut(0.2)
            ),
            cc.callFunc(function(){
                self.putCoinAni(node);
            })
        ));
    },

    showCoinAni: function()
    {
        var toast = cc.instantiate(this["prefab_anim_coinani"]);
        cc.find("Canvas").addChild(toast,10000);
        toast.runAction(cc.sequence(
            cc.delayTime(1),
            cc.removeSelf()
        ));
    },

    openUI: function(name,parent,showType)
    {
        if(!parent) parent = cc.find("Canvas");
        if(parent)
        {
            var node = parent.getChildByName("ui_"+name);
            if(node)
            {
                //node.active = true;
                node.getComponent(name).show(showType);
                return;
            }
        }
        cc.loader.loadRes("prefab/ui/"+name, function(err, prefab)
        {
            if(err)
            {
                console.log("init error "+name,err);
            }
            else
            {
                var node = cc.instantiate(prefab);
                node.name = "ui_"+name;
                parent.addChild(node);
                node.getComponent(name).show(showType);
            }
        });
    },

    closeUI: function(name,parent)
    {
        if(!parent) parent = cc.find("Canvas");
        if(parent)
        {
            var node = parent.getChildByName("ui_"+name);
            if(node)
            {
                node.destroy();
            }
        }
    },

    openPrefab: function(path,parent,callback)
    {
        if(!parent) parent = cc.find("Canvas");
        cc.loader.loadRes("prefab/"+path, function(err, prefab)
        {
            if(err)
            {
                console.log("init error "+path,err);
            }
            else
            {
                var node = cc.instantiate(prefab);
                parent.addChild(node);
                if(callback)callback(node);
            }
        });
    },

    //judgeUIRed: function(name,callback)
    //{
    //    cc.loader.loadRes("prefab/ui/"+name, function(err, prefab)
    //    {
    //        if(err)
    //        {
    //            console.log("init error "+name,err);
    //        }
    //        else
    //        {
    //            var node = cc.instantiate(prefab);
    //            var b = node.getComponent(name).judgeRed();
    //            if(callback) callback(b);
    //        }
    //    });
    //},

    isRestTime: function(time1,time2)
    {
        time1 = new Date(time1);
        time2 = new Date(time2);


        if(time2.getFullYear() != time1.getFullYear())
        {
            return true;
        }
        else if(time2.getMonth() != time1.getMonth())
        {
            return true;
        }
        else if(time2.getDate() != time1.getDate())
        {
            return true;
        }
        else
        {
            return false;
        }
    }


};